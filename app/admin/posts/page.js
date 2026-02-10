"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

export default function ManagePosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { getAdminHeaders } = await import("@/lib/adminClient");
      const response = await fetch("/api/posts", {
        headers: getAdminHeaders(),
      });

      if (response.status === 401) {
        router.push("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { getAdminHeaders } = await import("@/lib/adminClient");
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post._id !== id));
        alert("Post deleted successfully");
      } else {
        setError("Failed to delete post");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error deleting post:", err);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const { getAdminHeaders } = await import("@/lib/adminClient");
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = posts.map((p) =>
          p._id === id ? { ...p, status: newStatus } : p,
        );
        setPosts(updated);
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
      setError("Failed to update post status");
    }
  };

  const handleReorder = async (id, direction) => {
    try {
      const { getAdminHeaders } = await import("@/lib/adminClient");
      const res = await fetch(`/api/posts/${id}/reorder`, {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) {
        // refresh posts to reflect new order
        await fetchPosts();
      } else {
        const data = await res.json();
        alert(data?.error || "Failed to move post");
      }
    } catch (err) {
      console.error("Error reordering post:", err);
      alert("Error reordering post");
    }
  };

  const filteredPosts = posts
    .filter((p) => (filter === "all" ? true : p.status === filter))
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.author && p.author.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  // Drag and drop handlers
  const dragSrcRef = useRef(null);
  const [dragOverId, setDragOverId] = useState(null);

  const onDragStart = (e, id) => {
    dragSrcRef.current = id;
    try {
      e.dataTransfer.effectAllowed = "move";
    } catch (err) {}
  };

  const onDragOver = (e, id) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const onDrop = async (e, id) => {
    e.preventDefault();
    const srcId = dragSrcRef.current;
    setDragOverId(null);
    if (!srcId || srcId === id) return;

    // Build sorted posts array based on current positions
    const postsSorted = posts
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    const filteredSet = new Set(filteredPosts.map((p) => p._id));
    const originalFilteredIds = postsSorted
      .filter((p) => filteredSet.has(p._id))
      .map((p) => p._id);

    // Compute new filtered order by moving srcId to the position of id
    const newFiltered = [...originalFilteredIds];
    const srcIndex = newFiltered.indexOf(srcId);
    const destIndex = newFiltered.indexOf(id);
    if (srcIndex === -1 || destIndex === -1) {
      // Fallback: just refresh
      await fetchPosts();
      return;
    }
    newFiltered.splice(srcIndex, 1);
    newFiltered.splice(destIndex, 0, srcId);

    // Remove all original filtered items from postsSorted
    const remaining = postsSorted.filter(
      (p) => !originalFilteredIds.includes(p._id),
    );
    const firstIndex = postsSorted.findIndex((p) =>
      originalFilteredIds.includes(p._id),
    );

    // Map ids to full post objects for insertion
    const idToPost = Object.fromEntries(posts.map((p) => [p._id, p]));
    const inserted = newFiltered.map((fid) => idToPost[fid]);

    const newOrdered = [
      ...remaining.slice(0, firstIndex),
      ...inserted,
      ...remaining.slice(firstIndex),
    ];

    // Assign new sequential positions
    const orderPayload = newOrdered.map((p, i) => ({
      id: p._id,
      position: i + 1,
    }));

    // Optimistic update
    setPosts(newOrdered.map((p, i) => ({ ...p, position: i + 1 })));

    try {
      const { getAdminHeaders } = await import("@/lib/adminClient");
      const res = await fetch("/api/posts/reorder", {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderPayload }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data?.error || "Failed to reorder posts");
        await fetchPosts();
      }
    } catch (err) {
      console.error("Error reordering posts:", err);
      alert("Error reordering posts");
      await fetchPosts();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 lg:p-16">
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-6"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <Link
            href="/admin/posts/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            New Post
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 8px center",
            }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Posts Table */}
        {filteredPosts.length === 0 ? (
          <div className="p-6 text-center border border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Title</th>
                  <th className="text-left px-6 py-3 font-semibold">Author</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">Created</th>
                  <th className="text-left px-6 py-3 font-semibold">Views</th>
                  <th className="text-right px-6 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post, idx) => (
                  <tr
                    key={post._id}
                    draggable
                    onDragStart={(e) => onDragStart(e, post._id)}
                    onDragOver={(e) => onDragOver(e, post._id)}
                    onDrop={(e) => onDrop(e, post._id)}
                    className={`border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${dragOverId === post._id ? "bg-blue-50 dark:bg-blue-900/20" : ""} cursor-grab`}
                  >
                    <td className="px-6 py-4 font-medium">
                      {post.title}
                      {post.coverImage && (
                        <p className="text-xs text-gray-500 mt-1">
                          Cover image set
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {post.author || "Admin"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">{post.views || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/posts/${post._id}`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleTogglePublish(post._id, post.status)
                        }
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                      >
                        {post.status === "published" ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={() => handleDelete(post._id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Total posts: {filteredPosts.length} of {posts.length}
        </p>
      </div>
    </div>
  );
}
