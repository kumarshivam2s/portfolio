"use client";

import { useEffect, useState } from "react";

export default function ProfileTeaser() {
  const [showPopup, setShowPopup] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // only run on client and on small screens
    if (typeof window === "undefined") return;
    try {
      const seen = localStorage.getItem("home_profile_seen");
      setDismissed(!!seen);
      if (seen) return;
    } catch (e) {}

    if (window.innerWidth < 768) {
      const t = setTimeout(() => {
        // show a tiny transient banner (no buttons)
        setShowPopup(true);

        // after a short delay, auto-scroll and show the teaser
        setTimeout(() => {
          try {
            window.scrollBy({ top: 120, behavior: "smooth" });
          } catch (e) {}
          setShowTeaser(true);

          // hide teaser after 3.5s
          setTimeout(() => setShowTeaser(false), 3500);

          // hide the popup banner
          setShowPopup(false);

          // mark seen so it doesn't repeat frequently
          try {
            localStorage.setItem("home_profile_seen", "1");
          } catch (e) {}
        }, 700);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      {/* Popup Modal (mobile only) */}
      {showPopup && !dismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center lg:hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg p-5 w-[90%] max-w-xs z-10">
            <h3 className="text-lg font-semibold mb-2">wanna see me!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Tap yes and I’ll show you my profile photo!</p>
            <div className="flex justify-end gap-2">
              <button onClick={handleNo} className="px-3 py-1 rounded border border-gray-300 text-sm">No</button>
              <button onClick={handleYes} className="px-3 py-1 rounded bg-orange-500 text-white text-sm">Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Teaser overlay that drops from above */}
      <div
        aria-hidden={!showTeaser}
        className={`fixed left-0 right-0 top-0 z-40 pointer-events-none flex justify-center transition-transform duration-500 transform ${
          showTeaser ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mt-4 w-[92%] max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md pointer-events-auto py-4 px-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 ring-2 ring-gray-300 dark:ring-gray-700">
            <img src="/profile.jpg" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold">Kumar Shivam</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Hi — I build data & infra</div>
          </div>
        </div>
      </div>
    </>
  );
}
