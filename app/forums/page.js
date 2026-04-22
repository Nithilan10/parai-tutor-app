"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart, Loader2, Video, MessageCircle } from "lucide-react";
import { decorImagery } from "@/lib/localImagery";

function youtubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function ForumsPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/forums/posts", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async (postId) => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch(`/api/forums/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likedByMe: data.liked, likeCount: data.likeCount } : p
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    if (status !== "authenticated" || !body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/forums/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, videoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((p) => [data.post, ...p]);
        setTitle("");
        setBody("");
        setVideoUrl("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={decorImagery.sceneA.src}
          alt={decorImagery.sceneA.alt}
          fill
          className="object-cover opacity-80"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-red-950/40" />
        <div className="absolute bottom-4 left-0 right-0 px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Community forums</h1>
          <p className="text-red-100 text-sm mt-1">Share progress, clips, and cheer each other on.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {status === "authenticated" ? (
          <form
            onSubmit={submitPost}
            className="rounded-3xl glass-panel-strong border-red-400/20 p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle size={22} className="text-red-500" /> New post
            </h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full rounded-xl border border-red-400/20 bg-white/50 dark:bg-black/20 px-4 py-2 text-slate-900 dark:text-white text-sm"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="How is your Parai practice going?"
              rows={4}
              className="w-full rounded-xl border border-red-400/20 bg-white/50 dark:bg-black/20 px-4 py-3 text-slate-900 dark:text-white text-sm"
              required
            />
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <Video size={18} />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Video link (YouTube optional)"
                className="flex-1 rounded-xl border border-red-400/20 bg-white/50 dark:bg-black/20 px-4 py-2 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="btn-future-primary rounded-xl disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Publish"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl glass-panel border-red-400/20 p-6 text-center">
            <p className="text-slate-700 dark:text-slate-300">
              <Link href="/login" className="text-red-600 dark:text-red-400 font-semibold underline">
                Sign in
              </Link>{" "}
              to post and like updates.
            </p>
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Latest</h2>
          {loading ? (
            <div className="flex justify-center py-16 text-slate-500">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 glass-panel rounded-2xl p-8 text-center">
              No posts yet — be the first to share your progress.
            </p>
          ) : (
            <ul className="space-y-6">
              {posts.map((p) => {
                const embed = youtubeEmbedUrl(p.videoUrl);
                return (
                  <li
                    key={p.id}
                    className="rounded-3xl glass-panel-strong border-red-400/15 overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          {p.title && (
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            {p.author.name} ·{" "}
                            {new Date(p.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleLike(p.id)}
                          disabled={status !== "authenticated"}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm border transition ${
                            p.likedByMe
                              ? "bg-red-600/20 border-red-400/50 text-red-700 dark:text-red-200"
                              : "border-red-400/20 text-slate-600 dark:text-slate-300 hover:bg-white/10"
                          } ${status !== "authenticated" ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <Heart size={18} className={p.likedByMe ? "fill-current" : ""} />
                          {p.likeCount}
                        </button>
                      </div>
                      <p className="mt-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {p.body}
                      </p>
                      {p.videoUrl && !embed && (
                        <a
                          href={p.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-red-600 dark:text-red-400 underline"
                        >
                          Open video link
                        </a>
                      )}
                    </div>
                    {embed && (
                      <div className="aspect-video w-full bg-black">
                        <iframe
                          title="Embedded video"
                          src={embed}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
