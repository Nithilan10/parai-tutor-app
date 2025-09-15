"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ParaiInput } from "@/components/paraiInput"

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Registration failed")
        return
      }

      router.push("/login")
    } catch (err) {
      console.error("Registration error:", err)
      alert("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="relative w-full h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/auth-bg.png')",
          filter: "brightness(0.5)",
        }}
      />
      <div className="absolute inset-0 bg-white opacity-30 mix-blend-lighten" />

      <div className="relative z-10 flex items-center justify-center h-full">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <ParaiInput
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <ParaiInput
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <ParaiInput
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-full"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  )
}
