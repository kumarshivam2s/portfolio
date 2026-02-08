"use client";

import { useEffect, useState } from "react";

function ToggleRow({ id, checked, onChange, title, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/5 transition-colors">
      <div>
        <div className="text-sm font-medium">{title}</div>
        {description && (
          <div className="text-xs text-gray-400 mt-2">{description}</div>
        )}
      </div>

      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${
          checked ? "bg-orange-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
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
      const data = await res.json();
      setSettings(data);
      // notify other tabs to refresh settings
      try {
        localStorage.setItem("settings_updated_at", String(Date.now()));
      } catch (e) {}
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

        {/* Extra row: four additional toggles */}
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

        <ToggleRow
          id="maintenanceMode"
          checked={!!settings.maintenanceMode}
          onChange={() => toggle("maintenanceMode")}
          title="Maintenance Mode"
          description="Put site into maintenance mode"
        />
      </div>

      <div className="flex items-center gap-3 mt-3">
        {saving && <p className="text-xs text-gray-500">Saving...</p>}
        {saved && <p className="text-xs text-green-500">Saved</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
