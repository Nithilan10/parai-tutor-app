/**
 * Curated Parai / Tamil arts videos (YouTube embed IDs).
 * Titles reflect public listing text; open on YouTube for full attribution.
 */
export const PARAI_VIDEO_EMBEDS = [
  {
    id: "b1-Cgx3Rmrc",
    title: "How to play parai — Lesson 1 (Part 1)",
    caption: "Beginner strokes and posture — Tamil audio.",
  },
  {
    id: "PZ5uMVdRP8g",
    title: "Parai basic beats (Thudumbu / frame drum context)",
    caption: "Basic beat patterns and demonstration.",
  },
  {
    id: "wFxD1vRy3S4",
    title: "Parai easy beat — practice clip",
    caption: "Short-form practice rhythm.",
  },
  {
    id: "TMhP_tPpuuY",
    title: "Learn parai — community lesson clip",
    caption: "Learning-focused short video.",
  },
];

/** Curated list for the Shorts-style reels strip (Tamil arts / parai). */
export const PARAI_ARTS_REELS = PARAI_VIDEO_EMBEDS;

export function youtubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/** Vertical reel embed: muted autoplay when `autoplay` is true (browser autoplay policies). */
export function youtubeReelEmbedUrl(videoId, autoplay = false) {
  const q =
    "rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white" +
    (autoplay ? "&autoplay=1&mute=1" : "");
  return `https://www.youtube.com/embed/${videoId}?${q}`;
}

export function youtubePosterUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
