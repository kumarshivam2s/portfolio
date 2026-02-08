"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLinkProxy from "@/components/AdminLinkProxy";

export default function AdminProxyPage({ params }) {
  const pathParts = params?.path || [];
  const target = "/" + (Array.isArray(pathParts) ? pathParts.join("/") : "");

  useEffect(() => {
    // Ensure admin session is present on the client, otherwise send back to admin dashboard
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
        const res = await fetch("/api/posts", { credentials: "include" });
        if (!mounted) return;

        if (res.status === 200) {
          // session valid — set admin_view and redirect
          setSessionValid(true);
          try {
            sessionStorage.setItem("admin_view", JSON.stringify({ path: target, ts: Date.now() }));
          } catch (e) {}
          // small delay so user sees the message if they are quickly redirected
          const t = setTimeout(() => {
            window.location.href = target;
          }, 200);
          return () => clearTimeout(t);
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
      <div className="max-w-2xl w-full text-center">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Opening public page…</h2>
          {sessionValid === null && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Checking your admin session and preparing to open <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{target}</code>…</p>
          )}

          {sessionValid === false && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Your admin session is not active in this tab. To preview pages as an admin, please log in first. You can still open the public page, but it may show the maintenance page to visitors.</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          {sessionValid !== false ? (
            <>
              {/* Open the admin proxy in a new tab so it sets admin_view and redirects to the public page in that tab */}
              <a href={`/admin${target}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Open in new tab</a>
              <Link href="/admin" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded">Back to Admin</Link>
            </>
          ) : (
            <>
              <Link href="/admin" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Log in to Preview</Link>
              <button onClick={openAnyway} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded">Open Anyway</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
