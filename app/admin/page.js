"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiveControls from "@/components/LiveControls";
import AdminLinkProxy from "@/components/AdminLinkProxy";
import { getAdminLoginTs, getAdminHeaders } from "@/lib/adminClient";

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalProjects: 0,
    totalComments: 0,
    pendingComments: 0,
    publishedPosts: 0,
    draftPosts: 0,
  });

  useEffect(() => {
    setMounted(true);
    checkSession();

    const onStorage = (e) => {
      if (e.key === "settings_updated_at") fetchSettingsAdmin();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchSettingsAdmin = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setMaintenance(!!data.maintenanceMode);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const checkSession = async () => {
    try {
      const headers = getAdminHeaders();
      // Use the protected validate endpoint which returns 401 when no valid admin session exists
      const response = await fetch("/api/admin/validate", {
        headers,
        credentials: "include",
      });
      if (response.ok) {
        // Valid admin session — set per-tab marker if missing and load admin data
        const ts = getAdminLoginTs();
        if (!ts || Date.now() - ts >= 1000 * 60 * 60) {
          const newTs = Date.now();
          try {
            sessionStorage.setItem("admin_login_ts", String(newTs));
          } catch (e) {}
          setIsLoggedIn(true);
          fetchStats();
          fetchSettingsAdmin();
          startAutoLogoutTimer(newTs);
        } else {
          setIsLoggedIn(true);
          fetchStats();
          fetchSettingsAdmin();
          startAutoLogoutTimer(ts);
        }
      } else {
        // Not authorized
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsLoggedIn(false);
    } finally {
      // mark that we've completed the session check so UI doesn't flash while we verify
      try {
        setCheckedSession(true);
      } catch (e) {}
    }
  };

  const fetchStats = async () => {
    try {
      const headers = getAdminHeaders();
      const [postsRes, projectsRes, commentsRes] = await Promise.all([
        fetch("/api/posts", { headers }),
        fetch("/api/projects", { headers }),
        fetch("/api/comments", { headers }),
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

  const startAutoLogoutTimer = (loginTs) => {
    if (typeof window !== "undefined") {
      if (window.__adminLogoutTimer) clearTimeout(window.__adminLogoutTimer);
      const now = Date.now();
      const elapsed = now - loginTs;
      const remaining = Math.max(0, 1000 * 60 * 60 - elapsed);
      window.__adminLogoutTimer = setTimeout(async () => {
        // Call server logout and clear client state
        try {
          const token = (() => {
            try {
              return sessionStorage.getItem("admin_token");
            } catch (e) {
              return null;
            }
          })();
          await fetch("/api/admin/logout", {
            method: "POST",
            headers: token ? { "x-admin-token": token } : {},
            credentials: "include",
          });
        } catch (err) {
          console.error("Error during auto logout:", err);
        }
        try {
          sessionStorage.removeItem("admin_login_ts");
          sessionStorage.removeItem("admin_token");
        } catch (e) {}
        setIsLoggedIn(false);
        alert("Session expired. Please log in again.");
      }, remaining);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        // Expecting JSON; if server returns HTML for some reason, fallback to text handling
        let data;
        try {
          data = await response.json();
        } catch (err) {
          const txt = await response.text();
          console.warn("Login returned non-JSON response:", txt);
          setError("Login succeeded (non-JSON response). Reloading...");
          window.location.reload();
          return;
        }

        // If server returned a token, save it to sessionStorage (per-tab session)
        try {
          if (data?.admin_token) {
            sessionStorage.setItem("admin_token", data.admin_token);
            sessionStorage.setItem("admin_login_ts", String(Date.now()));
          }
          try {
            sessionStorage.setItem("admin_email", email);
          } catch (e) {}
        } catch (e) {}

        // start timer using current ts
        startAutoLogoutTimer(Date.now());
        setIsLoggedIn(true);
        setEmail("");
        setPassword("");
        fetchStats();
        fetchSettingsAdmin();
      } else {
        let errMsg = "Invalid email or password";
        try {
          const data = await response.json();
          errMsg = data.error || errMsg;
        } catch (e) {
          try {
            const txt = await response.text();
            if (txt) errMsg = txt;
          } catch (e) {}
        }
        setError(errMsg);
      }
    } catch (error) {
      setError("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = (() => {
        try {
          return sessionStorage.getItem("admin_token");
        } catch (e) {
          return null;
        }
      })();

      await fetch("/api/admin/logout", {
        method: "POST",
        headers: token ? { "x-admin-token": token } : {},
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    try {
      sessionStorage.removeItem("admin_login_ts");
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_email");
    } catch (e) {}

    try {
      localStorage.setItem("admin_logged_out", String(Date.now()));
      setTimeout(() => localStorage.removeItem("admin_logged_out"), 1000);
    } catch (e) {}

    if (window.__adminLogoutTimer) {
      clearTimeout(window.__adminLogoutTimer);
      window.__adminLogoutTimer = null;
    }
  };

  if (isLoggedIn && mounted) {
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
            <div className="flex items-center gap-3">
              {maintenance && (
                <span className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm font-medium">
                  Maintenance ON
                </span>
              )}

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Public Site
              </a>

              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Admin link-proxy helper: rewrites site links to open under /admin/... when logged in */}
          <AdminLinkProxy />

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
            {/* Posts (Create + Manage) */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 transition-colors self-start md:col-span-1 lg:col-span-2 flex flex-col h-full">
              <div>
                <h3 className="text-lg font-semibold mb-3">Posts</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Write and manage blog posts: create, edit, feature, or delete
                  posts
                </p>
              </div>
              <div className="flex gap-3 mt-auto">
                <Link
                  href="/admin/posts/new"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Create
                </Link>
                <Link
                  href="/admin/posts"
                  className="inline-block px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Manage
                </Link>
              </div>
            </div>

            {/* Projects (Create + Manage) */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-green-600 dark:hover:border-green-400 transition-colors self-start md:col-span-1 lg:col-span-2 flex flex-col h-full">
              <div>
                <h3 className="text-lg font-semibold mb-3">Projects</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Add and manage projects with images, links, and feature
                  toggles
                </p>
              </div>
              <div className="flex gap-3 mt-auto">
                <Link
                  href="/admin/projects/new"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Create
                </Link>
                <Link
                  href="/admin/projects"
                  className="inline-block px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Manage
                </Link>
              </div>
            </div>

            {/* Moderate Comments */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-purple-600 dark:hover:border-purple-400 transition-colors self-start md:col-span-1 lg:col-span-1 flex flex-col h-full">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Moderate Comments
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Review, approve, or reject user comments
                </p>
              </div>
              <div className="mt-auto">
                <Link
                  href="/admin/comments"
                  className="inline-block px-4 py-2 min-w-[140px] text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  View Comments
                </Link>
              </div>
            </div>

            {/* Testimonials */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-pink-600 dark:hover:border-pink-400 transition-colors self-start md:col-span-1 lg:col-span-1 flex flex-col h-full">
              <div>
                <h3 className="text-lg font-semibold mb-3">Testimonials</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Add, edit, or remove testimonials shown on the public site
                </p>
              </div>
              <div className="mt-auto">
                <Link
                  href="/admin/testimonials"
                  className="inline-block px-4 py-2 min-w-[140px] text-center bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                >
                  Manage Testimonials
                </Link>
              </div>
            </div>

            {/* Live Controls - full width on md+ */}
            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-300 focus-within:border-orange-500 transition-colors flex flex-col h-full md:col-span-2 lg:col-span-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Live Controls</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
                  Toggle site features visible to visitors.
                </p>
              </div>

              <div className="flex-1 mt-2">
                <LiveControls />
              </div>
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

              <div className="space-y-3">
                <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                  Live Controls & Settings
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Toggle site features in real-time (Blog, Projects, Resume,
                      Comments)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Enable/disable search or maintenance mode instantly
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>
                      Changes broadcast to all open tabs for immediate effect
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!checkedSession) {
    return (
      <div className="min-h-screen p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Checking session…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 lg:left-[28rem] flex items-center justify-center p-4 pt-[65px] lg:pt-0 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-300 dark:border-gray-700">
          <h1 className="text-3xl font-bold mb-4 text-center">Admin Login</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
            Sign in to access the admin panel
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            action="/api/admin/login"
            method="post"
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold text-base"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-3">
            Admin roXX!🤘
          </p>
        </div>
      </div>
    </div>
  );
}
