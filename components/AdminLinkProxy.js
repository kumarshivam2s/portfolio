"use client";

import { useEffect } from "react";
import { isAdminSessionClient } from "@/lib/admin";

export default function AdminLinkProxy() {
  useEffect(() => {
    // Only rewrite links when admin is logged in; if not logged in, leave public links unchanged
    if (!isAdminSessionClient()) return;

    function shouldIgnore(href) {
      if (!href) return true;
      // Explicitly allow public root and external links to remain unchanged
      if (href === "/") return true;
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("#")
      )
        return true;
      if (href.startsWith("/admin")) return true; // already admin
      return false;
    }

    function rewriteLink(a) {
      try {
        const href = a.getAttribute("href");
        if (shouldIgnore(href)) return;

        // normalize relative URLs to absolute path
        let path = href;
        if (!path.startsWith("/")) {
          const abs = new URL(
            path,
            window.location.origin + window.location.pathname,
          );
          path = abs.pathname + abs.search + abs.hash;
        }

        a.setAttribute("href", `/admin${path}`);
        a.dataset.adminProxied = "1";
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
