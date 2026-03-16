"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Home, LayoutDashboard, User, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">
          <span className="text-xl">🥁</span>
          Parai Tutor
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600">
            <Home size={18} /> Home
          </Link>

          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600">
                <User size={18} /> Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600"
              >
                <LogOut size={18} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-red-600">
                Login
              </Link>
              <Link href="/register" className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700">
                Register
              </Link>
            </>
          )}

          <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-red-600">
            About
          </Link>
          <Link href="/history" className="text-gray-600 dark:text-gray-300 hover:text-red-600">
            History
          </Link>
          <Link href="/making-of-parai" className="text-gray-600 dark:text-gray-300 hover:text-red-600">
            Making of a Parai
          </Link>
        </div>
      </div>
    </nav>
  );
}
