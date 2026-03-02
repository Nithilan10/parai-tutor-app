"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/hooks/useToast";
import Navbar from "@/components/Navbar";

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <Navbar />
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}