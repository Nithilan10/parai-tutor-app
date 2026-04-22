"use client";

import authBg from "../assets/auth-bg.jpeg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ParaiInput } from "@/components/paraiInput";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res?.error) {
      alert(res.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${authBg.src})`,
          filter: "brightness(0.5)",
        }}
      />
      <div className="absolute inset-0 bg-white opacity-30 mix-blend-lighten" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
          <p className="mb-6 text-center text-white drop-shadow-md max-w-md text-sm bg-black/40 rounded-lg px-4 py-2">
            Demo: <strong>demo@parai.app</strong> / <strong>demo123</strong>
          </p>
        )}
        <form className="space-y-4 flex flex-col items-center" onSubmit={handleSubmit}>
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
          <button type="submit" className="bg-black text-white px-6 py-2 rounded-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
