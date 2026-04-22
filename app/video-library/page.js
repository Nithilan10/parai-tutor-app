"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Play, ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { decorImagery } from "@/lib/localImagery";
import Image from "next/image";
import TamilArtsReels from "@/components/TamilArtsReels";
import {
  PARAI_ARTS_REELS,
  PARAI_VIDEO_EMBEDS,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "@/lib/paraiVideoLibrary";

const SHOW_AI_REEL_BUTTON = process.env.NEXT_PUBLIC_SHOW_AI_REEL_BUTTON === "true";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-24px" },
  transition: { duration: 0.45 },
};

export default function VideoLibraryPage() {
  const { status } = useSession();
  const hubHref = status === "authenticated" ? "/dashboard" : "/tutorials";
  const hubLabel = status === "authenticated" ? "Dashboard" : "Tutorials";
  const [reelItems, setReelItems] = useState(PARAI_ARTS_REELS);
  const [reelStats, setReelStats] = useState({ preloaded: PARAI_ARTS_REELS.length, ai: 0 });
  const [reelsLoading, setReelsLoading] = useState(true);
  const [generateBusy, setGenerateBusy] = useState(false);
  const [generateMsg, setGenerateMsg] = useState("");

  const loadMergedReels = useCallback(async () => {
    setReelsLoading(true);
    try {
      const res = await fetch("/api/video-library/reels", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.merged) && data.merged.length) {
        setReelItems(
          data.merged.map((r) => ({
            id: r.id,
            title: r.title,
            caption: r.caption,
          }))
        );
        setReelStats({
          preloaded: data.preloadedCount ?? PARAI_ARTS_REELS.length,
          ai: data.aiStoredCount ?? 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReelsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMergedReels();
  }, [loadMergedReels]);

  const requestMoreReels = async () => {
    setGenerateBusy(true);
    setGenerateMsg("");
    try {
      const res = await fetch("/api/video-library/reels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batches: 3, batchSize: 15 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateMsg(data.error || `Request failed (${res.status})`);
      } else {
        setGenerateMsg(
          data.insertedCount
            ? `Added ${data.insertedCount} reels. Refreshing…`
            : "No new reels (budget, duplicates, or model returned none)."
        );
        await loadMergedReels();
      }
    } catch (e) {
      setGenerateMsg(String(e?.message || e));
    } finally {
      setGenerateBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-8 pb-20 px-4">
      <div className="absolute top-24 right-0 w-96 h-96 opacity-20 pointer-events-none rounded-full overflow-hidden hidden lg:block">
        <Image src={decorImagery.danceB.src} alt="" fill className="object-cover blur-sm" sizes="384px" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <Link
          href={hubHref}
          className="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:underline mb-8"
        >
          <ArrowLeft size={16} /> {hubLabel}
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-red-600/15 border border-red-500/30">
            <Play className="text-red-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Video library
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Embedded lessons and performances — open on YouTube for full channel context.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded-full bg-red-500" aria-hidden />
            Tamil arts reels
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 max-w-2xl">
            Shorts-style vertical feed — swipe or scroll inside the frame, or use the arrows / keyboard (↑ ↓)
            after focusing the reel area. The list merges curated clips with AI-suggested Tamil arts videos
            stored in your database (validated via YouTube thumbnails).
          </p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">
            {reelsLoading
              ? "Loading reel list…"
              : `${reelItems.length} reels · ${reelStats.preloaded} curated · ${reelStats.ai} from AI pool`}
          </p>
          {SHOW_AI_REEL_BUTTON && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                type="button"
                onClick={requestMoreReels}
                disabled={generateBusy || reelsLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-500/40 text-violet-700 dark:text-violet-300 text-sm font-bold hover:bg-violet-500/10 disabled:opacity-40"
              >
                <RefreshCw size={16} className={generateBusy ? "animate-spin" : ""} />
                {generateBusy ? "Generating…" : "Generate more reels (OpenAI)"}
              </button>
              <button
                type="button"
                onClick={loadMergedReels}
                className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                Refresh list
              </button>
              {generateMsg ? (
                <span className="text-xs text-slate-600 dark:text-slate-400 max-w-md">{generateMsg}</span>
              ) : null}
            </div>
          )}
          <TamilArtsReels items={reelItems} />
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">All videos</h2>

        <p className="text-slate-600 dark:text-slate-400 text-sm mb-10 leading-relaxed">
          Videos play inline below. Creators retain all rights; we link to the watch page for attribution.
          {status === "authenticated" ? (
            <>
              {" "}
              You can also use the{" "}
              <Link
                href="/tutorials/parai-chatbot"
                className="text-red-600 dark:text-red-400 font-semibold hover:underline"
              >
                Parai chatbot
              </Link>{" "}
              for guided questions.
            </>
          ) : (
            <>
              {" "}
              <Link
                href="/login?callbackUrl=%2Ftutorials%2Fparai-chatbot"
                className="text-red-600 dark:text-red-400 font-semibold hover:underline"
              >
                Sign in
              </Link>{" "}
              to use the Parai chatbot.
            </>
          )}
        </p>

        <ul className="space-y-10">
          {PARAI_VIDEO_EMBEDS.map((item, i) => (
            <motion.li
              key={item.id}
              className="glass-panel-strong rounded-2xl border-red-500/15 overflow-hidden"
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.05 }}
            >
              <div className="aspect-video w-full bg-black">
                <iframe
                  title={item.title}
                  src={youtubeEmbedUrl(item.id)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading={i === 0 ? "eager" : "lazy"}
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.caption}</p>
                </div>
                <a
                  href={youtubeWatchUrl(item.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/35 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors"
                >
                  Open on YouTube <ExternalLink size={16} />
                </a>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
