"use client";

import Image from "next/image";

export default function MakingOfParaiPage() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section
        className="home section relative h-[80vh] flex items-center justify-center text-center bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/parai-making-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="home__container container relative">
          <div className="home__data">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white">
              <span className="text-yellow-400">The Art Of</span> The Parai
            </h1>
            <p className="mt-4 text-xl text-gray-200">Discover the craftsmanship behind this ancient instrument.</p>
          </div>
        </div>
      </section>

      {/* Section 1: The Frame */}
      <section className="about bg-yellow-50 py-20">
        <div className="about__container container grid md:grid-cols-2 gap-12 items-center">
          <div className="about__data">
            <h2 className="section__title text-4xl font-bold text-red-800">The Frame: <br />Crafting the Foundation</h2>
            <p className="about__description text-lg text-gray-700 mt-4 leading-relaxed">
              The foundation of the parai is its shallow, circular frame. This is traditionally crafted from <strong>neem wood</strong>, which is known for its durability and resonance. The frame is not a single piece of wood, but rather three separate arcs that are carefully joined together with <span className="font-semibold text-yellow-800">metal plates</span>. This construction technique allows for a strong and stable frame that can withstand the rigors of performance.
            </p>
          </div>
          <div className="about__image h-96 relative rounded-lg overflow-hidden shadow-2xl">
            <Image src="/assets/parai-making-1.jpg" alt="Parai Frame" fill style={{ objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* Section 2: The Drumhead */}
      <section className="vision bg-red-700 text-white py-20">
        <div className="vision__container container grid md:grid-cols-2 gap-12 items-center">
          <div className="vision__image h-96 relative rounded-lg overflow-hidden shadow-2xl">
             <Image src="/assets/parai-making-2.jpg" alt="Stretching the Drumhead" fill style={{ objectFit: "cover" }} />
          </div>
          <div className="vision__data">
            <h2 className="section__title text-4xl font-bold text-yellow-400">The Drumhead: <br />The Soul of the Sound</h2>
            <p className="vision__description text-lg mt-4 leading-relaxed">
               The soul of the parai is its drumhead, which is made from a stretched <strong>cowhide</strong>. The hide is carefully selected and prepared, then glued to the wooden frame. This process requires great skill and precision, as the tension of the drumhead has a significant impact on the sound of the instrument. The result is a drumhead that is both <span className="font-semibold text-yellow-300">durable</span> and <span className="font-semibold text-yellow-300">responsive</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The Sticks */}
      <section className="values bg-yellow-50 py-20">
        <div className="values__container container text-center">
          <h2 className="section__title text-4xl font-bold text-red-800">The Sticks: <br />Tools of the Trade</h2>
          <div className="values__content grid md:grid-cols-2 gap-8 mt-12">
            <div className="value bg-white p-8 rounded-lg shadow-lg">
              <h3 className="value__title text-2xl font-bold text-yellow-800">Sundu Kuchi</h3>
              <p className="value__description mt-2 text-gray-700">
                A long, thin bamboo stick, the <strong>sundu kuchi</strong> is used to play the main rhythm on the center of the drum, creating the foundational beat.
              </p>
            </div>
            <div className="value bg-white p-8 rounded-lg shadow-lg">
              <h3 className="value__title text-2xl font-bold text-yellow-800">Adi Kucchi</h3>
              <p className="value__description mt-2 text-gray-700">
                The <strong>adi kucchi</strong> is a short, thick stick used to create a variety of sounds by striking different parts of the drumhead, adding complexity and expression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: The Finishing Touches */}
      <section
        className="partner relative py-24 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/parai-making-4.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="partner__container container relative text-center text-white">
          <h2 className="partner__title text-4xl font-bold text-yellow-400">The Final Touch: <br />Awakening the Sound</h2>
          <p className="partner__description mt-4 max-w-3xl mx-auto text-lg leading-relaxed">
            Before a performance, parai drummers will often <strong>heat their instruments</strong> over a small bonfire. This is a crucial step that tightens the drumhead and gives the drum its characteristic <span className="font-semibold text-yellow-300">high-pitched, cracking sound</span>. This process is a testament to the deep connection between the drummer and their instrument.
          </p>
        </div>
      </section>
    </main>
  );
}
