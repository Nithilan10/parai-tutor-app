"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-gray-600">{error?.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded-full"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
