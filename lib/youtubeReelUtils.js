/** YouTube video id: 11 chars, alphanumeric + _ - */
const ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * @param {string} input watch URL, youtu.be, embed URL, or raw id
 * @returns {string|null}
 */
export function extractYoutubeVideoId(input) {
  if (!input || typeof input !== "string") return null;
  const s = input.trim();
  if (ID_RE.test(s)) return s;
  try {
    const u = new URL(s, "https://example.com");
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").slice(0, 11);
      return ID_RE.test(id) ? id : null;
    }
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
      const s2 = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (s2) return s2[1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Cheap existence check (thumbnail 404 = bad id).
 * @param {string} videoId
 * @param {number} [timeoutMs]
 * @returns {Promise<boolean>}
 */
export async function youtubeThumbnailExists(videoId, timeoutMs = 3500) {
  if (!videoId || !ID_RE.test(videoId)) return false;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, {
      method: "HEAD",
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}
