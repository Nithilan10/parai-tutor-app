import {
  isTamilBeatSequence,
  parseTamilBeatSequence,
} from "@/lib/tamilBeatNotation";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Play a Tamil sequence with short vs long gaps (ms) after each stroke.
 * @param {string} tamilStr
 * @param {{ shortMs?: number, longMs?: number }} opts
 */
export async function playTamilBeatSequence(tamilStr, opts = {}) {
  const shortMs = opts.shortMs ?? 110;
  const longMs = opts.longMs ?? 450;
  const { timeline } = parseTamilBeatSequence(tamilStr);
  for (const step of timeline) {
    const url =
      step.stroke === "tha"
        ? "/audio/tha.wav"
        : step.stroke === "theem"
          ? "/audio/theem.wav"
          : "/audio/ku.wav";
    try {
      const a = new Audio(url);
      await a.play();
    } catch {
      /* ignore missing file / autoplay */
    }
    const wait =
      step.gapAfter === "short" ? shortMs : step.gapAfter === "long" ? longMs : 0;
    if (wait) await sleep(wait);
  }
}

/** Play one beat row from the API (Tamil sequence or legacy single clip). */
export async function playBeatSound(beat) {
  if (!beat?.name) return;
  if (isTamilBeatSequence(beat.name)) {
    await playTamilBeatSequence(beat.name);
    return;
  }
  const url = beat.audioUrl || `/audio/${String(beat.name).toLowerCase()}.mp3`;
  try {
    const a = new Audio(url);
    await a.play();
  } catch {
    /* ignore */
  }
}
