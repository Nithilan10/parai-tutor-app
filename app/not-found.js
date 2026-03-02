import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-8xl font-bold text-red-600">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">Page not found</p>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        The rhythm you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
