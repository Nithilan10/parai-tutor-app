import {
  isTamilBeatSequence,
  parseTamilBeatSequence,
  tamilTimelineToTargetPattern,
  tamilExpectedInterBeatGapMs,
} from "@/lib/tamilBeatNotation";

const GESTURE_HINTS = {
  theem: "both sticks together (Theem)",
  ku: "Ku — same note as தி (thi) and கு",
  tha: "left-hand stroke (Tha)",
  ka: "left-hand / alternative tha (Ka)",
  thee: "same note as Ku (தி ≡ கு)",
  thi: "same note as Ku (தி ≡ கு)",
};

export function normalizeGesture(g) {
  return String(g ?? "")
    .toLowerCase()
    .trim();
}

/** Map vision / legacy labels to canonical keys for comparison */
export function canonicalStrokeKey(g) {
  const x = normalizeGesture(g);
  if (x === "thi" || x === "ku" || x === "thee") return "ku";
  if (x === "tha" || x === "ka") return "tha";
  if (x === "theem") return "theem";
  return x;
}

/**
 * Parses notation into beat objects with timing weights.
 * - (single dash) = short gap (0.5x)
 * -- (double dash) = long gap (2.0x)
 * [space] = steady gap (1.0x)
 */
export function parseNotation(notationStr) {
  if (!notationStr) return [];
  
  const beats = [];
  // Match a word (beat name) followed by optional dashes and spaces
  const regex = /([a-z]+)([- ]*)/gi;
  let match;
  
  const matches = [...notationStr.matchAll(regex)];
  
  matches.forEach((m, i) => {
    const name = m[1].toLowerCase();
    const sep = m[2];
    const isLast = i === matches.length - 1;
    
    let gapWeight = 1.0;
    if (isLast) {
      gapWeight = 0;
    } else if (sep.includes("--")) {
      gapWeight = 2.0;
    } else if (sep.includes("-")) {
      gapWeight = 0.5;
    } else {
      gapWeight = 1.0; // space or single character undashed gap
    }

    beats.push({ name, gapWeight });
  });
  
  return beats;
}

export function extractPlayedSequence(playedBeats) {
  if (!Array.isArray(playedBeats)) return [];
  return playedBeats.map((item, i) => {
    if (typeof item === "string") {
      return { gesture: normalizeGesture(item), index: i, timestampMs: null };
    }
    const gesture = normalizeGesture(
      item.gesture ?? item.stroke ?? item.name ?? item.label ?? ""
    );
    const timestampMs =
      item.timestampMs ?? item.atMs ?? item.t ?? item.time ?? null;
    return { gesture, index: i, timestampMs };
  });
}

export function compareToTarget(targetPattern, playedNormalized) {
  const errors = [];
  let matched = 0;
  const maxLen = Math.max(targetPattern.length, playedNormalized.length);

  for (let i = 0; i < maxLen; i++) {
    const exp = typeof targetPattern[i] === "string" ? targetPattern[i] : targetPattern[i]?.name;
    const got = playedNormalized[i]?.gesture;
    const expCanon = canonicalStrokeKey(exp);
    const gotCanon = canonicalStrokeKey(got);

    if (exp === undefined) {
      errors.push({
        index: i,
        type: "extra",
        expected: null,
        got,
        explanation: `Extra stroke at position ${i + 1} (${got || "?"}). The pattern should end after ${targetPattern.length} beats.`,
      });
      continue;
    }
    if (got === undefined || got === "") {
      errors.push({
        index: i,
        type: "missing",
        expected: exp,
        got: null,
        explanation: `Missing stroke at beat ${i + 1}: expected "${exp}" (${GESTURE_HINTS[exp] || exp}).`,
      });
      continue;
    }
    if (expCanon !== gotCanon) {
      errors.push({
        index: i,
        type: "wrong",
        expected: exp,
        got,
        explanation: `At beat ${i + 1}, expected "${exp}" (${GESTURE_HINTS[exp] || exp}) but you played "${got}" (${GESTURE_HINTS[got] || got}).`,
      });
    } else {
      matched++;
    }
  }

  return {
    matched,
    errors,
    targetLength: targetPattern.length,
    playedLength: playedNormalized.filter((p) => p.gesture).length,
  };
}

/**
 * @param {{ toleranceMs?: number }} [opts]
 */
export function analyzeTiming(playedWithTimes, targetPattern, baseUnitMs = 300, opts = {}) {
  const withTimes = playedWithTimes.filter(
    (p) => typeof p.timestampMs === "number" && !Number.isNaN(p.timestampMs)
  );
  
  if (withTimes.length < 2) {
    return {
      available: false,
      reason: "Need at least two strokes to measure timing gaps.",
    };
  }

  // targetPattern is an array of objects from parseNotation [{name, gapWeight}, ...]
  const times = withTimes.map((p) => p.timestampMs);
  const gaps = [];
  for (let i = 1; i < times.length; i++) {
    gaps.push(times[i] - times[i - 1]);
  }

  const issues = [];
  const toleranceMs = typeof opts.toleranceMs === "number" ? opts.toleranceMs : 80;

  gaps.forEach((gap, i) => {
    if (i >= targetPattern.length - 1) return; // No target gap for last beat
    
    const weight = targetPattern[i].gapWeight;
    const expectedGap = weight * baseUnitMs;
    const delta = gap - expectedGap;

    if (Math.abs(delta) > toleranceMs) {
      issues.push({
        betweenBeats: [i + 1, i + 2],
        gapMs: Math.round(gap),
        expectedGap,
        deltaMs: Math.round(delta),
        severity: Math.abs(delta) > 200 ? "high" : "medium",
        text: delta > 0 
          ? `Gap between beat ${i + 1} and ${i + 2} is too long (${Math.round(delta)}ms extra). Keep it ${weight === 1 ? "tighter" : "steady"}.`
          : `Gap between beat ${i + 1} and ${i + 2} is too short (${Math.round(-delta)}ms early).`,
      });
    }
  });

  return {
    available: true,
    baseUnitMs,
    gapsMs: gaps.map((g) => Math.round(g)),
    issues,
    toleranceMs,
  };
}

function computeInterBeatGapsMs(played) {
  const gaps = [];
  for (let i = 1; i < played.length; i++) {
    const t0 = played[i - 1]?.timestampMs;
    const t1 = played[i]?.timestampMs;
    if (typeof t0 === "number" && typeof t1 === "number") {
      gaps.push(Math.round(t1 - t0));
    }
  }
  return gaps;
}

function expectedInterBeatGapsMsFromPattern(targetPattern, baseUnitMs) {
  const gaps = [];
  for (let i = 0; i < targetPattern.length - 1; i++) {
    gaps.push(Math.round(targetPattern[i].gapWeight * baseUnitMs));
  }
  return gaps;
}

/** Per-stroke timestamps and gaps for models (camera latency is noisier than taps). */
function buildPlayedTimeline(played) {
  return played.map((p, i) => {
    const prev = played[i - 1];
    const next = played[i + 1];
    const t = p.timestampMs;
    const msAfterPrevious =
      i > 0 &&
      typeof prev?.timestampMs === "number" &&
      typeof t === "number" &&
      !Number.isNaN(t)
        ? Math.round(t - prev.timestampMs)
        : null;
    const gapAfterMsUntilNext =
      typeof t === "number" &&
      typeof next?.timestampMs === "number" &&
      !Number.isNaN(next.timestampMs)
        ? Math.round(next.timestampMs - t)
        : null;
    return {
      position: i + 1,
      stroke: canonicalStrokeKey(p.gesture),
      rawGesture: p.gesture,
      timestampMs: typeof t === "number" && !Number.isNaN(t) ? Math.round(t) : null,
      msAfterPrevious,
      gapAfterMsUntilNext,
    };
  });
}

export function buildFeedbackReport({
  targetNotation, // e.g. "ku-ku tha" or Tamil beat line(s)
  playedBeats,
  baseUnitMs = 300,
  source = "camera",
}) {
  let targetPattern;
  let expectedInterBeatGapsMs = [];

  if (isTamilBeatSequence(targetNotation)) {
    const { timeline } = parseTamilBeatSequence(targetNotation);
    if (timeline.length) {
      targetPattern = tamilTimelineToTargetPattern(timeline);
      expectedInterBeatGapsMs = tamilExpectedInterBeatGapMs(targetNotation, baseUnitMs);
    } else {
      targetPattern = parseNotation(targetNotation);
      expectedInterBeatGapsMs = expectedInterBeatGapsMsFromPattern(targetPattern, baseUnitMs);
    }
  } else {
    targetPattern = parseNotation(targetNotation);
    expectedInterBeatGapsMs = expectedInterBeatGapsMsFromPattern(targetPattern, baseUnitMs);
  }

  const played = extractPlayedSequence(playedBeats);
  const comparison = compareToTarget(targetPattern, played);
  const timingToleranceMs =
    source === "camera" || source === "vision" ? 125 : 82;
  const timing = analyzeTiming(played, targetPattern, baseUnitMs, {
    toleranceMs: timingToleranceMs,
  });
  const interBeatGapsMs = computeInterBeatGapsMs(played);
  const playedStrokesInOrder = played.map((p) => canonicalStrokeKey(p.gesture));
  const playedTimeline = buildPlayedTimeline(played);

  const timingGapComparison = interBeatGapsMs.map((observed, i) => {
    const expected = expectedInterBeatGapsMs[i];
    if (expected == null) return null;
    return {
      betweenStrokePositions: [i + 1, i + 2],
      observedGapMs: observed,
      expectedGapMs: expected,
      deltaMs: Math.round(observed - expected),
    };
  }).filter(Boolean);

  const suggestions = [];
  if (comparison.errors.some((e) => e.type === "wrong")) {
    suggestions.push("Focus on the stroke order first—Right (ku) vs Left (tha) vs Both (theem).");
  }
  if (timing.available && timing.issues.length) {
    suggestions.push(
      isTamilBeatSequence(targetNotation)
        ? "Tamil phrases: tight clusters = short gaps; spaces between word groups = long gaps."
        : "Listen to the dash cadence: dashes are quick, spaces are longer rests."
    );
  }

  const summaryParts = [];
  summaryParts.push(
    `Stroke match: ${comparison.matched}/${comparison.targetLength} correct.`
  );
  if (timing.available) {
    summaryParts.push(
      timing.issues.length === 0 
        ? "Perfect rhythm balance!" 
        : `${timing.issues.length} timing inconsistency detected.`
    );
  }

  return {
    source,
    targetNotation,
    targetPattern: targetPattern.map((b) => b.name),
    playedStrokesInOrder,
    interBeatGapsMs,
    expectedInterBeatGapsMs,
    playedTimeline,
    timingGapComparison,
    played: played.map((p) => ({
      gesture: p.gesture,
      timestampMs: p.timestampMs,
    })),
    comparison,
    timing,
    suggestions,
    summary: summaryParts.join(" "),
    issues: [
      ...comparison.errors.map((e) => ({ kind: e.type, index: e.index, explanation: e.explanation })),
      ...(timing.issues || []).map((t) => ({ kind: "timing", index: null, explanation: t.text })),
    ],
    gestureHints: GESTURE_HINTS,
  };
}
