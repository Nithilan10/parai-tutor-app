import { getOpenAI, getOpenAIModel } from "@/lib/openaiClient";
import { extractYoutubeVideoId, youtubeThumbnailExists } from "@/lib/youtubeReelUtils";

const MAX_BATCH = 20;
const MAX_BATCHES_PER_REQUEST = 5;

/**
 * @param {number} batchSize
 * @param {string[]} excludeIds
 * @returns {Promise<{ items: { id: string, title: string, caption: string }[], rawError?: string }>}
 */
export async function fetchReelSuggestionsFromOpenAI(batchSize, excludeIds) {
  const openai = getOpenAI();
  if (!openai) {
    return { items: [], rawError: "OPENAI_API_KEY not configured" };
  }

  const n = Math.min(Math.max(1, batchSize), MAX_BATCH);
  const exclude = excludeIds.slice(0, 200).join(", ");

  const completion = await openai.chat.completions.create({
    model: getOpenAIModel(),
    response_format: { type: "json_object" },
    temperature: 0.35,
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content: `You help curate educational YouTube clips about Tamil arts: parai / frame drum, folk rhythm, koothu, classical dance (Bharatanatyam etc.), Carnatic performance, Tamil cultural music.

Return strict JSON: { "items": [ { "videoId": string, "title": string, "caption": string } ] }

Rules:
- videoId must be exactly 11 characters as used in youtube.com/watch?v=
- ONLY include videoIds you are confident are real, publicly embeddable YouTube videos. If unsure, omit the item — never guess an ID.
- Prefer parai lessons, short demonstrations, and Tamil arts performances.
- title and caption: concise English; caption max ~120 chars.
- Return at most ${n} items.`,
      },
      {
        role: "user",
        content: `Suggest up to ${n} new items. Do not repeat any of these video IDs: ${exclude || "(none)"}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) return { items: [], rawError: "Empty OpenAI response" };

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { items: [], rawError: "Invalid JSON from model" };
  }

  const rawList = Array.isArray(parsed.items) ? parsed.items : [];
  const items = [];

  for (const row of rawList) {
    const id =
      extractYoutubeVideoId(row.videoId) ||
      extractYoutubeVideoId(row.url) ||
      extractYoutubeVideoId(row.youtubeUrl);
    if (!id || excludeIds.includes(id)) continue;
    const title = String(row.title || "Tamil arts clip").slice(0, 200);
    const caption = String(row.caption || "").slice(0, 240);
    items.push({ id, title, caption });
  }

  return { items };
}

/**
 * Drop IDs that fail thumbnail HEAD check (bounded parallelism for serverless timeouts).
 * @param {{ id: string, title: string, caption: string }[]} items
 * @returns {Promise<typeof items>}
 */
export async function filterExistingYoutubeIds(items) {
  const out = [];
  const concurrency = 6;
  for (let i = 0; i < items.length; i += concurrency) {
    const slice = items.slice(i, i + concurrency);
    // eslint-disable-next-line no-await-in-loop
    const flags = await Promise.all(slice.map((it) => youtubeThumbnailExists(it.id)));
    for (let j = 0; j < slice.length; j++) {
      if (flags[j]) out.push(slice[j]);
    }
  }
  return out;
}

export { MAX_BATCH, MAX_BATCHES_PER_REQUEST };
