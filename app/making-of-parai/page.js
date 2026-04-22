"use client";

import Image from "next/image";
import { decorImagery, historyImagery } from "@/lib/localImagery";

export default function MakingOfParaiPage() {
  return (
    <main className="pb-20">
      <section className="relative h-[min(85vh,720px)] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={decorImagery.sceneB.src}
          alt={decorImagery.sceneB.alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-violet-950/65 to-slate-950/90" />
        <div className="relative z-10 px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white">
            <span className="text-gradient-neon bg-clip-text text-transparent">The art of</span> the Parai
          </h1>
          <p className="mt-4 text-xl text-red-50/95 glass-panel rounded-2xl inline-block px-6 py-3">
            Craftsmanship from frame to skin — visual story with Indian village context.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              The frame: <span className="text-red-600 dark:text-red-400">foundation</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed glass-panel rounded-2xl p-6">
              The shallow circular frame is often <strong>neem wood</strong>, in arcs joined with metal plates for
              strength — a structure that must survive processions and heat.
            </p>
          </div>
          <div className="relative h-96 rounded-3xl overflow-hidden glass-panel p-1">
            <Image
              src={decorImagery.sceneA.src}
              alt={decorImagery.sceneA.alt}
              fill
              className="object-cover rounded-[1.35rem]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div className="relative h-96 rounded-3xl overflow-hidden glass-panel p-1 md:order-1">
            <Image
              src={decorImagery.danceB.src}
              alt={decorImagery.danceB.alt}
              fill
              className="object-cover rounded-[1.35rem]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="md:order-2">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              The drumhead: <span className="text-red-600 dark:text-red-300">soul of sound</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed glass-panel rounded-2xl p-6">
              Cowhide, tension, and glue — the head defines tone. Warmth before a fire tightens the skin for the sharp,
              carrying voice of the parai.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-10">The sticks</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel-strong rounded-2xl p-8 text-left">
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-300">Sundu Kuchi</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Long bamboo — center strokes, driving the core rhythm.
              </p>
            </div>
            <div className="glass-panel-strong rounded-2xl p-8 text-left">
              <h3 className="text-2xl font-bold text-red-800 dark:text-red-400">Adi Kucchi</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Short, thick — color and accents at the rim and edge.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-28 px-4 overflow-hidden">
        <Image
          src={historyImagery.danceProcession.src}
          alt={historyImagery.danceProcession.alt}
          fill
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4 text-red-200">Final touch</h2>
          <p className="text-lg leading-relaxed glass-panel rounded-2xl p-8 text-slate-100">
            Heat before performance tightens the head — a ritual link between craft, climate, and sound on the street
            and in the village square.
          </p>
        </div>
      </section>
    </main>
  );
}
