"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Syne, Space_Mono } from "next/font/google";
import ParaiScene3D from "@/components/ParaiScene3D";
import { decorImagery, historyImagery } from "@/lib/localImagery";
import "./rw-landing.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-syne",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const stripItems = [
  "Nilais & beats",
  "MediaPipe hands",
  "Rhythm feedback",
  "Browser-first",
  "Tamil heritage",
  "Structured lessons",
];

const practiceCards = [
  {
    n: "01",
    name: "Listen",
    tag: "Reference audio · every stroke",
    desc: "Hear Thi, Tha, Theem, Ku, and Ka in order. Each beat plays clean reference audio so your ear maps to the pattern before you move.",
    image: decorImagery.sceneA,
  },
  {
    n: "02",
    name: "Tap rhythm",
    tag: "Space bar · timing gaps",
    desc: "Record taps in lesson order; the app measures gaps between hits against your target interval and surfaces coaching.",
    image: decorImagery.sceneB,
  },
  {
    n: "03",
    name: "Camera lab",
    tag: "Optional · gesture pipeline",
    desc: "Open the gesture module: webcam frames drive a classifier so timestamps still feed the same rhythm analysis.",
    image: decorImagery.danceB,
  },
];

const steps = [
  {
    num: "01",
    title: "Pick a Nilai",
    desc: "Choose a lesson from the dashboard — each Nilai sequences beats in teaching order.",
  },
  {
    num: "02",
    title: "Hear the pattern",
    desc: "Play reference clips per beat or run the full sequence; optional timer tracks practice length.",
  },
  {
    num: "03",
    title: "Practice & record",
    desc: "Tap along or use the camera lab; every hit carries a timestamp for interval analysis.",
  },
  {
    num: "04",
    title: "Feedback loop",
    desc: "Compare order, missing or extra strokes, and spacing vs the ideal gap — optional model-enriched text.",
  },
];

const photoBand = [
  decorImagery.sceneA,
  decorImagery.sceneB,
  decorImagery.danceB,
  historyImagery.danceProcession,
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function IndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    document.title = "Parai Tutor — Learn Parai rhythm";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!finePointer || !ringRef.current || !dotRef.current) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      ring.style.left = `${cx}px`;
      ring.style.top = `${cy}px`;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    const interactive = new Set();
    const onEnter = (el) => () => {
      interactive.add(el);
      ring.classList.add("rw-cursor-hover");
    };
    const onLeave = (el) => () => {
      interactive.delete(el);
      if (interactive.size === 0) ring.classList.remove("rw-cursor-hover");
    };

    const nodes = rootRef.current?.querySelectorAll("a, button") ?? [];
    const cleanups = [];
    nodes.forEach((el) => {
      const e = onEnter(el);
      const l = onLeave(el);
      el.addEventListener("mouseenter", e);
      el.addEventListener("mouseleave", l);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", e);
        el.removeEventListener("mouseleave", l);
      });
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      ring.classList.remove("rw-cursor-hover");
    };
  }, [finePointer, status]);

  if (status === "loading") {
    return (
      <div
        className={`rw-root ${syne.variable} ${spaceMono.variable} min-h-screen flex items-center justify-center`}
      >
        <p className="text-white/50 text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      id="rw-marketing-root"
      className={`rw-root ${syne.variable} ${spaceMono.variable} ${finePointer ? "rw-cursor-fine" : ""}`}
    >
      {finePointer && (
        <>
          <div ref={ringRef} className="rw-cursor-ring" aria-hidden />
          <div ref={dotRef} className="rw-cursor-dot" aria-hidden />
        </>
      )}

      <nav className="rw-nav">
        <Link href="/" className="rw-nav-logo">
          Parai<span>Tutor</span>
        </Link>
        <ul className="rw-nav-links">
          <li>
            <a href="#practice">Practice</a>
          </li>
          <li>
            <a href="#how">Flow</a>
          </li>
          <li>
            <Link href="/tutorials">Tutorials</Link>
          </li>
          <li>
            <Link href="/video-library">Video library</Link>
          </li>
        </ul>
        <Link href="/register" className="rw-nav-cta">
          Start
        </Link>
      </nav>

      <section className="rw-hero">
        <div className="rw-hero-photo">
          <Image
            src={decorImagery.sceneA.src}
            alt={decorImagery.sceneA.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="rw-hero-scrim" />
        </div>

        <div className="rw-hero-inner">
          <div className="rw-hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <div className="rw-eyebrow">Tamil frame drum · structured learning</div>
              <h1 className="rw-hero-title">
                Rhythm<span className="rw-accent">.</span>
                <br />
                <span className="rw-outline">Made clear.</span>
              </h1>
              <p className="rw-hero-sub">
                Lessons, audio, tap timing, and optional hand tracking — with feedback on stroke order
                and the space between beats. Built around your photos and a 3D scene you can extend with
                your own model at{" "}
                <code className="text-red-400/90 text-[0.72rem]">/models/Parai.glb</code>.
              </p>
              <div className="rw-hero-actions">
                <Link href="/register" className="rw-btn-primary">
                  Create account
                </Link>
                <Link href="/tutorials" className="rw-btn-secondary">
                  Tutorials
                </Link>
                <Link href="/video-library" className="rw-btn-secondary">
                  Video library
                </Link>
              </div>
            </motion.div>
          </div>

          <ParaiScene3D />
        </div>

        <div className="rw-scroll">
          <div className="rw-scroll-line" />
          Scroll
        </div>
      </section>

      <div className="rw-strip">
        <span className="rw-strip-label">Includes</span>
        <div className="rw-strip-items">
          {stripItems.map((label) => (
            <span key={label} className="rw-strip-item">
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="rw-photo-band">
        {photoBand.map((img) => (
          <div key={img.src} className="rw-photo-band-item">
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
          </div>
        ))}
      </div>

      <section className="rw-section" id="practice">
        <span className="rw-section-label">Practice modes</span>
        <h2 className="rw-section-title">Listen, tap, or wire the lab.</h2>
        <p className="rw-section-desc">
          Three ways into the same engine — reference listening, keyboard rhythm capture, and optional
          webcam gestures. Photography on the cards is from your library.
        </p>

        <div className="rw-cards">
          {practiceCards.map((g, i) => (
            <motion.article
              key={g.n}
              className="rw-card"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            >
              <div className="rw-card-photo relative">
                <Image src={g.image.src} alt={g.image.alt} fill className="object-cover" sizes="(max-width: 900px) 100vw, 33vw" />
              </div>
              <div className="rw-card-body">
                <div className="rw-card-num">{g.n}</div>
                <h3 className="rw-card-title">{g.name}</h3>
                <span className="rw-card-tag">{g.tag}</span>
                <p className="rw-card-desc">{g.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="rw-section" id="how" style={{ paddingTop: 0 }}>
        <span className="rw-section-label">Lesson flow</span>
        <h2 className="rw-section-title">From Nilai to feedback.</h2>
        <p className="rw-section-desc">Four steps — no gimmicks, just the path the app already implements.</p>

        <div className="rw-steps">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              className="rw-step"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.05 }}
            >
              <div className="rw-step-num">{s.num}</div>
              <div className="rw-step-title">{s.title}</div>
              <p className="rw-step-desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="rw-stats-wrap">
        <div className="rw-stats-row">
          {[
            { value: "21", label: "hand landmarks in the lab", small: null },
            { value: "60", label: "fps-friendly detection loop", small: "fps" },
            { value: "Local", label: "Nilai audio & tap in your session", small: null },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="rw-stat"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
            >
              <div className="rw-stat-value">
                {s.value}
                {s.small ? <small>{s.small}</small> : null}
              </div>
              <div className="rw-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <section className="rw-cta" id="launch">
        <h2 className="rw-cta-title">
          Start <span className="rw-cta-outline">practicing</span>
          <br />
          today.
        </h2>
        <p className="rw-cta-sub">Sign in or register — camera only when you open the lab.</p>
        <div className="rw-cta-actions">
          <Link href="/register" className="rw-btn-primary rw-btn-large">
            Register
          </Link>
          <Link href="/login" className="rw-btn-secondary rw-btn-large">
            Sign in
          </Link>
          <Link href="/tutorials" className="rw-btn-secondary rw-btn-large">
            Tutorials
          </Link>
          <Link href="/video-library" className="rw-btn-secondary rw-btn-large">
            Video library
          </Link>
        </div>
      </section>

      <footer className="rw-footer">
        <span>Parai Tutor — red & white, your imagery</span>
        <span>Next.js · MediaPipe · Three.js</span>
        <span>Add or replace the GLB at /models/Parai.glb (or NEXT_PUBLIC_HERO_GLB_URL).</span>
      </footer>
    </div>
  );
}
