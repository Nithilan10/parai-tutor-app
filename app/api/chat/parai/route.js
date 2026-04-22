import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Anthropic API key is not configured. Add ANTHROPIC_API_KEY to your environment.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const messagesIn = Array.isArray(body.messages) ? body.messages : [];
    const messages = messagesIn
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
      .map((m) => ({
        role: m.role,
        content: String(m.content).slice(0, 12000),
      }))
      .slice(-24);

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Send a user message" }, { status: 400 });
    }

    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Parai chat API:", err);
    return NextResponse.json(
      { error: err.message || "Chat request failed" },
      { status: 500 }
    );
  }
}
