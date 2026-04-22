/**
 * In-process hourly cap for OpenAI reel-generation calls (serverless: per instance).
 * Set REELS_AI_OPENAI_CALLS_PER_HOUR (default 24).
 */
export function consumeOpenAIReelGenerationSlot() {
  const max = Math.max(1, Number(process.env.REELS_AI_OPENAI_CALLS_PER_HOUR || 24));
  const hour = Math.floor(Date.now() / 3600000);
  const st = (globalThis.__paraiReelOpenAiSlots ||= { hour, n: 0 });
  if (st.hour !== hour) {
    st.hour = hour;
    st.n = 0;
  }
  if (st.n >= max) return false;
  st.n += 1;
  return true;
}

/** Max DB rows added per clock hour (default 200). */
export async function assertInsertBudget(prisma, limit) {
  const max = Math.max(10, Number(limit ?? process.env.REELS_AI_MAX_INSERTS_PER_HOUR ?? 200));
  if (typeof prisma?.aiGeneratedReel?.count !== "function") {
    return { ok: false, count: 0, max, remaining: 0, missingModel: true };
  }
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.aiGeneratedReel.count({
    where: { createdAt: { gte: since } },
  });
  const remaining = Math.max(0, max - count);
  if (remaining <= 0) {
    return { ok: false, count, max, remaining: 0 };
  }
  return { ok: true, count, max, remaining };
}
