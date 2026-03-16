"use client";

import Link from "next/link";

const tutorials = [
  {
    name: "Dev and Prod Evidence",
    href: "/tutorials/dev-and-prod",
    description: "Hand gesture recognition for playing the parai.",
  },
];

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tutorials
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Learn how to play the parai with our interactive tutorials.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((tutorial) => (
              <Link key={tutorial.name} href={tutorial.href} className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                <h2 className="text-xl font-bold text-gray-900">{tutorial.name}</h2>
                <p className="mt-2 text-base text-gray-500">{tutorial.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
