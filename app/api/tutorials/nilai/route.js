import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorialId = searchParams.get("tutorialId");

    const nilais = tutorialId
      ? await prisma.nilai.findMany({
          where: { tutorialId },
          orderBy: { order: "asc" },
          include: { beats: { orderBy: { order: "asc" } } },
        })
      : await prisma.nilai.findMany({
          orderBy: { order: "asc" },
          include: { beats: { orderBy: { order: "asc" } } },
        });

    return NextResponse.json({ nilais }, { status: 200 });
  } catch (err) {
    console.error("GET /api/tutorials/nilai error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
