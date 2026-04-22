/**
 * Call the app API to grow the AI reel pool (run dev server first, DB migrated).
 *
 *   APP_URL=http://localhost:3000 REELS_GENERATE_KEY=secret node scripts/bootstrap-ai-reels.mjs
 *
 * Defaults: 5 batches × 20 suggestions (throttled server-side).
 */
const base = process.env.APP_URL || "http://localhost:3000";
const key = process.env.REELS_GENERATE_KEY || "";

const batches = Math.min(5, Math.max(1, Number(process.env.REELS_BATCHES || 5)));
const batchSize = Math.min(20, Math.max(1, Number(process.env.REELS_BATCH_SIZE || 20)));

const url = `${base.replace(/\/$/, "")}/api/video-library/reels/generate`;
console.log("POST", url, { batches, batchSize });

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(key ? { "x-reels-key": key } : {}),
  },
  body: JSON.stringify({ batches, batchSize }),
});

const data = await res.json().catch(() => ({}));
console.log(res.status, data);
process.exit(res.ok ? 0 : 1);
