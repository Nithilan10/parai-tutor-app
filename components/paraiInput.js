"use client";

export function ParaiInput({ name, placeholder, type = "text" }) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      className="w-40 h-40 rounded-full text-center text-lg bg-white/80 border-4 border-gray-800 shadow-md placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all bg-center bg-cover"
      style={{
        backgroundImage: "url('/parai-drum.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "lighten",
      }}
    />
  );
}
