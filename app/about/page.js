"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUp,
  BookOpen,
  Flame,
  Mail,
  MapPin,
  Users,
  ChevronDown,
  Target,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { decorImagery } from "@/lib/localImagery";

const PROMO_TEXT =
  "Start your rhythm journey today — open tutorials and practice beats. Tap to begin.";

function TypingPromoBanner() {
  const [display, setDisplay] = useState("");
  const textIndex = useRef(0);
  const mode = useRef("typing"); // 'typing' | 'erasing'
  const timerRef = useRef(null);

  const schedule = useCallback((fn, ms) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, ms);
  }, []);

  useEffect(() => {
    const typingSpeed = 40;
    const erasingSpeed = 40;
    const pauseMs = 3200;
    const full = PROMO_TEXT;

    const tick = () => {
      if (mode.current === "typing") {
        if (textIndex.current < full.length) {
          textIndex.current += 1;
          setDisplay(full.slice(0, textIndex.current));
          schedule(tick, typingSpeed);
        } else {
          mode.current = "erasing";
          schedule(tick, pauseMs);
        }
      } else {
        if (textIndex.current > 0) {
          textIndex.current -= 1;
          setDisplay(full.slice(0, textIndex.current));
          schedule(tick, erasingSpeed);
        } else {
          mode.current = "typing";
          schedule(tick, typingSpeed);
        }
      }
    };

    const start = setTimeout(tick, 500);
    return () => {
      clearTimeout(start);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [schedule]);

  return (
    <div className="mx-3 mt-2 rounded-xl glass-panel border-red-400/25 text-center py-2.5 px-3 text-sm sm:text-base text-red-900 dark:text-red-100">
      <Link
        href="/tutorials"
        className="inline-block max-w-4xl mx-auto hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 rounded-lg"
      >
        <span className="font-medium">{display}</span>
        <span className="animate-pulse opacity-80">|</span>
      </Link>
    </div>
  );
}

const faqItems = [
  {
    q: "What is Parai Tutor?",
    a: "Parai Tutor is a learning app for traditional Parai frame drumming. Follow Nilais (lessons), hear each beat, and practice sequences with timing feedback.",
  },
  {
    q: "Do I need a real drum to start?",
    a: "No. You can learn patterns and rhythm with tutorials and tap practice. A physical Parai helps later for tone and technique, but the app supports practice anywhere.",
  },
  {
    q: "How does rhythm feedback work?",
    a: "The app compares your strokes and timing to the lesson target: stroke order, missing or extra hits, and gaps between beats versus the ideal interval. Optional AI turns those metrics into clear coaching tips.",
  },
  {
    q: "Is hand tracking required?",
    a: "Optional. You can use camera-based gestures where supported, or tap along in rhythm mode. Both paths produce timestamps for analysis.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqItems.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="rounded-xl glass-panel overflow-hidden border-red-400/15"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 sm:px-5 sm:py-4 font-semibold text-gray-900 dark:text-white hover:bg-amber-50/80 dark:hover:bg-gray-800/80 transition-colors"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="text-sm sm:text-base pr-2">{item.q}</span>
              <ChevronDown
                className={`shrink-0 w-5 h-5 text-amber-700 dark:text-amber-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-amber-100/80 dark:border-gray-700/80">
                <p className="pt-3">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 overflow-hidden relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-black text-gradient-neon tracking-tighter uppercase mb-6">
            {t("about.title")}
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto font-medium">
            {t("about.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel-strong p-10 rounded-[2.5rem] border-red-500/10 hover:border-red-500/30 transition-all flex flex-col gap-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
              <Target size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {language === "ta" ? "எமது நோக்கம்" : "Our Mission"}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("about.mission")}
            </p>
          </div>

          <div className="glass-panel-strong p-10 rounded-[2.5rem] border-red-500/10 hover:border-red-500/30 transition-all flex flex-col gap-6 font-sans">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {language === "ta" ? "எமது குழு" : "Our Team"}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("about.team")}
            </p>
          </div>
        </div>

        <div className="mt-20 p-12 glass-panel-strong rounded-[3rem] border-red-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Globe size={120} />
          </div>
          <div className="max-w-3xl relative z-10">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
              {language === "ta" ? "உலகளாவிய பறை சமூகம்" : "A Global Parai Community"}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {language === "ta" 
                ? "நாங்கள் வெறும் மென்பொருள் மட்டுமல்ல; நாங்கள் இசையையும் சமூக நீதியையும் நேசிக்கும் ஒரு உலகளாவிய குடும்பம். இணையம் வழியாக நமது பாரம்பரியத்தை அடுத்த தலைமுறைக்குக் கொண்டு செல்கிறோம்."
                : "We are more than just a software platform; we are a global family united by rhythm and the pursuit of social equity. Through digital resonance, we bridge the gap between ancestral heritage and future generations."}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-6 py-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-600 dark:text-red-400 font-bold">
                #ParaiDignity
              </div>
              <div className="px-6 py-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                #DigitalCulture
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
