import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCanonicalSequencesForNilai, syncCanonicalNilaiBeats } from "@/lib/repairNilaiBeats";

const prisma = new PrismaClient();

async function syncAllCanonicalNilais(nilais) {
  let anyUpdated = false;
  for (const n of nilais) {
    if (getCanonicalSequencesForNilai(n) && (await syncCanonicalNilaiBeats(prisma, n))) {
      anyUpdated = true;
    }
  }
  return anyUpdated;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let tutorialId = searchParams.get("tutorialId");

    if (!tutorialId) {
      const first = await prisma.tutorial.findFirst({ orderBy: { createdAt: "asc" } });
      tutorialId = first?.id ?? null;
    }

    const listArgs = {
      ...(tutorialId ? { where: { tutorialId } } : {}),
      orderBy: { order: "asc" },
      include: { beats: { orderBy: { order: "asc" } } },
    };

    let nilais = await prisma.nilai.findMany(listArgs);

    if (nilais.some((n) => getCanonicalSequencesForNilai(n)) && (await syncAllCanonicalNilais(nilais))) {
      nilais = await prisma.nilai.findMany(listArgs);
    }

    return NextResponse.json({ nilais }, { status: 200 });
  } catch (err) {
    console.error("GET /api/tutorials/nilai error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
