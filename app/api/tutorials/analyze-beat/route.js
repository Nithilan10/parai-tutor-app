import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "YOUR_API_KEY", // Replace with your own API key or use environment variables
});

export async function POST(req) {
  try {
    const { targetBeat, playedBeats } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a parai teacher. Your student is learning to play a specific beat. Compare the student's played beat with the target beat and provide constructive feedback. Be encouraging and specific in your feedback.",
        },
        {
          role: "user",
          content: `The target beat is: ${targetBeat.join(" - ")}. The student played: ${playedBeats.join(" - ")}. Please provide feedback.`,
        },
      ],
    });

    return NextResponse.json({ feedback: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error analyzing beat:", error);
    return NextResponse.json({ error: "Failed to analyze beat" }, { status: 500 });
  }
}
