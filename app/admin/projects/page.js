"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAdminHeaders } from "@/lib/adminClient";

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchWithAdminRetry = async (url, opts = {}) => {
    // first attempt with existing headers
    const headers = { ...(opts.headers || {}), ...getAdminHeaders() };
    let res = await fetch(url, {
      ...opts,
      headers,
      credentials: opts.credentials || "include",
    });

    if (res.status !== 401) return res;

    // 401 -> attempt to seed per-tab session using cookie or parent token
    try {
      const seed = await fetch("/api/admin/sessions", {
        method: "POST",
        credentials: "include",
        headers: getAdminHeaders(),
      });
      if (seed.ok) {
        const sdata = await seed.json();
        if (sdata?.admin_token) {
          try {
            sessionStorage.setItem("admin_token", sdata.admin_token);
            sessionStorage.setItem("admin_login_ts", String(Date.now()));
          } catch (e) {}
        }
      }
    } catch (e) {
      // ignore
    }

    // retry once with possibly new token
    const headers2 = { ...(opts.headers || {}), ...getAdminHeaders() };
    return await fetch(url, {
      ...opts,
      headers: headers2,
      credentials: opts.credentials || "include",
    });
  };

  const fetchProjects = async () => {
    try {
      const response = await fetchWithAdminRetry("/api/projects", {});
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else if (response.status === 401) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const headers = getAdminHeaders();
      const response = await fetchWithAdminRetry(`/api/projects/${id}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p._id !== id));
        alert("Project deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project");
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const headers = getAdminHeaders();
      const response = await fetchWithAdminRetry(`/api/projects/${id}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });

      if (response.ok) {
        const updated = projects.map((p) =>
          p._id === id
            ? {
                ...p,
                status: currentStatus === "published" ? "draft" : "published",
              }
            : p,
        );
        setProjects(updated);
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const headers = getAdminHeaders();
      const response = await fetchWithAdminRetry(`/api/projects/${id}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "featured" }),
      });

      if (response.ok) {
        const updated = projects.map((p) =>
          p._id === id ? { ...p, featured: !currentFeatured } : p,
        );
        setProjects(updated);
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const handleReorderProject = async (id, direction) => {
    try {
      const headers = getAdminHeaders();
      const res = await fetchWithAdminRetry(`/api/projects/${id}/reorder`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      if (res.ok) {
        await fetchProjects();
      } else {
        const data = await res.json();
        alert(data?.error || "Failed to move project");
      }
    } catch (err) {
      console.error("Error reordering project:", err);
      alert("Error reordering project");
    }
  };

  const filteredProjects = projects
    .filter((p) => (filter === "all" ? true : p.status === filter))
    .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // Drag and drop handlers for projects
  const projDragSrcRef = useRef(null);
  const [projDragOverId, setProjDragOverId] = useState(null);

  const onProjDragStart = (e, id) => {
    projDragSrcRef.current = id;
    try {
      e.dataTransfer.effectAllowed = "move";
    } catch (err) {}
  };

  const onProjDragOver = (e, id) => {
    e.preventDefault();
    setProjDragOverId(id);
  };

  const onProjDrop = async (e, id) => {
    e.preventDefault();
    const srcId = projDragSrcRef.current;
    setProjDragOverId(null);
    if (!srcId || srcId === id) return;

    const projectsSorted = projects
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    const filteredSet = new Set(filteredProjects.map((p) => p._id));
    const originalFilteredIds = projectsSorted
      .filter((p) => filteredSet.has(p._id))
      .map((p) => p._id);

    const newFiltered = [...originalFilteredIds];
    const srcIndex = newFiltered.indexOf(srcId);
    const destIndex = newFiltered.indexOf(id);
    if (srcIndex === -1 || destIndex === -1) {
      await fetchProjects();
      return;
    }
    newFiltered.splice(srcIndex, 1);
    newFiltered.splice(destIndex, 0, srcId);

    const remaining = projectsSorted.filter(
      (p) => !originalFilteredIds.includes(p._id),
    );
    const firstIndex = projectsSorted.findIndex((p) =>
      originalFilteredIds.includes(p._id),
    );
    const idToProject = Object.fromEntries(projects.map((p) => [p._id, p]));
    const inserted = newFiltered.map((fid) => idToProject[fid]);

    const newOrdered = [
      ...remaining.slice(0, firstIndex),
      ...inserted,
      ...remaining.slice(firstIndex),
    ];
    const orderPayload = newOrdered.map((p, i) => ({
      id: p._id,
      position: i + 1,
    }));

    // Optimistic update
    setProjects(newOrdered.map((p, i) => ({ ...p, position: i + 1 })));

    try {
      const { getAdminHeaders } = await import("@/lib/adminClient");
      const res = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderPayload }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data?.error || "Failed to reorder projects");
        await fetchProjects();
      }
    } catch (err) {
      console.error("Error reordering projects:", err);
      alert("Error reordering projects");
      await fetchProjects();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 lg:p-16">
        <p>Loading projects...</p>
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
          <h1 className="text-3xl font-bold">Manage Projects</h1>
          <Link
            href="/admin/projects/new"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            New Project
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div>
            <input
              type="text"
              placeholder="Search by title..."
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

        {/* Projects Table */}
        {filteredProjects.length === 0 ? (
          <div className="p-6 text-center border border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              No projects found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Title</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">
                    Featured
                  </th>
                  <th className="text-left px-6 py-3 font-semibold">Created</th>
                  <th className="text-right px-6 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, idx) => (
                  <tr
                    key={project._id}
                    draggable
                    onDragStart={(e) => onProjDragStart(e, project._id)}
                    onDragOver={(e) => onProjDragOver(e, project._id)}
                    onDrop={(e) => onProjDrop(e, project._id)}
                    className={`border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${projDragOverId === project._id ? "bg-blue-50 dark:bg-blue-900/20" : ""} cursor-grab`}
                  >
                    <td className="px-6 py-4">{project.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          project.featured
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500"
                        }`}
                      >
                        {project.featured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/projects/${project._id}`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleTogglePublish(project._id, project.status)
                        }
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                      >
                        {project.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                      </button>
                      <button
                        onClick={() =>
                          handleToggleFeatured(project._id, project.featured)
                        }
                        className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                      >
                        {project.featured ? "Unfeature" : "Feature"}
                      </button>

                      <button
                        onClick={() => handleDelete(project._id)}
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
      </div>
    </div>
  );
}
