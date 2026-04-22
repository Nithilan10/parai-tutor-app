"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="glass-panel-strong rounded-3xl px-10 py-12 text-center max-w-lg border-red-400/20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-center">
          {error?.message || "An unexpected error occurred."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button type="button" onClick={() => reset()} className="btn-future-primary rounded-xl">
            Try again
          </button>
          <Link href="/" className="btn-future-ghost rounded-xl">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
