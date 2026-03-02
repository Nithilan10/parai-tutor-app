import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const nilaiId = searchParams.get("nilaiId");

    if (!nilaiId) {
      return NextResponse.json({ error: "nilaiId required" }, { status: 400 });
    }

    const beats = await prisma.beat.findMany({
      where: { nilaiId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ beats }, { status: 200 });
  } catch (err) {
    console.error("GET /api/tutorials/nilai/beat error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
