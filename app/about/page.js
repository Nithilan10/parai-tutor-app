"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About Parai Tutor</h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-lg">
            Parai Tutor helps you learn the art of Parai drumming — a traditional Tamil drum with
            deep cultural roots. Our mission is to preserve and spread this heritage through
            guided tutorials and practice tools.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">What is Parai?</h2>
          <p>
            Parai is a frame drum traditionally made from wood and animal skin. It has been used for
            centuries in Tamil Nadu for festivals, rituals, and social gatherings. The beats — Thi,
            Tha, Theem, Ku, Ka — form the foundation of Parai rhythm.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Structured Nilais (lessons) with step-by-step beats</li>
            <li>Audio playback for each beat</li>
            <li>Progress tracking across lessons</li>
            <li>Practice mode with full sequence playback</li>
            <li>ML-based feedback (coming soon)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">Contact</h2>
          <p>
            Questions or feedback? Reach out to help preserve the beat.
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
