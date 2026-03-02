import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tutorials = await prisma.tutorial.findMany({
      include: {
        nilais: {
          orderBy: { order: "asc" },
          include: { beats: { orderBy: { order: "asc" } } },
        },
      },
    });
    return NextResponse.json({ tutorials }, { status: 200 });
  } catch (err) {
    console.error("GET /api/tutorials error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
