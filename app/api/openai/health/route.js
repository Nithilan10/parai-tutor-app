import { NextResponse } from "next/server";
import { getOpenAI, getOpenAIModel } from "@/lib/openaiClient";

/**
 * GET — minimal OpenAI call to verify API key and network.
 */
export async function GET() {
  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json(
      {
        ok: false,
        error: "OPENAI_API_KEY missing or placeholder",
      },
      { status: 503 }
    );
  }

  const t0 = Date.now();
  try {
    const completion = await openai.chat.completions.create({
      model: getOpenAIModel(),
      max_tokens: 16,
      messages: [
        { role: "system", content: "Reply with exactly: ok" },
        { role: "user", content: "ping" },
      ],
    });
    const ms = Date.now() - t0;
    const text = completion.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({
      ok: true,
      model: getOpenAIModel(),
      latencyMs: ms,
      replyPreview: text.slice(0, 80),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e),
        latencyMs: Date.now() - t0,
      },
      { status: 502 }
    );
  }
}
