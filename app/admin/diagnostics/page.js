"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DiagnosticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/diagnostics", {
        credentials: "include",
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load diagnostics", err);
      setData({ error: "Failed to fetch diagnostics" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-6"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              Refresh
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Open Public Site
            </a>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {!loading && data && (
          <div className="space-y-6">
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-4">
              <h2 className="font-semibold mb-2">Settings Document</h2>
              <pre className="text-xs overflow-x-auto bg-gray-50 dark:bg-gray-950 p-4 rounded">
                {JSON.stringify(data.settings, null, 2)}
              </pre>
            </section>

            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-4">
              <h2 className="font-semibold mb-2">Recent Change Log</h2>
              {data.logs && data.logs.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {data.logs.map((l, i) => (
                    <li
                      key={i}
                      className="border-b border-gray-100 dark:border-gray-800 pb-2"
                    >
                      <div className="text-xs text-gray-500">
                        {new Date(l.updatedAt).toLocaleString()}
                        {l.adminEmail ? ` • by ${l.adminEmail}` : ""}
                      </div>
                      <pre className="text-sm mt-1">
                        {JSON.stringify(l.updates, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No logs yet.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
