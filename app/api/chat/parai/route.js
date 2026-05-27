import { NextResponse } from "next/server";
import { getOpenAI, getOpenAIModel } from "@/lib/openaiClient";

const SYSTEM = `You are the Parai Chatbot for Parai Tutor — a friendly expert on the Tamil parai frame drum, parai attam, rhythm patterns (nilai), strokes, history, and practice tips.

Guidelines:
- Answer clearly for beginners and intermediate learners.
- When the user asks for videos, articles, or resources, add a section at the end titled "## Online resources" with 4–8 bullet points. Each bullet must be a markdown link. Prefer:
  - YouTube search links: https://www.youtube.com/results?search_query=ENCODED_QUERY (use queries like "Parai drum tutorial Tamil" or "Parai attam performance").
  - Wikipedia or reputable cultural/education pages when you know a stable URL; otherwise use a search link to DuckDuckGo or Google: https://duckduckgo.com/?q=ENCODED_QUERY
- Do not invent specific video titles as if you watched them; phrase as "Search: …" when linking to search results.
- Keep a warm, respectful tone toward Tamil cultural context.`;

export async function POST(req) {
  try {
    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        {
          error:
            "OpenAI is not configured. Set OPENAI_API_KEY in your environment (see .env.example).",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const messagesIn = Array.isArray(body.messages) ? body.messages : [];
    const history = messagesIn
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
      .map((m) => ({
        role: m.role,
        content: String(m.content).slice(0, 12000),
      }))
      .slice(-24);

    if (!history.length || history[history.length - 1].role !== "user") {
      return NextResponse.json({ error: "Send a user message" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: getOpenAIModel(),
      max_tokens: 4096,
      messages: [{ role: "system", content: SYSTEM }, ...history],
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Parai chat API:", err);
    return NextResponse.json(
      { error: err.message || "Chat request failed" },
      { status: 500 }
    );
  }
}
