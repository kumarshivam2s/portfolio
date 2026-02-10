"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCalendar, FiClock, FiEye } from "react-icons/fi";

export default function AdminPostPreview({ id }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { getAdminHeaders } = await import("@/lib/adminClient");
        const headers = getAdminHeaders();

        const res = await fetch(`/api/posts/${id}`, { headers });
        if (!res.ok) throw new Error("Failed to load post");
        const data = await res.json();
        if (!mounted) return;
        setPost(data);
      } catch (err) {
        console.error("Error fetching post in admin preview:", err);
        if (!mounted) return;
        setError("Failed to load post");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [id]);

  const formatDate = (d) => {
    try {
      if (!d) return "Unknown date";
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  if (loading) return <div className="p-8">Loading post preview…</div>;
  if (error)
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  if (!post)
    return (
      <div className="p-6 text-gray-600 dark:text-gray-400">Post not found</div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-16">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-3">{post.title}</h1>
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <div className="flex items-center gap-1.5">
            <FiCalendar size={14} />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FiClock size={14} />
            <span>{post.readTime || "5"} min</span>
          </div>
        </div>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded mb-6"
          />
        )}

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700">
          <Link href="/admin/posts" className="text-blue-600">
            Back to posts
          </Link>
        </div>
      </div>
    </div>
  );
}
