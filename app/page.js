'use client';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Globe from '@/components/Globe'; // Optional, can be customized

export default function IndexPage() {
  const { data: session } = useSession();

  if (session) {
    window.location.href = '/dashboard';
  }

  return (
    <div className="w-full bg-gradient-to-b from-yellow-100 to-red-50 min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="h-screen flex flex-col items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-[url('/parai-bg.jpg')] bg-cover bg-center opacity-30" />

        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-6xl font-bold text-red-800 mb-6 relative z-10"
        >
          Learn the Art of Parai
        </motion.h1>
        <motion.p
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-xl text-red-700 max-w-2xl text-center mb-8 relative z-10"
        >
          Preserving culture through rhythm — learn and train Parai from anywhere.
        </motion.p>
        <div className="relative z-10 flex gap-4">
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-red-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-800 transition-colors"
            >
              Register
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="border border-red-700 text-red-700 px-6 py-3 rounded-full font-semibold hover:bg-red-100 transition-colors"
            >
              Login
            </motion.button>
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-red-800 text-center mb-16"
          >
            Why Learn Parai?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Cultural Revival',
                desc: 'Join the mission to revive and spread traditional Parai drumming.',
                icon: '🪘',
              },
              {
                title: 'Train Your Ear',
                desc: 'Machine learning feedback helps improve your timing and accuracy.',
                icon: '🎧',
              },
              {
                title: 'Anywhere, Anytime',
                desc: 'Learn at your own pace with guided courses and exercises.',
                icon: '🌍',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-red-50 p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-red-700">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-red-800 text-center mb-16"
          >
            What Learners Say
          </motion.h2>

          <div className="relative h-[600px] flex items-center justify-center">
            <Globe /> {/* Optional visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[
                'My kids are learning Parai at home!',
                'Great to preserve our traditions',
                'Very clear feedback system',
                'Felt like a real guru was training me',
              ].map((text, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  style={{
                    transform: `rotate(${i * 90}deg) translateY(-200px)`,
                  }}
                >
                  <div className="bg-white p-4 rounded-lg shadow-lg text-red-700">
                    <p>{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-red-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8"
          >
            Help Us Keep the Beat Alive
          </motion.h2>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white text-red-700 px-8 py-3 rounded-full font-semibold hover:bg-red-100 transition-colors"
            >
              Join the Mission
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}
