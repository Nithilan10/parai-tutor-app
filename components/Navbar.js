"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  LayoutDashboard,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Languages,
  MessageCircle,
  Video,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/lib/LanguageContext";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, auth: true },
    { href: "/video-library", label: t("nav.videoLibrary"), icon: Video },
    {
      href: "/tutorials/parai-chatbot",
      label: t("nav.chatbot"),
      icon: MessageCircle,
      memberOnly: true,
    },
    { href: "/forums", label: t("nav.forum"), memberOnly: true },
    { href: "/profile", label: t("nav.profile"), icon: User, auth: true },
    { href: "/history", label: t("nav.history") },
    { href: "/about", label: t("nav.about") },
  ];

  const visibleLinks = links.filter((l) => {
    if (l.auth && status !== "authenticated") return false;
    if (l.memberOnly && status !== "authenticated") return false;
    return true;
  });

  if (pathname === "/" && status === "unauthenticated") {
    return null;
  }

  if (pathname === "/dashboard" && status === "authenticated") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 px-3 pt-2 pb-2 font-sans">
      <div className="glass-panel-strong max-w-6xl mx-auto rounded-2xl px-3 sm:px-4 h-14 flex items-center justify-between border-red-500/10">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-gradient-brand shrink-0 text-base sm:text-lg"
        >
          <Image
            src="/parai-drum.svg"
            alt=""
            width={28}
            height={28}
            className="shrink-0 opacity-95 drop-shadow-[0_0_12px_rgba(220,38,38,0.45)]"
          />
          <span className="hidden sm:inline tracking-tight font-black uppercase">Parai Tutor</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-500/20 transition-all border border-red-500/10"
          >
            <Languages size={14} />
            {language === "en" ? "தமிழ்" : "English"}
          </button>
          
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-black/5 transition text-black"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl transition ${
                pathname === l.href 
                  ? "bg-black/10 text-black font-black" 
                  : "text-black hover:bg-black/5"
              }`}
            >
              {l.icon && <l.icon size={16} />}
              {l.label}
            </Link>
          ))}
          {status === "authenticated" ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1 text-sm text-black font-bold hover:text-red-600 px-2 py-1 rounded-lg hover:bg-black/5"
            >
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-red-500 px-2 py-1"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn-future-primary text-sm !py-2 !px-4 rounded-xl"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="p-2 rounded-xl hover:bg-white/10"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass-panel-strong max-w-6xl mx-auto mt-2 rounded-2xl px-4 py-4 flex flex-col gap-2">
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 py-2 rounded-lg hover:bg-white/10 px-2"
            >
              {l.icon && <l.icon size={18} />}
              {l.label}
            </Link>
          ))}
          {status === "authenticated" ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-2 text-left text-slate-700 dark:text-slate-200 py-2 px-2"
            >
              <LogOut size={18} /> Sign out
            </button>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link href="/login" onClick={() => setOpen(false)} className="text-red-600 dark:text-red-400 font-medium px-2">
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="btn-future-primary text-center rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
