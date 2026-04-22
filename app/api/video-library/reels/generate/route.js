import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PARAI_VIDEO_EMBEDS } from "@/lib/paraiVideoLibrary";
import {
  fetchReelSuggestionsFromOpenAI,
  filterExistingYoutubeIds,
  MAX_BATCH,
  MAX_BATCHES_PER_REQUEST,
} from "@/lib/aiReelGeneration";
import {
  consumeOpenAIReelGenerationSlot,
  assertInsertBudget,
} from "@/lib/reelOpenAIRateLimit";
import { aiReelModel, PRISMA_REELS_SETUP_HINT } from "@/lib/prismaReels";

const prisma = new PrismaClient();

function authorize(req) {
  const key = process.env.REELS_GENERATE_KEY;
  if (process.env.NODE_ENV === "production") {
    if (!key) return false;
    return req.headers.get("x-reels-key") === key;
  }
  if (!key) return true;
  return req.headers.get("x-reels-key") === key;
}

/**
 * POST — generate reel metadata via OpenAI, validate thumbnails, insert unique IDs.
 * Body: { batchSize?: number, batches?: number } — batches 1..5, batchSize 1..20.
 * Header x-reels-key: REELS_GENERATE_KEY when set.
 */
export async function POST(req) {
  if (!authorize(req)) {
    if (process.env.NODE_ENV === "production" && !process.env.REELS_GENERATE_KEY) {
      return NextResponse.json(
        { ok: false, error: "Reel generation disabled: set REELS_GENERATE_KEY in production" },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let batchSize = MAX_BATCH;
  let batches = 1;
  try {
    const body = await req.json().catch(() => ({}));
    batchSize = Math.min(MAX_BATCH, Math.max(1, Number(body.batchSize) || MAX_BATCH));
    batches = Math.min(MAX_BATCHES_PER_REQUEST, Math.max(1, Number(body.batches) || 1));
  } catch {
    /* defaults */
  }

  const reel = aiReelModel(prisma);
  if (!reel) {
    return NextResponse.json(
      { ok: false, error: "Prisma client has no AiGeneratedReel model.", setupHint: PRISMA_REELS_SETUP_HINT },
      { status: 503 }
    );
  }

  let insertBudget = await assertInsertBudget(prisma);
  if (!insertBudget.ok) {
    if (insertBudget.missingModel) {
      return NextResponse.json(
        { ok: false, error: "AiGeneratedReel unavailable.", setupHint: PRISMA_REELS_SETUP_HINT },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Hourly insert budget exhausted",
        insertsThisHour: insertBudget.count,
        limit: insertBudget.max,
      },
      { status: 429 }
    );
  }

  const existingDb = await reel.findMany({ select: { videoId: true } });
  const excludeIds = new Set([
    ...PARAI_VIDEO_EMBEDS.map((x) => x.id),
    ...existingDb.map((r) => r.videoId),
  ]);

  const inserted = [];
  const errors = [];
  let openAiError = null;

  for (let b = 0; b < batches; b++) {
    if (!consumeOpenAIReelGenerationSlot()) {
      errors.push({ batch: b, error: "OpenAI hourly call limit reached (this server instance)" });
      break;
    }

    insertBudget = await assertInsertBudget(prisma);
    if (!insertBudget.ok || insertBudget.remaining <= 0) {
      errors.push({ batch: b, error: "Insert budget exhausted mid-run" });
      break;
    }

    // eslint-disable-next-line no-await-in-loop
    const { items: rawItems, rawError } = await fetchReelSuggestionsFromOpenAI(
      batchSize,
      [...excludeIds]
    );

    if (rawError) {
      openAiError = rawError;
      errors.push({ batch: b, error: rawError });
      break;
    }

    const fresh = rawItems.filter((it) => !excludeIds.has(it.id));
    // eslint-disable-next-line no-await-in-loop
    const validated = await filterExistingYoutubeIds(fresh);

    for (const it of validated) {
      if (excludeIds.has(it.id)) continue;
      insertBudget = await assertInsertBudget(prisma);
      if (!insertBudget.ok || insertBudget.remaining <= 0) break;
      try {
        // eslint-disable-next-line no-await-in-loop
        await reel.create({
          data: {
            videoId: it.id,
            title: it.title,
            caption: it.caption,
            source: "openai",
          },
        });
        excludeIds.add(it.id);
        inserted.push(it);
      } catch (err) {
        if (String(err?.code) === "P2002") {
          excludeIds.add(it.id);
          continue;
        }
        errors.push({ videoId: it.id, error: String(err?.message || err) });
      }
    }
  }

  return NextResponse.json({
    ok: inserted.length > 0 || errors.length === 0,
    insertedCount: inserted.length,
    inserted,
    errors: errors.length ? errors : undefined,
    openAiError: openAiError || undefined,
    hint:
      process.env.REELS_GENERATE_KEY &&
      "Send header x-reels-key with REELS_GENERATE_KEY to authorize generation.",
  });
}
