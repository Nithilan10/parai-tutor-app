/**
 * One-shot OpenAI connectivity check (no Next server required).
 * Usage: node scripts/test-openai.mjs
 * Loads OPENAI_API_KEY from .env in cwd if not already set.
 */
import { existsSync, readFileSync } from "fs";
import OpenAI from "openai";

function loadEnvFile() {
  if (process.env.OPENAI_API_KEY || !existsSync(".env")) return;
  const raw = readFileSync(".env", "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k && !(k in process.env)) process.env[k] = v;
  }
}

loadEnvFile();

const key = process.env.OPENAI_API_KEY;
if (!key || key === "YOUR_API_KEY") {
  console.error("FAIL: set OPENAI_API_KEY in your environment or .env");
  process.exit(1);
}

const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
const openai = new OpenAI({ apiKey: key });

const t0 = Date.now();
try {
  const completion = await openai.chat.completions.create({
    model,
    max_tokens: 12,
    messages: [
      { role: "system", content: "Reply with exactly: ok" },
      { role: "user", content: "ping" },
    ],
  });
  const ms = Date.now() - t0;
  const text = completion.choices[0]?.message?.content?.trim();
  console.log("OK", { model, latencyMs: ms, reply: text });
  process.exit(0);
} catch (e) {
  console.error("FAIL", { model, error: String(e?.message || e) });
  process.exit(1);
}
