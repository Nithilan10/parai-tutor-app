import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const emailRaw = body.email;
    const passwordRaw = body.password;
    const nameRaw = body.name;

    const email =
      typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
    const password = typeof passwordRaw === "string" ? passwordRaw : "";
    const name = typeof nameRaw === "string" ? nameRaw.trim() : "";

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "User created",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/auth/register:", err);
    return NextResponse.json(
      { error: err?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
