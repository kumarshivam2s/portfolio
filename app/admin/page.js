"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalProjects: 0,
    totalComments: 0,
    pendingComments: 0,
    publishedPosts: 0,
    draftPosts: 0,
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/posts", {
        credentials: "include",
      });
      if (response.ok) {
        setIsLoggedIn(true);
        fetchStats();
      } else if (response.status === 401) {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsLoggedIn(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [postsRes, projectsRes, commentsRes] = await Promise.all([
        fetch("/api/posts", { credentials: "include" }),
        fetch("/api/projects", { credentials: "include" }),
        fetch("/api/comments", { credentials: "include" }),
      ]);

      const posts = (await postsRes.json()) || [];
      const projects = (await projectsRes.json()) || [];
      const comments = (await commentsRes.json()) || [];

      const publishedPosts = posts.filter(
        (p) => p.status === "published",
      ).length;
      const draftPosts = posts.filter((p) => p.status === "draft").length;
      const pendingComments = comments.filter(
        (c) => c.status === "pending",
      ).length;

      setStats({
        totalPosts: posts.length,
        totalProjects: projects.length,
        totalComments: comments.length,
        pendingComments,
        publishedPosts,
        draftPosts,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(true);
        setEmail("");
        setPassword("");
        fetchStats();
      } else {
        const data = await response.json();
        setError(data.error || "Invalid email or password");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    document.cookie =
      "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen p-8 lg:p-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your portfolio content
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
              <h3 className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Total Posts
              </h3>
              <p className="text-3xl font-bold">{stats.totalPosts}</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.publishedPosts} published • {stats.draftPosts} draft
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
              <h3 className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Total Projects
              </h3>
              <p className="text-3xl font-bold">{stats.totalProjects}</p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
              <h3 className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                Total Comments
              </h3>
              <p className="text-3xl font-bold">{stats.totalComments}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                {stats.pendingComments} pending moderation
              </p>
            </div>
          </div>

          {/* Admin Sections */}
          <h2 className="text-2xl font-bold mb-6">Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Create Post */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold mb-3">Create Post</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Write and publish new blog posts with rich text editor
              </p>
              <Link
                href="/admin/posts/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                New Post
              </Link>
            </div>

            {/* Manage Posts */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold mb-3">Manage Posts</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Edit, delete, or publish existing posts
              </p>
              <Link
                href="/admin/posts"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Posts
              </Link>
            </div>

            {/* Create Project */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-green-500 transition-colors">
              <h3 className="text-lg font-semibold mb-3">Create Project</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Add new projects with images and links
              </p>
              <Link
                href="/admin/projects/new"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                New Project
              </Link>
            </div>

            {/* Manage Projects */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-green-500 transition-colors">
              <h3 className="text-lg font-semibold mb-3">Manage Projects</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Edit, delete, or feature projects
              </p>
              <Link
                href="/admin/projects"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                View Projects
              </Link>
            </div>

            {/* Comments */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-purple-500 transition-colors">
              <h3 className="text-lg font-semibold mb-3">Moderate Comments</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Review, approve, or reject user comments
              </p>
              <Link
                href="/admin/comments"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                View Comments
              </Link>
            </div>
          </div>

          {/* Features List */}
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Available Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                  Posts & Blogs
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Rich text editor with formatting options</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Draft and published status management</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Scheduled publish dates</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Tags and author attribution</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-green-600 dark:text-green-400">
                  Projects
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Multiple images per project</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Custom links with icons</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Feature and publish toggles</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Auto-generated slugs</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                  Comments
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Pending/Approved/Spam status</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Bulk moderation actions</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Filter and search capabilities</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Comment status tracking</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Analytics
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Content overview dashboard</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Post and project statistics</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Comment tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>View count monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-300 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-2 text-center">Admin Login</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
            Sign in to access the admin panel
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-4">
            Check .env.local for admin credentials
          </p>
        </div>
      </div>
    </div>
  );
}
