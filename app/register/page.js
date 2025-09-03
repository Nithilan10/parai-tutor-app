"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import { ParaiInput } from "@/components/paraiInput"


export default function register() {
    const router = useRouter()
    const [formData, setFormData] = useState({name: "", email: "", password: ""})

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))

    } 

    const handleSubmit = async(e) => {
        e.preventDefault()
        console.log(formData)
        router.push("/login")
    }


    return(
        <div className="relative w-full h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/auth-bg.png')", // put image in /public
            filter: "brightness(0.5)", // darkens it slightly
          }}
        />
  
        {/* Light overlay to soften image */}
        <div className="absolute inset-0 bg-white opacity-30 mix-blend-lighten" />
  
        {/* Login form */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <form className="space-y-4">
            <ParaiInput name="email" placeholder="Email" />
            <ParaiInput name="password" placeholder="Password" type="password" />
            <button className="bg-black text-white px-6 py-2 rounded-full">
              Log in
            </button>
          </form>
        </div>
      </div>
    )
}
