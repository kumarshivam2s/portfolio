"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLinkProxy from "@/components/AdminLinkProxy";
import AdminBlogPreview from "@/components/AdminBlogPreview";
import AdminPostPreview from "@/components/AdminPostPreview";
import AdminHomePreview from "@/components/AdminHomePreview";
import AdminProjectsPreview from "@/components/AdminProjectsPreview";

export default function AdminProxyPage({ params }) {
  const pathParts = params?.path || [];
  const target = "/" + (Array.isArray(pathParts) ? pathParts.join("/") : "");

  useEffect(() => {
    // If admin_token provided in URL (transient token from creator tab), copy it into sessionStorage for this tab
    try {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("admin_token");
      if (t) {
        try {
          sessionStorage.setItem("admin_token", t);
          sessionStorage.setItem("admin_login_ts", String(Date.now()));
        } catch (e) {}
        // remove token from URL so it isn't leaked
        url.searchParams.delete("admin_token");
        window.history.replaceState(
          {},
          document.title,
          url.pathname + url.search + url.hash,
        );
      }
    } catch (e) {}

    // If no client-side admin marker, redirect to admin dashboard
    if (!isAdminSessionClient()) {
      window.location.href = "/admin";
    }
  }, []);

  // Redirect admin to the public page directly (no iframe), but first verify server-side session
  const [sessionValid, setSessionValid] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Quick check to see if server recognizes this tab as an admin session
        const { getAdminHeaders } = await import("@/lib/adminClient");
        const headers = getAdminHeaders();
        const res = await fetch("/api/admin/validate", {
          headers,
          credentials: "include",
        });
        if (!mounted) return;

        if (res.ok) {
          // session valid — set admin_view and mark this tab as an admin session
          setSessionValid(true);
          try {
            // If we don't yet have a per-tab token, try to create one from cookie/session for this tab
            try {
              const existing = sessionStorage.getItem("admin_token");
              if (!existing) {
                const sres = await fetch("/api/admin/sessions", {
                  method: "POST",
                  credentials: "include",
                });
                if (sres.ok) {
                  const sdata = await sres.json();
                  if (sdata?.admin_token) {
                    try {
                      sessionStorage.setItem("admin_token", sdata.admin_token);
                      sessionStorage.setItem(
                        "admin_login_ts",
                        String(Date.now()),
                      );
                    } catch (e) {}
                  }
                }
              }
            } catch (err) {
              // ignore session seeding failures
            }

            // Mark this tab so it behaves like an admin tab (clears when tab closes)
            sessionStorage.setItem("admin_login_ts", String(Date.now()));
          } catch (e) {}
          try {
            sessionStorage.setItem(
              "admin_view",
              JSON.stringify({ path: target, ts: Date.now() }),
            );
          } catch (e) {}
          // session valid — set admin_view and mark this tab as an admin session
          // We'll render a client-side preview (no redirect) so refresh stays on /admin/* and hydration works correctly
          try {
            const current = new URL(window.location.href);
            if (current.pathname.startsWith("/admin")) {
              current.searchParams.set("admin_view", "1");
              window.history.replaceState(
                {},
                document.title,
                current.pathname + current.search + current.hash,
              );
            }
          } catch (err) {}
          // don't redirect — the component rendering below will show a client-side preview
          return;
        } else {
          // Not authenticated on server — show the page UI (no redirect) and let user decide
          setSessionValid(false);
        }
      } catch (err) {
        // network or other failure — do not redirect, show explanatory UI
        console.error("Admin proxy session check failed", err);
        if (mounted) setSessionValid(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [target]);

  // UI helpers for the case where server session is not active
  const openAnyway = () => {
    // direct public navigation (no admin proxy) — may show maintenance if server blocks
    window.location.href = target;
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto w-full text-center">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Opening public page…</h2>
          {sessionValid === null && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Checking your admin session and preparing to open{" "}
              <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                {target}
              </code>
              …
            </p>
          )}

          {sessionValid === false && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Your admin session is not active in this tab. To preview pages as
              an admin, please log in first. You can still open the public page,
              but it may show the maintenance page to visitors.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {sessionValid === true ? (
            // Render the appropriate client-side preview based on path
            target === "/" ? (
              <AdminHomePreview />
            ) : target === "/blog" ? (
              <AdminBlogPreview />
            ) : target.startsWith("/blog/") ? (
              <AdminPostPreview id={target.split("/")[2]} />
            ) : target === "/projects" ? (
              <AdminProjectsPreview />
            ) : target.startsWith("/projects/") ? (
              <AdminPostPreview id={target.split("/")[2]} />
            ) : (
              <div>
                <p className="mb-4">
                  Admin preview enabled for <code>{target}</code>.
                </p>
                <a
                  href={`${window.location.origin}/admin${target}?admin_view=1`}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Open in admin preview
                </a>
              </div>
            )
          ) : sessionValid !== false ? (
            <>
              {/* Create a per-tab token then open the admin proxy in a new tab so it sets session state in that tab */}
              <button
                onClick={async () => {
                  try {
                    const parentToken = sessionStorage.getItem("admin_token");
                    const res = await fetch("/api/admin/sessions", {
                      method: "POST",
                      headers: parentToken
                        ? { "x-admin-token": parentToken }
                        : {},
                    });
                    if (res.ok) {
                      const data = await res.json();
                      const t = data?.admin_token;
                      if (t) {
                        // open new tab with transient token in query; the proxy tab will copy token into sessionStorage and remove it from URL
                        const url = new URL(
                          window.location.origin + "/admin" + target,
                        );
                        url.searchParams.set("admin_token", t);
                        url.searchParams.set("admin_view", "1");
                        window.open(url.toString(), "_blank");
                        return;
                      }
                    }
                  } catch (err) {
                    console.error(
                      "Failed to open admin preview in new tab",
                      err,
                    );
                  }

                  // fallback: open simple admin proxy URL
                  const fallback = `/admin${target}?admin_view=1`;
                  window.open(fallback, "_blank");
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Open in new tab
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded"
              >
                Back to Admin
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/admin"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Log in to Preview
              </Link>
              <button
                onClick={openAnyway}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded"
              >
                Open Anyway
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
