"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiCalendar, FiClock, FiEye } from "react-icons/fi";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Thoughts, tutorials, and insights
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
            {posts.map((post, index) => (
              <article key={post._id} className="group">
                <Link href={`/blog/${post._id}`}>
                  <div className="p-6 border border-gray-200 dark:border-gray-800 rounded hover:border-gray-400 dark:hover:border-gray-600 transition-all">
                    {post.image && (
                      <div className="w-full h-40 mb-4 rounded overflow-hidden bg-gray-200 dark:bg-gray-800">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h2 className="text-xl font-semibold mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-500 text-sm mb-4 line-clamp-2">
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
