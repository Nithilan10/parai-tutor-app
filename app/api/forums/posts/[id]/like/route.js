import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth-config";

const prisma = new PrismaClient();

export async function POST(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to like" }, { status: 401 });
    }

    const postId = params?.id;
    if (!postId) {
      return NextResponse.json({ error: "Missing post" }, { status: 400 });
    }

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = await prisma.forumLike.findUnique({
      where: {
        userId_postId: { userId: session.user.id, postId },
      },
    });

    if (existing) {
      await prisma.forumLike.delete({ where: { id: existing.id } });
      const count = await prisma.forumLike.count({ where: { postId } });
      return NextResponse.json({ liked: false, likeCount: count });
    }

    await prisma.forumLike.create({
      data: { userId: session.user.id, postId },
    });
    const count = await prisma.forumLike.count({ where: { postId } });
    return NextResponse.json({ liked: true, likeCount: count });
  } catch (err) {
    console.error("POST like:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
