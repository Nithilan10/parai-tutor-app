"use client";

import Image from "next/image";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-red-700 sm:text-6xl">
            The History of Parai
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            A journey through the <span className="font-bold text-red-600">ancient origins</span> and <span className="font-bold text-red-600">cultural significance</span> of the parai drum.
          </p>
        </div>

        <div className="space-y-16">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-red-800 mb-4">An Ancient Instrument</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The <strong>parai</strong> is one of the oldest drums in Indian history, with a legacy that stretches back to prehistoric times. Its name, which means <span className="font-semibold text-yellow-800">"to speak"</span> or <span className="font-semibold text-yellow-800">"to tell"</span> in Tamil, hints at its historical importance as a tool for communication. The parai is mentioned in the <strong>Sangam literature</strong>, a collection of ancient Tamil texts, which confirms its use in a variety of contexts, from royal courts to religious ceremonies.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-2xl">
                <Image src="/assets/parai-history-1.jpg" alt="Ancient Parai Depiction" fill style={{ objectFit: "cover" }} />
              </div>
              <p className="text-center mt-2 text-sm text-gray-500 italic">A depiction of the parai in ancient Tamil art.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-red-800 mb-4">A Tool of Communication</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Historically, the parai was used to make <strong>important announcements</strong>, to summon people for gatherings, and even to alert them to upcoming wars. It was also a key instrument in a variety of cultural performances, including the traditional dance forms of <strong>parai attam</strong> and <strong>puliyattam</strong>. The sound of the parai was a familiar part of daily life, used in everything from festivals and weddings to funerals.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-2xl">
                <Image src="/assets/parai-history-2.jpg" alt="Parai Attam Performance" fill style={{ objectFit: "cover" }} />
              </div>
              <p className="text-center mt-2 text-sm text-gray-500 italic">A vibrant Parai Attam performance.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-red-800 mb-4">A Symbol of Cultural Identity</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The parai has a complex history with the <strong>caste system</strong> in India. For many years, it was associated with <strong>Dalit communities</strong> and was often considered an "impure" instrument. However, in recent years, there has been a movement to reclaim the parai as a symbol of <span className="font-semibold text-yellow-800">cultural identity</span> and <span className="font-semibold text-yellow-800">social freedom</span>. Today, the parai is celebrated as a powerful instrument of <strong>resistance</strong> and a proud symbol of <strong>Tamil heritage</strong>.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-2xl">
                <Image src="/assets/parai-history-3.jpg" alt="Modern Parai Player" fill style={{ objectFit: "cover" }} />
              </div>
              <p className="text-center mt-2 text-sm text-gray-500 italic">A modern parai player, celebrating Tamil heritage.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
