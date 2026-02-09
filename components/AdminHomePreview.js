"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminHomePreview() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getAdminHeaders } = await import("@/lib/admin");
        const headers = getAdminHeaders();

        const res = await fetch("/api/settings", { headers });
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to fetch settings in admin home preview", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-8">Loading preview…</div>;

  const s = settings || {};

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Home (Admin Preview)
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          This is a per-tab admin preview of the homepage. Below are the current
          feature toggles from settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Blog</h3>
            <p className="text-sm text-gray-600">
              Visible: {String(s.showBlog !== false)}
            </p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Projects</h3>
            <p className="text-sm text-gray-600">
              Visible: {String(s.showProjects !== false)}
            </p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Search</h3>
            <p className="text-sm text-gray-600">
              Enabled: {String(s.enableSearch !== false)}
            </p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">Testimonials</h3>
            <p className="text-sm text-gray-600">
              Visible: {String(s.showTestimonials !== false)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/admin" className="text-blue-600">
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
