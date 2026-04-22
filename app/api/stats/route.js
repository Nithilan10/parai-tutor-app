import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const firstTutorial = await prisma.tutorial.findFirst({ orderBy: { createdAt: "asc" } });
    const nilais = await prisma.nilai.findMany({
      ...(firstTutorial?.id ? { where: { tutorialId: firstTutorial.id } } : {}),
      select: {
        id: true,
        name: true,
        order: true,
        beats: { select: { id: true } },
      },
      orderBy: { order: "asc" },
    });

    const progress = await prisma.userBeatProgress.findMany({
      where: { userId: session.user.id },
      select: { beatId: true, status: true },
    });

    const progressByBeatId = new Map(progress.map((p) => [p.beatId, p.status]));

    const totalBeats = nilais.reduce((a, n) => a + n.beats.length, 0);
    const completedBeats = nilais.reduce((a, n) => {
      return a + n.beats.filter((b) => progressByBeatId.get(b.id) === "completed").length;
    }, 0);

    return NextResponse.json({
      totalBeats,
      completedBeats,
      percentComplete: totalBeats ? Math.round((completedBeats / totalBeats) * 100) : 0,
      nilaisCount: nilais.length,
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
