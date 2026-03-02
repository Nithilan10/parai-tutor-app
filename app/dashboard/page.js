"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"

export default function DashboardPage() {
  const router = useRouter()
  const [nilais, setNilais] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { toggle, isFavorite } = useFavorites()

  const filteredNilais = useMemo(() => {
    if (!search.trim()) return nilais
    const q = search.toLowerCase()
    return nilais.filter((n) => n.name.toLowerCase().includes(q))
  }, [nilais, search])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" })
        if (res.status === 401) {
          router.push("/login")
          return
        }
        const data = await res.json()
        if (mounted) setNilais(data.nilais || [])
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [router])

  const goToNilai = (id) => router.push(`/tutorials/nilai/${id}`)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-yellow-300 dark:from-gray-900 dark:to-gray-800 pt-20">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white drop-shadow">🥁 Parai Tutor Dashboard</h1>

      <div className="relative w-full max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search Nilais..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-red-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {filteredNilais.map(n => (
          <div key={n.id} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggle(n.id)
              }}
              className={`absolute -top-2 -right-2 z-10 p-2 rounded-full transition ${
                isFavorite(n.id) ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
              aria-label="Toggle favorite"
            >
              <Heart size={24} fill={isFavorite(n.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => goToNilai(n.id)}
              className="w-40 h-40 rounded-full border-8 border-gray-800 dark:border-gray-600
                         bg-yellow-200 dark:bg-gray-700 shadow-lg flex flex-col items-center justify-center
                         hover:scale-105 transition-transform duration-200"
              style={{
                backgroundImage: "url('/parai-drum.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="text-xl font-semibold text-gray-900 dark:text-white">{n.name}</span>
              <span className="text-sm text-gray-800 dark:text-gray-300 mt-1">
                {n.completedCount}/{n.beatsCount} complete
              </span>
            </button>
          </div>
        ))}
      </div>

      {filteredNilais.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">
          {search ? "No Nilais match your search." : "No Nilais available."}
        </p>
      )}

      <p className="mt-10 text-gray-700 dark:text-gray-300 text-lg">
        Select a Nilai to begin your tutorial.
      </p>
    </div>
  )
}
