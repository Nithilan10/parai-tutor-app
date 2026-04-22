"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Syne, Space_Mono } from "next/font/google";
import { LogOut, Languages } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import TutorialsHubContent from "@/components/TutorialsHubContent";
import "@/app/rw-landing.css";

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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { language, toggleLanguage, t } = useLanguage();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const stripItems = ["Nilai drills", "Video library", "Chatbot", "Forums"];

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div
        className={`rw-dash-page ${syne.variable} ${spaceMono.variable} min-h-screen flex items-center justify-center`}
      >
        <p className="text-white/50 text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  return (
    <div className={`rw-dash-page ${syne.variable} ${spaceMono.variable} relative z-10`}>
      <header className="rw-dash-nav-wrap">
        <div className="rw-dash-nav-inner">
          <Link href="/dashboard" className="rw-nav-logo">
            Parai<span>Tutor</span>
          </Link>

          <button
            type="button"
            className="rw-dash-mobile-toggle"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? "Close" : "Menu"}
          </button>

          <nav
            className={`rw-dash-nav-links-collapsible ${navOpen ? "rw-open" : ""}`}
            aria-label="Dashboard"
          >
            <ul className="rw-dash-nav-links">
              <li>
                <Link href="/video-library" onClick={() => setNavOpen(false)}>
                  {t("nav.videoLibrary")}
                </Link>
              </li>
              <li>
                <Link href="/tutorials/parai-chatbot" onClick={() => setNavOpen(false)}>
                  {t("nav.chatbot")}
                </Link>
              </li>
              <li>
                <Link href="/forums" onClick={() => setNavOpen(false)}>
                  {t("nav.forum")}
                </Link>
              </li>
              <li>
                <Link href="/profile" onClick={() => setNavOpen(false)}>
                  {t("nav.profile")}
                </Link>
              </li>
              <li>
                <Link href="/history" onClick={() => setNavOpen(false)}>
                  {t("nav.history")}
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={() => setNavOpen(false)}>
                  {t("nav.about")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="rw-dash-nav-actions">
            <button
              type="button"
              onClick={toggleLanguage}
              className="rw-dash-logout !border-white/25 !text-white/80 hover:!bg-white/10 hover:!text-white"
              aria-label="Toggle language"
            >
              <Languages size={14} className="inline mr-1 opacity-80" />
              {language === "en" ? "தமிழ்" : "EN"}
            </button>
            <button type="button" className="rw-dash-logout" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut size={14} className="inline mr-1" />
              {language === "ta" ? "வெளியேறு" : "Log out"}
            </button>
          </div>
        </div>
      </header>

      <section className="rw-dash-hero">
        <p className="rw-eyebrow" style={{ marginBottom: "0.75rem" }}>
          Signed in · {session?.user?.name || session?.user?.email || "Learner"}
        </p>
        <h1 className="rw-dash-title">
          Learn<span style={{ color: "var(--rw-red)" }}>.</span> tutorials
        </h1>
        <p className="rw-dash-sub">
          Choose a Nilai, pick a beat, and practice with the camera. Use the link under the cards for the full
          lesson (recording &amp; AI). Video library, chatbot, and forums stay in the bar above.
        </p>
      </section>

      <div className="rw-dash-strip">
        <span className="font-bold text-white/90">Hub</span>
        {stripItems.map((label) => (
          <span key={label} className="rw-dash-strip-tag">
            {label}
          </span>
        ))}
      </div>

      <div className="relative rw-dash-main z-10">
        <TutorialsHubContent headingClassName="[&_h1]:text-white [&_h1]:from-white [&_h1]:to-red-200" />
      </div>
    </div>
  );
}
