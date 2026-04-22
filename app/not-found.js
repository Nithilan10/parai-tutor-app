import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="glass-panel-strong rounded-3xl px-12 py-14 text-center max-w-lg border-red-400/20">
        <h1 className="text-8xl font-bold text-gradient-neon leading-none">404</h1>
        <p className="text-xl text-slate-700 dark:text-slate-200 mt-4">Page not found</p>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          The rhythm you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="mt-8 inline-block btn-future-primary rounded-2xl">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
