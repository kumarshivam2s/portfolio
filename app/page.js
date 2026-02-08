"use client";

import Link from "next/link";
import ProfileTeaser from "@/components/ProfileTeaser";
import SearchBar from "@/components/SearchBar";
import Testimonials from "@/components/Testimonials";
import FeatureDisabled from "@/components/FeatureDisabled";

import { useEffect, useState } from "react";

export default function Home() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchSettings();

    // If settings fetch hangs or fails to resolve quickly, provide sensible defaults so the page doesn't show indefinite "Loading" blocks
    const fallbackTimer = setTimeout(() => {
      if (!mounted) return;
      // Use functional state update so we check the *current* state at execution time and do not overwrite newer values
      setSettings((prev) =>
        prev === null
          ? {
              showBlog: true,
              showProjects: true,
              showResume: false,
              enableSearch: true,
              showTestimonials: false,
              maintenanceMode: false,
            }
          : prev,
      );
    }, 1500);

    const onStorage = (e) => {
      if (e.key === "settings_updated_at") fetchSettings();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings", err);
      setSettings({
        showBlog: true,
        showProjects: true,
        enableSearch: true,
        showTestimonials: false,
        maintenanceMode: false,
      });
    }
  };

  // If maintenance mode is enabled, show the maintenance message to visitors
  if (settings && settings.maintenanceMode) {
    return (
      <div className="min-h-screen p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Maintenance Mode</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The site is currently in maintenance mode. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  const loader = (
    <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
      <h3 className="text-lg font-semibold mb-2">Loading</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">Welcome</h1>

        <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Hi, I’m Shivam. I build things that scale — and question things that
          don’t.
        </p>

        {/* Mobile teaser (popup + drop-in profile) */}
        <ProfileTeaser />

        <div className="mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/about">
            <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                About me and background.
              </p>
            </div>
          </Link>

          {settings === null ? (
            <>{loader}</>
          ) : settings.showResume ? (
            <Link href="/resume">
              <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Resume</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  My experience and skills.
                </p>
              </div>
            </Link>
          ) : (
            <></>
          )}

          {settings === null ? (
            <>{loader}</>
          ) : settings.showProjects ? (
            <Link href="/projects">
              <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Projects</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected projects and case studies.
                </p>
              </div>
            </Link>
          ) : null}

          {settings === null ? (
            <>{loader}</>
          ) : settings.showBlog ? (
            <Link href="/blog">
              <div className="border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Blog</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Thoughts and insights on technology.
                </p>
              </div>
            </Link>
          ) : null}

          {/* Search Bar (shown when enableSearch is on) */}
          {settings !== null && settings.enableSearch && (
            <div className="md:col-span-2">
              <SearchBar />
            </div>
          )}

          {/* Testimonials (shown when enabled) */}
          {settings !== null && settings.showTestimonials && (
            <div className="md:col-span-2 lg:col-span-2">
              <Testimonials />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
