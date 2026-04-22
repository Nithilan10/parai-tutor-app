"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  youtubePosterUrl,
  youtubeReelEmbedUrl,
  youtubeWatchUrl,
} from "@/lib/paraiVideoLibrary";

/**
 * YouTube Shorts–style vertical feed for Tamil arts clips (scroll / snap one reel at a time).
 * @param {{ items: { id: string, title: string, caption: string }[] }} props
 */
export default function TamilArtsReels({ items }) {
  const list = items?.length ? items : [];
  const scrollerRef = useRef(null);
  const slideRefs = useRef([]);
  const rafRef = useRef(0);
  const [active, setActive] = useState(0);

  const updateActiveFromScroll = useCallback(() => {
    const root = scrollerRef.current;
    if (!root || list.length === 0) return;
    const mid = root.getBoundingClientRect().top + root.clientHeight / 2;
    let best = 0;
    let bestDist = Infinity;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive((prev) => (prev === best ? prev : best));
  }, [list.length]);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateActiveFromScroll);
  }, [updateActiveFromScroll]);

  useEffect(() => {
    updateActiveFromScroll();
  }, [updateActiveFromScroll, list.length]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const goTo = useCallback((index) => {
    const el = slideRefs.current[index];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const onKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goTo(Math.min(active + 1, list.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goTo(Math.max(active - 1, 0));
      }
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [active, goTo, list.length]);

  if (list.length === 0) return null;

  const current = list[active];

  return (
    <section
      className="relative rounded-3xl border border-red-500/20 bg-gradient-to-b from-black/40 via-slate-950/80 to-black/90 shadow-2xl shadow-red-900/10 overflow-hidden"
      aria-label="Tamil arts reels"
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Vertical video reels. Use arrow keys or buttons to change clip."
        onScroll={onScroll}
        className="relative h-[min(88vh,820px)] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 [-webkit-overflow-scrolling:touch] motion-reduce:scroll-auto motion-reduce:snap-none"
      >
        {list.map((item, i) => {
          const isActive = i === active;
          return (
            <div
              key={item.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="min-h-full snap-start snap-always flex items-center justify-center px-4 py-8 box-border"
            >
              <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-xl">
                {isActive ? (
                  <iframe
                    title={item.title}
                    src={youtubeReelEmbedUrl(item.id, true)}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    className="absolute inset-0 group"
                    aria-label={`Play reel: ${item.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={youtubePosterUrl(item.id)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15 transition-colors">
                      <span className="rounded-full bg-red-600/90 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        Tap to open
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => goTo(Math.max(active - 1, 0))}
          disabled={active === 0}
          className="p-2.5 rounded-full bg-black/55 border border-white/15 text-white disabled:opacity-35 hover:bg-black/75 transition-colors"
          aria-label="Previous reel"
        >
          <ChevronUp size={22} />
        </button>
        <button
          type="button"
          onClick={() => goTo(Math.min(active + 1, list.length - 1))}
          disabled={active >= list.length - 1}
          className="p-2.5 rounded-full bg-black/55 border border-white/15 text-white disabled:opacity-35 hover:bg-black/75 transition-colors"
          aria-label="Next reel"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      <div className="absolute left-0 right-14 bottom-0 z-20 px-5 pb-5 pt-8 pointer-events-none">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400/90 mb-1">
          Tamil arts · reel {active + 1} / {list.length}
        </p>
        <h2 className="text-lg md:text-xl font-bold text-white leading-snug drop-shadow-md pointer-events-auto">
          {current.title}
        </h2>
        <p className="text-sm text-slate-300/95 mt-1 line-clamp-2 drop-shadow pointer-events-auto">
          {current.caption}
        </p>
        <a
          href={youtubeWatchUrl(current.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-300 hover:text-red-200"
        >
          Open on YouTube <ExternalLink size={14} />
        </a>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 flex gap-1.5" aria-hidden>
        {list.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === active ? "w-6 bg-red-500" : "w-1.5 bg-white/35"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
