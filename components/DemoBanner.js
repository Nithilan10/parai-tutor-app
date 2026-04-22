"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DemoBanner() {
  const pathname = usePathname();
  const { status } = useSession();
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (!isDemo) return null;
  if (pathname === "/" && status === "unauthenticated") return null;

  return (
    <div className="relative z-50 mx-3 mt-3 rounded-xl glass-panel px-4 py-2.5 text-center text-sm text-red-950 dark:text-red-100 border-red-400/30">
      <span className="font-medium">Demo mode</span> — use{" "}
      <strong className="text-violet-700 dark:text-violet-300">demo@parai.app</strong> /{" "}
      <strong className="text-violet-700 dark:text-violet-300">demo123</strong> or register.
    </div>
  );
}
