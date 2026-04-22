import OpenAI from "openai";

/**
 * @returns {OpenAI | null}
 */
export function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === "YOUR_API_KEY") return null;
  return new OpenAI({ apiKey: key });
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}
