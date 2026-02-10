"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCalendar, FiClock, FiEye } from "react-icons/fi";

export default function AdminBlogPreview() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getAdminHeaders } = await import("@/lib/adminClient");
        const headers = getAdminHeaders();

        // fetch settings (may show maintenance/feature toggle)
        try {
          const sres = await fetch("/api/settings", { headers });
          if (sres.ok) {
            const sdata = await sres.json();
            if (!mounted) return;
            setEnabled(sdata.showBlog !== false);
            setMaintenance(!!sdata.maintenanceMode);
          }
        } catch (err) {
          console.error("Failed to fetch settings in admin preview", err);
        }

        // fetch posts using admin headers so unpublished posts are returned
        const res = await fetch("/api/posts", { headers });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to load posts: ${res.status} ${txt}`);
        }
        const data = await res.json();
        if (!mounted) return;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching posts in admin preview:", err);
        if (!mounted) return;
        setError("Failed to load posts");
        setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Unknown date";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Loading admin preview…
          </p>
        </div>
      </div>
    );
  }

  if (maintenance) {
    return (
      <div className="min-h-screen p-4 sm:p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Maintenance Mode</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The site is in maintenance mode.
          </p>
        </div>
      </div>
    );
  }

  if (enabled === false) {
    return (
      <div className="min-h-screen p-4 sm:p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Blog Disabled</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The blog is currently disabled by the administrator.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-16">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
          Blog (Admin Preview)
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Previewing the blog with admin access
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No blog posts yet.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Check back soon for new content
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post._id} className="group">
                <Link href={`/blog/${post._id}`}>
                  <div className="p-8 border border-gray-200 dark:border-gray-800 rounded hover:border-gray-400 dark:hover:border-gray-600 transition-all">
                    {post.image && (
                      <div className="w-full h-48 mb-4 rounded overflow-hidden bg-gray-200 dark:bg-gray-800">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h2 className="text-2xl font-semibold mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-500 text-base mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar size={14} />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiClock size={14} />
                        <span>{post.readTime || "5"} min</span>
                      </div>
                      {post.views > 0 && (
                        <div className="flex items-center gap-1.5">
                          <FiEye size={14} />
                          <span>{post.views}</span>
                        </div>
                      )}
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
