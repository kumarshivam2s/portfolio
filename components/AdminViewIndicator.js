"use client";

import { useEffect, useState } from "react";
import { isAdminSessionClient, setAdminViewForTab } from "@/lib/adminClient";

export default function AdminViewIndicator() {
  const [active, setActive] = useState(false);
  const [info, setInfo] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;

    try {
      // Add client-side navigation handler so client-side route changes and same-tab events trigger the admin view promptly
      function handleNavigation() {
        try {
          const url = new URL(window.location.href);

          // copy transient token when present in URL
          const t = url.searchParams.get("admin_token");
          if (t) {
            try {
              sessionStorage.setItem("admin_token", t);
              sessionStorage.setItem("admin_login_ts", String(Date.now()));
            } catch (e) {}
            // remove token param to avoid leaking the token in URLs
            url.searchParams.delete("admin_token");
            try {
              window.history.replaceState(
                {},
                document.title,
                url.pathname + url.search + url.hash,
              );
            } catch (e) {}
          }

          if (url.searchParams.get("admin_view")) {
            try {
              setAdminViewForTab(url.pathname);
              sessionStorage.removeItem("admin_view_banner_dismissed");
            } catch (e) {}
          }

          const raw = sessionStorage.getItem("admin_view");
          if (!raw) return;
          const data = JSON.parse(raw);
          if (!data) return;

          try {
            setBannerDismissed(
              !!sessionStorage.getItem("admin_view_banner_dismissed"),
            );
          } catch (e) {}

          setInfo(data);
          setActive(true);

          // Immediately remove any inline placeholder banner to avoid duplicates — AdminViewIndicator renders the canonical banner
          try {
            var b = document.getElementById("admin-view-inline-banner");
            if (b) b.remove();
            try {
              document.documentElement.style.boxShadow = "";
            } catch (e) {}
          } catch (e) {}

          // Ensure any pre-existing inline top banner is removed (we do not create top banners)
          try {
            var b = document.getElementById("admin-view-inline-banner");
            if (b) b.remove();
            try {
              document.documentElement.style.boxShadow = "";
            } catch (e) {}
          } catch (e) {}
        } catch (e) {
          // ignore
        }
      }

      // run once on mount
      try {
        handleNavigation();
      } catch (e) {}

      // listen for same-tab custom event and navigation events
      try {
        window.addEventListener("admin_view_changed", handleNavigation);
        window.addEventListener("popstate", handleNavigation);
        // patch pushState/replaceState so client-side navigations fire a 'navigation' event
        (function () {
          var _push = history.pushState;
          history.pushState = function () {
            var ret = _push.apply(this, arguments);
            try {
              window.dispatchEvent(new Event("navigation"));
            } catch (e) {}
            return ret;
          };
          var _replace = history.replaceState;
          history.replaceState = function () {
            var ret = _replace.apply(this, arguments);
            try {
              window.dispatchEvent(new Event("navigation"));
            } catch (e) {}
            return ret;
          };
          window.addEventListener("navigation", handleNavigation);
        })();
      } catch (e) {}

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

      // Listen for storage events (logout, banner dismissal, admin_view cleared)
      const onStorage = (e) => {
        if (e.key === "admin_logged_out") {
          try {
            sessionStorage.removeItem("admin_view");
            sessionStorage.removeItem("admin_token");
            sessionStorage.removeItem("admin_login_ts");
            sessionStorage.removeItem("admin_view_banner_dismissed");
          } catch (err) {}
          setActive(false);
        }

        if (e.key === "admin_view") {
          // admin_view removed -> clear state
          if (!sessionStorage.getItem("admin_view")) {
            setActive(false);
            setBannerDismissed(false);
          }
        }

        if (e.key === "admin_view_banner_dismissed") {
          try {
            setBannerDismissed(
              !!sessionStorage.getItem("admin_view_banner_dismissed"),
            );
          } catch (err) {}
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

  // If the inline banner was dismissed for this tab, show a small persistent pill with minimal controls
  if (bannerDismissed) {
    return (
      <div style={{ pointerEvents: "auto" }}>
        <div
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 60,
            pointerEvents: "auto",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold shadow">
              Admin View
            </div>
            <button
              onClick={() => {
                try {
                  sessionStorage.removeItem("admin_view_banner_dismissed");
                } catch (e) {}
                setBannerDismissed(false);
                // Re-show full banner immediately by forcing a small re-render and letting inline script or hydration recreate banner
              }}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded text-xs font-medium"
            >
              Show
            </button>
            <button
              onClick={() => {
                try {
                  sessionStorage.removeItem("admin_view");
                  sessionStorage.removeItem("admin_view_banner_dismissed");
                } catch (e) {}
                setActive(false);
                setBannerDismissed(false);
                try {
                  window.location.href = "/admin";
                } catch (err) {}
              }}
              className="px-2 py-1 bg-white text-red-600 rounded text-xs font-medium"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ pointerEvents: "auto" }}>
      <div
        style={{
          position: "fixed",
          right: 12,
          bottom: 12,
          zIndex: 60,
          pointerEvents: "auto",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold shadow">
            Admin View
          </div>

          {/* Show button: restores full controls (no top banners are used) */}
          <button
            onClick={() => {
              try {
                sessionStorage.removeItem("admin_view_banner_dismissed");
              } catch (e) {}
              setBannerDismissed(false);
            }}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded text-xs font-medium"
          >
            Show
          </button>

          {/* Exit button: clear admin view and go to admin dashboard (login flow will run if not authenticated) */}
          <button
            onClick={async () => {
              try {
                sessionStorage.removeItem("admin_view");
                sessionStorage.removeItem("admin_view_banner_dismissed");
                sessionStorage.removeItem("admin_token");
              } catch (e) {}
              setActive(false);
              setBannerDismissed(false);
              try {
                window.location.href = "/admin";
              } catch (err) {}
            }}
            className="px-2 py-1 bg-white text-red-600 rounded text-xs font-medium"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
