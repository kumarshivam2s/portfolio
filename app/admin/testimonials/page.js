"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setItems(data.testimonials || []);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const startAdd = () => {
    setEditing(null);
    setName("");
    setQuote("");
    setActive(true);
    setError("");
  };

  const startEdit = (t) => {
    setEditing(t);
    setName(t.name);
    setQuote(t.quote);
    setActive(t.active !== false);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!name || !quote) return setError("Name and quote required");
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/testimonials/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, quote, active }),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch(`/api/testimonials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, quote, active }),
        });
        if (!res.ok) throw new Error("Create failed");
      }

      await fetchList();
      setEditing(null);
      setName("");
      setQuote("");
      setActive(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((s) => s.filter((i) => i._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-6"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Manage Testimonials</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded p-4 mb-6">
          <h3 className="text-sm font-semibold mb-3">Editor</h3>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-sm"
            />
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Quote"
              rows={4}
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800 text-sm"
            ></textarea>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>Active</span>
            </label>

            {/* Live preview */}
            <div className="mt-3">
              <h4 className="text-sm font-semibold mb-2">Preview</h4>
              <blockquote className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  "{quote || "Quote preview..."}"
                </p>
                <div className="text-xs font-semibold">— {name || "Name"}</div>
              </blockquote>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setQuote("");
                  setActive(true);
                }}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-500">No testimonials yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((t) => (
                <div
                  key={t._id}
                  className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded flex justify-between items-start"
                >
                  <div>
                    <div className="font-semibold">
                      {t.name}{" "}
                      {t.active === false && (
                        <span className="ml-2 text-xs text-red-600">
                          (Hidden)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t.quote}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(t.updatedAt || t.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => startEdit(t)}
                      className="px-3 py-1 bg-yellow-500 dark:bg-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-600 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="px-3 py-1 bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                    <label className="inline-flex items-center ml-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={t.active !== false}
                        onChange={async (e) => {
                          // quick toggle active
                          try {
                            const res = await fetch(
                              `/api/testimonials/${t._id}`,
                              {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                  active: e.target.checked,
                                }),
                              },
                            );
                            if (!res.ok) throw new Error("Failed to update");
                            // refresh list
                            await fetchList();
                          } catch (err) {
                            console.error(err);
                            alert("Failed to update visibility");
                          }
                        }}
                      />
                      <span className="ml-2">Visible</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
