/**
 * Prisma client must be regenerated after adding AiGeneratedReel (`npx prisma generate`).
 * Turbopack/dev sometimes serves a cached client — restart dev after generate.
 */
export function aiReelModel(prisma) {
  const m = prisma?.aiGeneratedReel;
  if (m && typeof m.findMany === "function") return m;
  return null;
}

export const PRISMA_REELS_SETUP_HINT =
  "Run `npx prisma generate` then `npx prisma db push` (or migrate), and restart `next dev`.";
