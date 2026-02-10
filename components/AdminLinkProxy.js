"use client";

import { useEffect } from "react";
import { isAdminSessionClient } from "@/lib/adminClient";

export default function AdminLinkProxy() {
  useEffect(() => {
    // Only rewrite links when admin is logged in; if not logged in, leave public links unchanged
    if (!isAdminSessionClient()) return;

    function shouldIgnore(href) {
      if (!href) return true;
      // Explicitly ignore root
      if (href === "/") return true;
      // Allow same-origin absolute URLs to be proxied; ignore external origins
      if (href.startsWith("http")) {
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return true; // external origin — ignore
          // same-origin absolute URL — treat as internal
        } catch (e) {
          return true;
        }
      }
      if (href.startsWith("mailto:") || href.startsWith("#")) return true;
      if (href.startsWith("/admin")) return true; // already admin
      return false;
    }

    function rewriteLink(a) {
      try {
        const href = a.getAttribute("href");
        if (shouldIgnore(href)) return;

        // normalize to absolute URL (handles relative links correctly)
        const abs = new URL(href, window.location.href);
        // avoid proxying root
        if (abs.pathname === "/") return;

        // add admin_view flag so the preview URL is visible, preserve any existing search/hash
        abs.searchParams.set("admin_view", "1");

        // If the target is already an admin path, do not prefix another /admin — just ensure admin_view is present
        if (abs.pathname.startsWith("/admin")) {
          const adminAbsolute = `${abs.origin}${abs.pathname}${abs.search}${abs.hash}`;
          a.setAttribute("href", adminAbsolute);
          a.dataset.adminProxied = "1";
          return;
        }

        // Include admin_token (if present in sessionStorage) so new tabs can pick up per-tab token
        try {
          const t = sessionStorage.getItem("admin_token");
          if (t) abs.searchParams.set("admin_token", t);
        } catch (e) {}

        // Use absolute admin URL so users see the full admin preview URL in link text
        const adminPath = `${window.location.origin}/admin${abs.pathname}${abs.search}${abs.hash}`;
        a.setAttribute("href", adminPath);
        a.dataset.adminProxied = "1";

        // Attach a click handler so clicking the link sets admin_view for this tab immediately
        if (!a.dataset.adminClickAttached) {
          a.addEventListener("click", function (ev) {
            try {
              sessionStorage.setItem(
                "admin_view",
                JSON.stringify({ path: abs.pathname, ts: Date.now() }),
              );
              // clear any previous dismissed flag so banner re-shows
              sessionStorage.removeItem("admin_view_banner_dismissed");
              // Notify same-tab listeners immediately so the banner can appear without a reload
              try {
                window.dispatchEvent(new Event("admin_view_changed"));
              } catch (e) {}
            } catch (e) {}
          });
          a.dataset.adminClickAttached = "1";
        }
      } catch (e) {
        // noop
      }
    }

    function rewriteAll() {
      document.querySelectorAll("a[href]").forEach(rewriteLink);
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes || []) {
          if (n.nodeType !== 1) continue;
          if (n.tagName === "A") rewriteLink(n);
          else
            n.querySelectorAll &&
              n.querySelectorAll("a[href]").forEach(rewriteLink);
        }
      }
    });

    rewriteAll();
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
