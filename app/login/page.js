"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { ParaiInput } from "@/components/paraiInput"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    })

    if (res?.error) {
      alert(res.error)
    } else {
      router.push("/dashboard")
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
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
