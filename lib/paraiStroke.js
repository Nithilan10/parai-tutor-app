/**
 * Map beat names and vision gestures to canonical stroke keys for Parai practice.
 * Right hand → thee (Thi/Thee/Ku), left → tha (Tha/Ka), both → theem.
 */

export const STROKE_LABELS = {
  ku: "Ku — right (கு)",
  tha: "Tha — left (த)",
  theem: "Both hands together",
  thee: "Right (legacy)",
};

/** @param {string} name */
export function beatNameToStrokeKey(name) {
  const n = (name || "").toLowerCase().trim();
  if (n === "thi" || n === "thee") return "ku";
  if (n === "tha") return "tha";
  if (n === "theem") return "theem";
  if (n === "ku") return "ku";
  if (n === "ka") return "tha";
  return null;
}

/** Normalize gesture string from detector or tap UI (Tamil practice: ku / tha / theem). */
export function normalizeGestureKey(gesture) {
  const g = (gesture || "").toLowerCase().trim();
  if (g === "ku" || g === "thi" || g === "thee") return "ku";
  if (g === "tha" || g === "ka") return "tha";
  if (g === "theem") return "theem";
  return g;
}
