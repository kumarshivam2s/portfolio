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
        if (url.searchParams.get("admin_view")) {
          try {
            setAdminViewForTab(url.pathname);
          } catch (e) {}
          // Remove the query param to avoid leaking it
          url.searchParams.delete("admin_view");
          window.history.replaceState({}, document.title, url.toString());
        }
      } catch (e) {
        // ignore any URL parsing issues
      }

      if (!isAdminSessionClient()) return;

      const raw = sessionStorage.getItem("admin_view");
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data) return;

      // Verify server-side session quickly; if invalid, clear admin_view
      (async () => {
        try {
          const res = await fetch("/api/posts", { credentials: "include" });
          if (!mounted) return;
          if (res.status === 401) {
            sessionStorage.removeItem("admin_view");
            return;
          }
          // session valid
          setInfo(data);
          setActive(true);
        } catch (err) {
          // network error -> do not enable admin overlay
          console.error("Admin session verification failed", err);
        }
      })();
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
      <div className="fixed inset-0 z-50" aria-hidden>
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
