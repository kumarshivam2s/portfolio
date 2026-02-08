"use client";

import { useEffect, useState } from "react";

function ToggleRow({ id, checked, onChange, title, description }) {
  return (
    <div className="flex justify-between py-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/5 transition-colors">
      <div className="flex-1 pr-4">
        <div className="text-sm font-medium mb-1">{title}</div>
        {description && (
          <div className="text-xs text-gray-400">{description}</div>
        )}
      </div>

      <div className="flex items-center">
        <button
          role="switch"
          aria-checked={checked}
          onClick={onChange}
          aria-label={title}
          className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            checked ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function LiveControls() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "settings_updated_at") fetchSettings();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load settings");
    }
  };

  const toggle = async (key) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: !settings[key] };
    const prev = settings;
    setSettings(newSettings); // optimistic
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSettings }),
        credentials: "include",
      });

      // If server rejects preflight / CORS (405), try an explicit OPTIONS and retry once
      if (res.status === 405) {
        console.warn("PUT returned 405 — attempting OPTIONS then retrying");
        try {
          await fetch("/api/settings", {
            method: "OPTIONS",
            credentials: "include",
          });
        } catch (optErr) {
          console.error("OPTIONS retry failed", optErr);
        }

        // retry PUT once
        const retry = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newSettings }),
          credentials: "include",
        });
        const retryData = await retry.json();
        if (!retry.ok) {
          console.error("Retry PUT failed", retryData);
          setError(
            retryData.error || "Failed to save settings (preflight blocked)",
          );
          setSettings(prev);
        } else {
          setSettings(retryData);
          try {
            localStorage.setItem("settings_updated_at", String(Date.now()));
          } catch (e) {}
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } else {
        const data = await res.json();
        if (!res.ok) {
          console.error("PUT /api/settings failed", data);
          setError(data.error || "Failed to save settings");
          setSettings(prev); // rollback optimistic
        } else {
          setSettings(data);
          // notify other tabs to refresh settings
          try {
            localStorage.setItem("settings_updated_at", String(Date.now()));
          } catch (e) {}
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save settings");
      // rollback
      setSettings(prev);
    } finally {
      setSaving(false);
    }
  };

  if (!settings)
    return <p className="text-sm text-gray-500">Loading settings...</p>;

  return (
    <div className="pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ToggleRow
          id="showBlog"
          checked={!!settings.showBlog}
          onChange={() => toggle("showBlog")}
          title="Show Blog"
          description="Toggle blog visibility"
        />

        <ToggleRow
          id="showProjects"
          checked={!!settings.showProjects}
          onChange={() => toggle("showProjects")}
          title="Show Projects"
          description="Toggle projects visibility"
        />

        <ToggleRow
          id="allowComments"
          checked={!!settings.allowComments}
          onChange={() => toggle("allowComments")}
          title="Allow Comments"
          description="Enable public comments"
        />

        <ToggleRow
          id="showStats"
          checked={!!settings.showStats}
          onChange={() => toggle("showStats")}
          title="Show Stats"
          description="Toggle stats page"
        />

        <ToggleRow
          id="showContact"
          checked={!!settings.showContact}
          onChange={() => toggle("showContact")}
          title="Show Contact"
          description="Toggle contact page"
        />

        <ToggleRow
          id="showResume"
          checked={!!settings.showResume}
          onChange={() => toggle("showResume")}
          title="Show Resume"
          description="Show resume page"
        />

        <ToggleRow
          id="enableSearch"
          checked={!!settings.enableSearch}
          onChange={() => toggle("enableSearch")}
          title="Enable Search"
          description="Site search functionality"
        />

        <ToggleRow
          id="showTestimonials"
          checked={!!settings.showTestimonials}
          onChange={() => toggle("showTestimonials")}
          title="Show Testimonials"
          description="Display testimonials"
        />

        <div className="md:col-span-2 lg:col-span-2">
          <ToggleRow
            id="maintenanceMode"
            checked={!!settings.maintenanceMode}
            onChange={() => toggle("maintenanceMode")}
            title="Maintenance Mode"
            description="Put site into maintenance mode"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        {saving && <p className="text-xs text-gray-500">Saving...</p>}
        {saved && <p className="text-xs text-green-500">Saved</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
