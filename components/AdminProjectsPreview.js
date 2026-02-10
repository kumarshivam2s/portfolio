"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminProjectsPreview() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getAdminHeaders } = await import("@/lib/adminClient");
        const headers = getAdminHeaders();

        const res = await fetch("/api/projects", { headers });
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch projects in admin preview", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-8">Loading projects preview…</div>;

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-6xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Projects (Admin Preview)
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
          Viewing projects with admin access
        </p>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No projects available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div key={project._id} className="p-6 border rounded">
                <Link href={`/projects/${project._id}`}>
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                </Link>
                <p className="text-sm text-gray-600 mt-2">
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/admin" className="text-blue-600">
            Back to Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
