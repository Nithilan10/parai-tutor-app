import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error("GET /api/auth/sqlauth error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
