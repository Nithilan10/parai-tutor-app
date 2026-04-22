"use client";

import Image from "next/image";
import { historyImagery } from "@/lib/localImagery";
import { useLanguage } from "@/lib/LanguageContext";
import { Music, Landmark, Sparkles, ShieldCheck } from "lucide-react";

export default function HistoryPage() {
  const { t, language } = useLanguage();
  
  const iconMap = {
    0: Music,
    1: ShieldCheck,
    2: Landmark
  };

  const sections = t("history.sections") || [];

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 overflow-hidden relative">
      {/* Decorative localized typography background */}
      <div className="absolute top-20 left-0 w-full text-center pointer-events-none opacity-[0.03] select-none -z-10">
        <h2 className="text-[20rem] font-black leading-none uppercase">பறை</h2>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-black text-gradient-neon tracking-tighter uppercase mb-6 drop-shadow-[0_0_25px_rgba(220,38,38,0.3)]">
            {t("history.title")}
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto font-medium leading-relaxed">
            {t("history.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {sections.map((s, i) => {
            const Icon = iconMap[i] || Sparkles;
            const images = [historyImagery.kingdoms, historyImagery.danceProcession, historyImagery.antiCaste];
            const currentImage = images[i] || historyImagery.kingdoms;

            return (
              <div
                key={i}
                className={`flex flex-col lg:flex-row items-stretch gap-12 group transition-all duration-700 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content Panel */}
                <div className="lg:w-1/2 flex flex-col justify-center">
                  <div className="glass-panel-strong p-8 md:p-12 rounded-[2rem] border-red-500/10 hover:border-red-500/30 transition-all shadow-xl hover:shadow-red-500/5 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-red-500/10 rounded-2xl text-red-600 dark:text-red-400">
                        <Icon size={32} />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        {s.title}
                      </h2>
                    </div>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-red-600">
                      {s.body}
                    </p>
                  </div>
                </div>

                {/* Visual Panel */}
                <div className="lg:w-1/2 group-hover:scale-[1.02] transition-transform duration-700">
                  <div className="relative w-full h-[300px] md:h-[500px] rounded-[2rem] overflow-hidden glass-panel p-2 shadow-2xl border-white/5">
                    <Image
                      src={currentImage.src}
                      alt={s.title}
                      fill
                      className="object-cover rounded-[1.6rem] filter grayscale hover:grayscale-0 transition-all duration-1000"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    {/* Floating Caption */}
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                        <p className="text-white text-sm font-mono tracking-widest uppercase opacity-90">
                          {language === "ta" ? "வரலாற்று பதிவு" : "Historical Insight"}{" "}
                          · {i + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conclusion / CTA */}
        <div className="mt-32 text-center relative p-12 glass-panel-strong rounded-[3rem] border-red-500/10">
          <div className="absolute inset-0 bg-[url('/drum-texture.jpg')] opacity-[0.03] pointer-events-none" />
          <h3 className="text-3xl md:text-5xl font-black text-gradient-neon mb-8">
            {language === "ta" ? "குரல் கொடுக்கத் தயாரா?" : "Ready to speak with the drum?"}
          </h3>
          <button className="btn-future-primary px-12 py-5 text-xl rounded-2xl shadow-2xl shadow-red-500/20">
            {language === "ta" ? "பயிற்சியைத் தொடங்கு" : "Start Your Practice"}
          </button>
        </div>
      </div>
    </div>
  );
}
