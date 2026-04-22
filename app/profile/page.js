"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Award } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const total = d.nilais?.reduce((a, n) => a + n.beatsCount, 0) || 0;
        const completed = d.nilais?.reduce((a, n) => a + n.completedCount, 0) || 0;
        setStats({ total, completed, nilais: d.nilais?.length || 0 });
      })
      .catch(console.error);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="glass-panel-strong rounded-2xl px-8 py-6 text-lg">Loading…</div>
      </div>
    );
  }

  if (!session) return null;

  const percent = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gradient-neon mb-8">Profile</h1>

        <div className="glass-panel-strong rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Account</h2>
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Name:</strong> {session.user?.name || "—"}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            <strong>Email:</strong> {session.user?.email}
          </p>
        </div>

        <div className="glass-panel-strong rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={24} /> Progress
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Beats completed</span>
              <span>
                {stats?.completed ?? 0} / {stats?.total ?? 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats?.nilais ?? 0} Nilais available
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4 border-amber-400/20">
          <Award size={48} className="text-amber-600" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Keep practicing!</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Complete more beats to master Parai drumming.
            </p>
          </div>
        </div>

        <Link href="/dashboard" className="mt-6 inline-block btn-future-primary rounded-2xl">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
