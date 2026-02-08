"use client";

import { useEffect, useState, useRef } from "react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ posts: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!q) return setResults({ posts: [], projects: [] });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(q), 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  const doSearch = async (term) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      setResults({ posts: data.posts || [], projects: data.projects || [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search posts & projects..."
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {loading && (
        <div className="text-xs text-gray-500 mt-2">Searching...</div>
      )}

      {!loading &&
        (results.posts.length > 0 || results.projects.length > 0) && (
          <div className="mt-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-sm">
            {results.posts.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-sm mb-1">Posts</div>
                <ul className="text-sm space-y-1">
                  {results.posts.map((p) => (
                    <li key={p._id}>
                      <a
                        href={`/blog/${p._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.projects.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-1">Projects</div>
                <ul className="text-sm space-y-1">
                  {results.projects.map((p) => (
                    <li key={p._id}>
                      <a
                        href={`/projects/${p._id}`}
                        className="text-green-600 dark:text-green-400 hover:underline"
                      >
                        {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
