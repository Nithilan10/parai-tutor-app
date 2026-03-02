import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Nilai ID required" }, { status: 400 });
    }

    const nilai = await prisma.nilai.findUnique({
      where: { id },
      include: {
        beats: { orderBy: { order: "asc" } },
        tutorial: { select: { id: true, title: true } },
      },
    });

    if (!nilai) {
      return NextResponse.json({ error: "Nilai not found" }, { status: 404 });
    }

    return NextResponse.json(nilai, { status: 200 });
  } catch (err) {
    console.error("GET /api/nilai/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
