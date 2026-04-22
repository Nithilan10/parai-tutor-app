"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ToastProvider } from "@/hooks/useToast";
import Navbar from "@/components/Navbar";
import DemoBanner from "@/components/DemoBanner";
import FuturisticBackdrop from "@/components/FuturisticBackdrop";

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ToastProvider>
          <FuturisticBackdrop />
          <div className="relative z-[1] flex min-h-screen flex-col">
            <DemoBanner />
            <Navbar />
            <div className="flex-1 w-full">{children}</div>
          </div>
        </ToastProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
