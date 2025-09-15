"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [nilais, setNilais] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" })
        const data = await res.json()
        if (mounted) setNilais(data.nilais || [])
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const goToNilai = (id) => router.push(`/tutorials/nilai/${id}`)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-yellow-300">
      <h1 className="text-4xl font-bold mb-10 text-gray-900 drop-shadow">🥁 Parai Tutor Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {nilais.map(n => (
          <button
            key={n.id}
            onClick={() => goToNilai(n.id)}
            className="w-40 h-40 rounded-full border-8 border-gray-800 
                       bg-yellow-200 shadow-lg flex flex-col items-center justify-center
                       hover:scale-105 transition-transform duration-200"
            style={{
              backgroundImage: "url('/parai-drum.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="text-xl font-semibold text-gray-900">{n.name}</span>
            <span className="text-sm text-gray-800 mt-1">
              {n.completedCount}/{n.beatsCount} complete
            </span>
          </button>
        ))}
      </div>

      <p className="mt-10 text-gray-700 text-lg">
        Select a Nilai to begin your tutorial.
      </p>
    </div>
  )
}
