import {
  NILAI_1_SEQUENCES,
  NILAI_2_SEQUENCES,
  NILAI_3_SEQUENCES,
  NILAI_4_SEQUENCES,
  tamilSequenceToEnglishType,
} from "./tamilBeatNotation.js";

export const CANONICAL_BEATS_BY_NILAI_NAME = {
  "Nilai 1": NILAI_1_SEQUENCES,
  "Nilai 2": NILAI_2_SEQUENCES,
  "Nilai 3": NILAI_3_SEQUENCES,
  "Nilai 4": NILAI_4_SEQUENCES,
};

function normalizeNilaiName(name) {
  if (!name || typeof name !== "string") return "";
  return name.replace(/\s+/g, " ").trim();
}

/**
 * Resolve Tamil beat rows for a nilai row even when `name` drifted (casing, spacing)
 * or only `order` 1–4 is reliable.
 * @param {{ name: string, order?: number }} nilai
 */
export function getCanonicalSequencesForNilai(nilai) {
  const raw = nilai?.name;
  const norm = normalizeNilaiName(raw);
  if (CANONICAL_BEATS_BY_NILAI_NAME[raw]) return CANONICAL_BEATS_BY_NILAI_NAME[raw];
  if (norm && CANONICAL_BEATS_BY_NILAI_NAME[norm]) return CANONICAL_BEATS_BY_NILAI_NAME[norm];
  for (const key of Object.keys(CANONICAL_BEATS_BY_NILAI_NAME)) {
    if (key.toLowerCase() === norm.toLowerCase()) return CANONICAL_BEATS_BY_NILAI_NAME[key];
  }
  const m = norm.match(/^nilai\s*(\d+)$/i) || norm.match(/^(\d+)$/);
  if (m) {
    const k = `Nilai ${m[1]}`;
    if (CANONICAL_BEATS_BY_NILAI_NAME[k]) return CANONICAL_BEATS_BY_NILAI_NAME[k];
  }
  const o = Number(nilai?.order);
  if (o >= 1 && o <= 4) {
    const k = `Nilai ${o}`;
    return CANONICAL_BEATS_BY_NILAI_NAME[k] ?? null;
  }
  return null;
}

function canonicalBeatsMatchRows(beats, sequences) {
  if (!sequences || !Array.isArray(beats)) return false;
  const ordered = [...beats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (ordered.length !== sequences.length) return false;
  return sequences.every((tamil, i) => ordered[i]?.name === tamil);
}

/**
 * Replace beat rows with canonical Tamil lines when nilai is Nilai 1–4 and DB drifts
 * (empty rows, wrong count, or outdated strings). Clears UserBeatProgress for removed beat IDs.
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {{ id: string, name: string, order?: number, beats: { id: string, name: string, order: number }[] }} nilai
 * @returns {Promise<boolean>} true if DB was updated
 */
export async function syncCanonicalNilaiBeats(prisma, nilai) {
  const sequences = getCanonicalSequencesForNilai(nilai);
  if (!sequences) return false;

  const ordered = [...(nilai.beats || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  if (canonicalBeatsMatchRows(ordered, sequences)) return false;

  const beatIds = ordered.map((b) => b.id).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    if (beatIds.length) {
      await tx.userBeatProgress.deleteMany({ where: { beatId: { in: beatIds } } });
    }
    await tx.beat.deleteMany({ where: { nilaiId: nilai.id } });
    for (let i = 0; i < sequences.length; i++) {
      const tamil = sequences[i];
      await tx.beat.create({
        data: {
          nilaiId: nilai.id,
          name: tamil,
          type: tamilSequenceToEnglishType(tamil),
          order: i,
          audioUrl: null,
        },
      });
    }
  });

  return true;
}

/**
 * @deprecated Prefer syncCanonicalNilaiBeats — kept for call sites that only filled empty nilais.
 */
export async function createCanonicalBeatsIfEmpty(prisma, nilai) {
  return syncCanonicalNilaiBeats(prisma, nilai);
}
