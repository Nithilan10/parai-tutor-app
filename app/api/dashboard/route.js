import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const nilais = await prisma.nilai.findMany({
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

    const progressByBeatId = new Map(progress.map(p => [p.beatId, p.status]));

    const payload = nilais.map(n => {
      const total = n.beats.length;
      const completed = n.beats.filter(b => progressByBeatId.get(b.id) === "completed").length;
      const inProgress = n.beats.filter(b => progressByBeatId.get(b.id) === "in_progress").length;

      return {
        id: n.id,
        name: n.name,
        order: n.order,
        beatsCount: total,
        completedCount: completed,
        inProgressCount: inProgress,
      };
    });

    return NextResponse.json({ nilais: payload }, { status: 200 });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { beatId, status } = await req.json();
    if (!beatId || !status) {
      return NextResponse.json({ error: "Missing beatId or status" }, { status: 400 });
    }

    const result = await prisma.userBeatProgress.upsert({
      where: {
        userId_beatId: { userId: session.user.id, beatId: String(beatId) },
      },
      update: { status },
      create: { userId: session.user.id, beatId: String(beatId), status },
    });

    return NextResponse.json({ ok: true, progress: result }, { status: 200 });
  } catch (err) {
    console.error("POST /api/dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
