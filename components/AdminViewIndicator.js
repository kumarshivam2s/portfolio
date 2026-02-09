"use client";

import { useEffect, useState } from "react";
import { isAdminSessionClient, setAdminViewForTab } from "@/lib/admin";

export default function AdminViewIndicator() {
  const [active, setActive] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let mounted = true;

    try {
      // If admin_view is provided as a query param (e.g., ?admin_view=1), copy it into sessionStorage for this tab
      try {
        const url = new URL(window.location.href);
        // If a transient token is present in the URL (coming from a creator tab), copy it into sessionStorage and remove it
        const t = url.searchParams.get("admin_token");
        if (t) {
          try {
            sessionStorage.setItem("admin_token", t);
            sessionStorage.setItem("admin_login_ts", String(Date.now()));
          } catch (e) {}
          // remove token param to avoid leaking the token in URLs
          url.searchParams.delete("admin_token");
          window.history.replaceState(
            {},
            document.title,
            url.pathname + url.search + url.hash,
          );
        }

        if (url.searchParams.get("admin_view")) {
          try {
            setAdminViewForTab(url.pathname);
          } catch (e) {}
          // Keep the query param visible so the URL clearly shows admin preview mode
        }
      } catch (e) {
        // ignore any URL parsing issues
      }

      const raw = sessionStorage.getItem("admin_view");
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data) return;

      // Optimistically show the admin overlay for a snappier UX if admin_view is set in this tab,
      // then verify server-side session in the background. If verification fails we remove admin_view.
      setInfo(data);
      setActive(true);

      (async () => {
        try {
          const { getAdminHeaders } = await import("@/lib/admin");
          const headers = getAdminHeaders();
          const res = await fetch("/api/posts", { headers });
          if (!mounted) return;
          if (res.status === 401) {
            // session not valid on server — remove admin view immediately
            sessionStorage.removeItem("admin_view");
            setActive(false);
            return;
          }

          // session valid; if this tab doesn't yet have a client-side login marker, set it now
          try {
            const ts = sessionStorage.getItem("admin_login_ts");
            if (!ts)
              sessionStorage.setItem("admin_login_ts", String(Date.now()));
          } catch (e) {}
        } catch (err) {
          // network error -> keep optimistic overlay but do not persist state
          console.error("Admin session verification failed", err);
        }
      })();

      // Listen for logout broadcasts from other tabs and clear admin_view if received
      const onStorage = (e) => {
        if (e.key === "admin_logged_out") {
          try {
            sessionStorage.removeItem("admin_view");
            sessionStorage.removeItem("admin_token");
            sessionStorage.removeItem("admin_login_ts");
          } catch (err) {}
          setActive(false);
        }
      };

      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener("storage", onStorage);
      };
    } catch (e) {
      // noop
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (!active) return null;

  return (
    <div style={{ pointerEvents: "none" }}>
      {/* Top banner badge (visible and persistent while in admin view) */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center pointer-events-auto">
        <div className="bg-red-600 text-white px-4 py-2 rounded-b shadow-md text-sm font-semibold flex items-center gap-4">
          <span>Admin preview enabled</span>
          {info?.path && (
            <span className="opacity-80 text-xs">Viewing: {info.path}</span>
          )}
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("admin_view");
              } catch (e) {}
              setActive(false);
              try {
                window.location.href = "/admin";
              } catch (err) {}
            }}
            className="ml-4 px-2 py-1 bg-white text-red-600 rounded text-xs font-medium"
          >
            Exit
          </button>
        </div>
      </div>

      <div className="fixed inset-0 z-40" aria-hidden>
        <div
          style={{
            boxShadow: "inset 0 0 0 4px rgba(220,38,38,0.9)",
            borderRadius: 0,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 60,
            pointerEvents: "auto",
          }}
        >
          <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold shadow">
            Admin View
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={async () => {
                try {
                  sessionStorage.removeItem("admin_view");
                } catch (e) {}
                setActive(false);
                // Redirect to admin dashboard after exiting admin view
                try {
                  window.location.href = "/admin";
                } catch (err) {}
              }}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded text-xs font-medium"
            >
              Exit admin view
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
