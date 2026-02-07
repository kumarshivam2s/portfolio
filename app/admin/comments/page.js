"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ManageComments() {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch("/api/comments", {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setComments(comments.filter((comment) => comment._id !== id));
        alert("Comment deleted successfully");
      } else {
        setError("Failed to delete comment");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error deleting comment:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (response.ok) {
        const updated = comments.map((c) =>
          c._id === id ? { ...c, status: newStatus } : c,
        );
        setComments(updated);
      }
    } catch (error) {
      console.error("Error updating comment status:", error);
      setError("Failed to update comment status");
    }
  };

  const filteredComments = comments
    .filter((c) => (filter === "all" ? true : c.status === filter))
    .filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.content &&
          c.content.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "spam":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 lg:p-16">
        <p>Loading comments...</p>
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
        <h1 className="text-3xl font-bold mb-8">Manage Comments</h1>

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
              placeholder="Search by name, email, or content..."
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
            <option value="all">All Comments</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="spam">Spam</option>
          </select>
        </div>

        {/* Comments Table */}
        {filteredComments.length === 0 ? (
          <div className="p-6 text-center border border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              No comments found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Author</th>
                  <th className="text-left px-6 py-3 font-semibold">Email</th>
                  <th className="text-left px-6 py-3 font-semibold">Comment</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">Date</th>
                  <th className="text-right px-6 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => (
                  <tr
                    key={comment._id}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 font-medium">
                      {comment.name || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {comment.email}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">
                      {comment.content}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block w-full max-w-xs">
                        <select
                          value={comment.status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(comment._id, e.target.value)
                          }
                          className={`appearance-none w-full px-2 py-1 pr-6 rounded text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer bg-no-repeat ${getStatusColor(
                            comment.status || "pending",
                          )}`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundPosition: "right 6px center",
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="spam">Spam</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(comment._id)}
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

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Total: {filteredComments.length} of {comments.length} comments
          </p>
          <p>
            Pending:{" "}
            {comments.filter((c) => c.status === "pending" || !c.status).length}{" "}
            | Approved: {comments.filter((c) => c.status === "approved").length}{" "}
            | Spam: {comments.filter((c) => c.status === "spam").length}
          </p>
        </div>
      </div>
    </div>
  );
}
