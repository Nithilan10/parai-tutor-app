import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PARAI_VIDEO_EMBEDS } from "@/lib/paraiVideoLibrary";
import { aiReelModel, PRISMA_REELS_SETUP_HINT } from "@/lib/prismaReels";

const prisma = new PrismaClient();

/**
 * GET — preloaded embeds + AiGeneratedReel rows, deduped by video id.
 */
export async function GET() {
  try {
    const reel = aiReelModel(prisma);
    const dbRows = reel
      ? await reel.findMany({
          orderBy: { createdAt: "asc" },
        })
      : [];
    if (!reel) {
      console.warn(`GET /api/video-library/reels: ${PRISMA_REELS_SETUP_HINT}`);
    }

    const seen = new Set();
    const merged = [];

    for (const item of PARAI_VIDEO_EMBEDS) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push({ id: item.id, title: item.title, caption: item.caption, source: "curated" });
    }

    for (const row of dbRows) {
      if (seen.has(row.videoId)) continue;
      seen.add(row.videoId);
      merged.push({
        id: row.videoId,
        title: row.title,
        caption: row.caption,
        source: row.source || "openai",
      });
    }

    return NextResponse.json({
      ok: true,
      preloadedCount: PARAI_VIDEO_EMBEDS.length,
      aiStoredCount: dbRows.length,
      merged,
      ...(reel ? {} : { prismaReelsReady: false, setupHint: PRISMA_REELS_SETUP_HINT }),
    });
  } catch (e) {
    console.error("GET /api/video-library/reels:", e);
    return NextResponse.json(
      { ok: false, error: "Server error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
