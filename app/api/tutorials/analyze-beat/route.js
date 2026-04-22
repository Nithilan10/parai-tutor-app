import { NextResponse } from "next/server";
import { buildFeedbackReport } from "@/utils/beatFeedback";
import { getOpenAI, getOpenAIModel } from "@/lib/openaiClient";

export async function POST(req) {
  let targetNotation = "";
  let playedBeats = [];
  let baseUnitMs = 300;
  let source = "camera";
  let targetBeatLabel = "";
  /** @type {string[]|null} */
  let expectedStrokesInOrderClient = null;
  /** @type {string[]|null} */
  let detectedStrokesInOrderClient = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const rawTarget = form.get("targetBeat");
      const rawNotation = form.get("targetNotation");
      const rawPlayed = form.get("playedBeats");
      const rawLabel = form.get("targetBeatLabel");

      if (typeof rawNotation === "string") {
        targetNotation = rawNotation;
      } else if (typeof rawTarget === "string") {
        try {
          const parsed = JSON.parse(rawTarget);
          targetNotation = parsed.join(" ");
        } catch {
          targetNotation = "";
        }
      }

      if (typeof rawPlayed === "string") {
        try {
          playedBeats = JSON.parse(rawPlayed);
        } catch {
          playedBeats = [];
        }
      }
      const gap = form.get("baseUnitMs") || form.get("idealGapMs");
      if (gap != null) baseUnitMs = Number(gap) || 300;
      const src = form.get("source");
      if (typeof src === "string") source = src;
      if (typeof rawLabel === "string") targetBeatLabel = rawLabel;
    } else {
      const body = await req.json();
      targetNotation = body.targetNotation || (body.targetBeat?.join(" ") ?? "");
      playedBeats = body.playedBeats ?? [];
      baseUnitMs = Number(body.baseUnitMs || body.idealGapMs) || 300;
      source = body.source || "camera";
      targetBeatLabel = typeof body.targetBeatLabel === "string" ? body.targetBeatLabel : "";
      if (Array.isArray(body.expectedStrokesInOrder)) {
        expectedStrokesInOrderClient = body.expectedStrokesInOrder.map((x) => String(x ?? ""));
      }
      if (Array.isArray(body.detectedStrokesInOrder)) {
        detectedStrokesInOrderClient = body.detectedStrokesInOrder.map((x) => String(x ?? ""));
      }
    }

    if (!targetNotation && playedBeats.length === 0) {
      return NextResponse.json(
        { error: "targetNotation or targetBeat is required." },
        { status: 400 }
      );
    }

    const report = buildFeedbackReport({
      targetNotation,
      playedBeats,
      baseUnitMs,
      source,
    });

    const expectedStrokesInOrder =
      expectedStrokesInOrderClient?.length > 0 ? expectedStrokesInOrderClient : report.targetPattern;
    const detectedStrokesInOrder =
      detectedStrokesInOrderClient?.length > 0 ? detectedStrokesInOrderClient : report.playedStrokesInOrder;

    let aiNarrative = null;
    const openai = getOpenAI();
    if (openai) {
      try {
        const coachingPayload = {
          expectedStrokesInOrder,
          detectedStrokesInOrder,
          targetPatternTryingToPlay: targetNotation,
          targetBeatCardsOrLabel: targetBeatLabel || null,
          targetStrokesInOrder: report.targetPattern,
          playedStrokesInOrder: report.playedStrokesInOrder,
          interBeatGapsMsObserved: report.interBeatGapsMs,
          expectedInterBeatGapsMs: report.expectedInterBeatGapsMs,
          timingGapComparison: report.timingGapComparison,
          playedTimeline: report.playedTimeline,
          baseUnitMs,
          summary: report.summary,
          issues: report.issues,
          suggestions: report.suggestions,
          timing: report.timing,
          comparison: {
            matched: report.comparison.matched,
            targetLength: report.comparison.targetLength,
            playedLength: report.comparison.playedLength,
          },
        };

        const completion = await openai.chat.completions.create({
          model: getOpenAIModel(),
          messages: [
            {
              role: "system",
              content: `You are an expert Parai (Tamil frame drum) teacher.

The JSON always includes two lists you must compare directly:
1) expectedStrokesInOrder — the lesson target as canonical strokes in order: tha, ku, theem. (தி thi and கு ku are the same as ku.)
2) detectedStrokesInOrder — what the camera or tap rhythm recorded, same canonical names, in order.

Walk beat-by-beat: for each index i, compare expectedStrokesInOrder[i] to detectedStrokesInOrder[i] when both exist; call out missing or extra strokes and wrong types.

Timing (required for camera): use playedTimeline for each stroke’s timestampMs, msAfterPrevious, and gapAfterMsUntilNext. Compare interBeatGapsMsObserved to expectedInterBeatGapsMs pairwise, and timingGapComparison for expected vs observed gap and deltaMs. Mention if gaps are consistently early/late. Vision detection adds jitter; timing.toleranceMs reflects allowed deviation.

Also in the JSON: targetPatternTryingToPlay, summary, issues, comparison.

Be encouraging and specific. 2–4 short paragraphs. Do not invent strokes that are not in the JSON.`,
            },
            {
              role: "user",
              content: JSON.stringify(coachingPayload),
            },
          ],
          max_tokens: 700,
        });
        aiNarrative = completion.choices[0]?.message?.content?.trim() || null;
      } catch (e) {
        console.error("OpenAI feedback error:", e);
      }
    }

    const fallbackNarrative = [report.summary, ...report.suggestions]
      .filter(Boolean)
      .join("\n\n");

    return NextResponse.json({
      ok: true,
      report,
      feedback: aiNarrative || fallbackNarrative,
      detailedFeedback: aiNarrative,
      usedAI: Boolean(aiNarrative),
    });
  } catch (error) {
    console.error("analyze-beat:", error);
    return NextResponse.json(
      { error: "Failed to analyze beat", detail: String(error?.message || error) },
      { status: 500 }
    );
  }
}
