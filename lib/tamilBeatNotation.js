/**
 * Tamil parai stroke notation:
 * - த = tha; கு = ku; தி (thi) is the same note as ku — both emit stroke "ku".
 * - தீம் = theem (both sticks).
 * Spaces between groups = longer gap; no space inside a group = shorter gaps between strokes.
 */

/** Building blocks for long Nilai 2–4 clusters */
const _TKU = "\u0BA4\u0B95\u0BC1\u0B95\u0BC1"; // தகுகு
const _TIKU = "\u0BA4\u0BBF\u0B95\u0BC1"; // திகு
const _KUT = "\u0B95\u0BC1\u0BA4"; // குத
const _KKU = "\u0B95\u0BC1\u0B95\u0BC1"; // குகு (two ku)
const _TK = "\u0BA4\u0B95\u0BC1"; // தகு
const _KU_KU_TH_KU = "\u0B95\u0BC1\u0B95\u0BC1\u0BA4\u0B95\u0BC1"; // ku ku tha ku
/** Nilai 2 line 2: தகுகு + திகு + குத + குகு (16 graphemes; missing க breaks tokenization). */
const _NILAI2_L2_REST = _TKU + _TIKU + _KUT + _KKU;

/**
 * Longest prefix wins (sorted by length). Strokes: tha, ku, theem.
 */
const TAMIL_LEXICON_RAW = [
  {
    prefix: _KUT + _KKU + _KUT + _KKU + _KUT + "\u0B95\u0BC1",
    strokes: ["ku", "tha", "ku", "ku", "ku", "tha", "ku", "ku", "ku", "tha", "ku"],
  }, // குதகுகுதகுகுதகு
  {
    prefix: _KU_KU_TH_KU + _KU_KU_TH_KU + "\u0BA4\u0B95\u0BC1",
    strokes: ["ku", "ku", "tha", "ku", "ku", "ku", "tha", "ku", "tha", "ku"],
  }, // குகுதகுதகுதகு
  {
    prefix: _TKU + _TIKU + _KUT + _KKU,
    strokes: ["tha", "ku", "ku", "ku", "ku", "ku", "tha", "ku", "ku"],
  }, // தகுகுதிகுதகுகு
  {
    prefix: _TKU + _TKU + _TK,
    strokes: ["tha", "ku", "ku", "tha", "ku", "ku", "tha", "ku"],
  }, // தகுகுதகுகுதகு
  {
    prefix: "\u0BA4\u0BC0\u0BAE\u0BCD\u0B95\u0BC1\u0BA4",
    strokes: ["theem", "ku", "tha"],
  }, // தீம்குத
  { prefix: "\u0B95\u0BC1\u0B95\u0BC1\u0BA4\u0B95\u0BC1", strokes: ["ku", "ku", "tha", "ku"] }, // குகுதகு
  { prefix: "\u0B95\u0BC1\u0BA4\u0B95\u0BC1\u0BA4\u0B95\u0BC1", strokes: ["ku", "tha", "ku", "tha", "ku"] }, // குதகுதகு
  { prefix: "\u0B95\u0BC1\u0BA4\u0B95\u0BC1", strokes: ["ku", "tha", "ku"] }, // குதகு
  { prefix: "\u0B95\u0BC1\u0B95\u0BC1\u0BA4", strokes: ["ku", "ku", "tha"] }, // குகுத
  { prefix: "\u0BA4\u0BC0\u0BAE\u0BCD", strokes: ["theem"] }, // தீம்
  { prefix: "\u0BA4\u0BBF\u0B95\u0BC1", strokes: ["ku", "ku"] }, // திகு
  { prefix: "\u0BA4\u0B95\u0BC1\u0B95\u0BC1", strokes: ["tha", "ku", "ku"] }, // தகுகு
  { prefix: "\u0BA4\u0B95\u0BC1", strokes: ["tha", "ku"] }, // தகு
  { prefix: "\u0B95\u0BC1\u0BA4", strokes: ["ku", "tha"] }, // குத
  { prefix: "\u0B95\u0BC1", strokes: ["ku"] }, // கு
  { prefix: "\u0BA4\u0BBF", strokes: ["ku"] }, // தி
  { prefix: "\u0BA4", strokes: ["tha"] }, // த
];

const TAMIL_LEXICON = [...TAMIL_LEXICON_RAW].sort((a, b) => b.prefix.length - a.prefix.length);

/** True if string contains Tamil letters (beat stored as Tamil sequence). */
export function isTamilBeatSequence(str) {
  if (!str || typeof str !== "string") return false;
  return /[\u0B80-\u0BFF]/.test(str);
}

/** Tokenize one non-space segment into ordered strokes. */
export function tokenizeTamilSegment(segment) {
  const strokes = [];
  let i = 0;
  const s = segment;
  while (i < s.length) {
    let matched = false;
    for (const { prefix, strokes: add } of TAMIL_LEXICON) {
      if (s.startsWith(prefix, i)) {
        strokes.push(...add);
        i += prefix.length;
        matched = true;
        break;
      }
    }
    if (!matched) i += 1;
  }
  return strokes;
}

/**
 * @returns {{
 *   timeline: { stroke: 'tha'|'ku'|'theem', gapAfter: 'short'|'long'|'none' }[],
 *   flatStrokes: string[]
 * }}
 */
export function parseTamilBeatSequence(tamilStr) {
  const raw = (tamilStr || "").trim();
  if (!raw) return { timeline: [], flatStrokes: [] };

  const groupStrings = raw.split(/\s+/).filter(Boolean);
  const timeline = [];

  for (let g = 0; g < groupStrings.length; g++) {
    const strokes = tokenizeTamilSegment(groupStrings[g]);
    const isLastGroup = g === groupStrings.length - 1;
    for (let k = 0; k < strokes.length; k++) {
      const isLastInGroup = k === strokes.length - 1;
      let gapAfter = "none";
      if (!isLastInGroup) gapAfter = "short";
      else if (!isLastGroup) gapAfter = "long";
      timeline.push({ stroke: strokes[k], gapAfter });
    }
  }

  return {
    timeline,
    flatStrokes: timeline.map((t) => t.stroke),
  };
}

/**
 * Target rows for beatFeedback: { name, gapWeight }[].
 * gapWeight matches parseNotation semantics (0.5 = short, 2 = long) for analyzeTiming.
 */
export function tamilTimelineToTargetPattern(timeline) {
  return timeline.map((step, i) => {
    const isLast = i === timeline.length - 1;
    let gapWeight = 0;
    if (!isLast) {
      /* Weights × baseUnitMs match playTamilBeat short/long (~110 / ~450 ms at base 300). */
      if (step.gapAfter === "short") gapWeight = 110 / 300;
      else if (step.gapAfter === "long") gapWeight = 450 / 300;
      else gapWeight = 1.0;
    }
    return { name: step.stroke, gapWeight };
  });
}

/** Expected ms between consecutive strokes (same ratios as playback: short ~110, long ~450 at base 300). */
export function tamilExpectedInterBeatGapMs(tamilStr, baseUnitMs = 300) {
  const shortMs = Math.max(80, Math.round(baseUnitMs * (110 / 300)));
  const longMs = Math.max(200, Math.round(baseUnitMs * (450 / 300)));
  const { timeline } = parseTamilBeatSequence(tamilStr);
  const gaps = [];
  for (let i = 0; i < timeline.length - 1; i++) {
    const g = timeline[i].gapAfter;
    if (g === "short") gaps.push(shortMs);
    else if (g === "long") gaps.push(longMs);
    else gaps.push(0);
  }
  return gaps;
}

/** Human-readable English pattern: groups separated by " | " (long gap). */
export function tamilSequenceToEnglishType(tamilStr) {
  const { timeline } = parseTamilBeatSequence(tamilStr);
  if (!timeline.length) return "";

  const parts = [];
  let group = [];
  for (const step of timeline) {
    group.push(step.stroke);
    if (step.gapAfter === "long" || step.gapAfter === "none") {
      parts.push(group.join(" "));
      group = [];
    }
  }
  if (group.length) parts.push(group.join(" "));
  return parts.join(" | ");
}

/** Canonical stroke for vision / taps (tha, ku, theem). */
export function normalizeTamilPracticeStroke(gesture) {
  const g = String(gesture || "")
    .toLowerCase()
    .trim();
  if (g === "thee" || g === "thi") return "ku";
  if (g === "ku") return "ku";
  if (g === "tha" || g === "ka") return "tha";
  if (g === "theem") return "theem";
  return g;
}

export const NILAI_1_SEQUENCES = [
  "த குகுகு த குகுகு த குகுகு த த",
  "த த த குகுகு",
  "தகுகுதகுகு",
  "தகுகுதகு",
];

export const NILAI_2_SEQUENCES = [
  "தீம் தீம் தகுகுதகு",
  "தி " + _NILAI2_L2_REST,
  "தீம் குதகுகுதகுகுதகு",
  "திகு தகுகுதகுகுதகு",
];

export const NILAI_3_SEQUENCES = [
  "தீம் தகு த தகு த தகு தகுகு தகு",
  "திகு திகு தகுகு தகு",
  "தகு குத",
  "தகு குதகுதகு",
];

export const NILAI_4_SEQUENCES = [
  "தீம் குத குகுதகு குதகுகு",
  "தீம் குத குகுதகுதகுதகு",
  "தீம்குத த த த தத த த",
  "தீம்குத த த",
];
