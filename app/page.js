"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">Welcome</h1>

        <p className="text-base text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
          Hi, I’m Shivam.
          I build things that scale — and question things that don’t.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/about">
            <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn about my background and experience.
              </p>
            </div>
          </Link>

          <Link href="/resume">
            <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Resume</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View my education and professional experience.
              </p>
            </div>
          </Link>

          <Link href="/projects">
            <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Projects</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected projects and case studies.
              </p>
            </div>
          </Link>

          <Link href="/blog">
            <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Blog</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thoughts and insights on technology.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
