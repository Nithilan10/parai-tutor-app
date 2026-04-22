import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth-config";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const uid = session?.user?.id;

    const posts = await prisma.forumPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true } },
        ...(uid
          ? { likes: { where: { userId: uid }, select: { id: true } } }
          : {}),
      },
    });

    const shaped = posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      videoUrl: p.videoUrl,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        name: p.author.name || p.author.email?.split("@")[0] || "Learner",
      },
      likeCount: p._count.likes,
      likedByMe: Boolean(uid && p.likes && p.likes.length > 0),
    }));

    return NextResponse.json({ posts: shaped });
  } catch (err) {
    console.error("GET /api/forums/posts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to post" }, { status: 401 });
    }

    const body = await req.json();
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (text.length < 2) {
      return NextResponse.json({ error: "Post body is required" }, { status: 400 });
    }

    const title =
      typeof body.title === "string" && body.title.trim() ? body.title.trim() : null;
    const videoUrl =
      typeof body.videoUrl === "string" && body.videoUrl.trim()
        ? body.videoUrl.trim()
        : null;

    const post = await prisma.forumPost.create({
      data: {
        authorId: session.user.id,
        title,
        body: text,
        videoUrl,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        videoUrl: post.videoUrl,
        createdAt: post.createdAt,
        author: {
          id: post.author.id,
          name: post.author.name || post.author.email?.split("@")[0] || "Learner",
        },
        likeCount: post._count.likes,
        likedByMe: false,
      },
    });
  } catch (err) {
    console.error("POST /api/forums/posts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
