"use client";

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { FiUsers, FiFileText, FiMessageSquare, FiEye } from "react-icons/fi";

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalViews: 0,
    totalVisitors: 0,
  });
  const [linesOfCode, setLinesOfCode] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLinesOfCode();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats({
          totalPosts: 0,
          totalComments: 0,
          totalViews: 0,
          totalVisitors: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalPosts: 0,
        totalComments: 0,
        totalViews: 0,
        totalVisitors: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLinesOfCode = async () => {
    try {
      const response = await fetch("/api/loc");
      if (response.ok) {
        const data = await response.json();
        setLinesOfCode(data.linesOfCode);
      }
    } catch (error) {
      console.error("Error fetching lines of code:", error);
    }
  };

  const getLastDeployDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const atScaleItems = [
    { label: "Records processed daily", value: "100M+" },
    { label: "Performance improvement", value: "35%" },
    { label: "Production tables", value: "400+" },
    { label: "Rows optimized", value: "50M+" },
    { label: "Distributed systems", value: "Live" },
  ];

  const engineeringDnaItems = [
    { label: "Current obsession", value: "Distributed Systems" },
    { label: "Favorite tool", value: "PySpark" },
    { label: "Default mode", value: "Dark" },
    { label: "Debugging hour", value: "2 AM" },
    { label: "Architecture mindset", value: "Simple > Clever" },
  ];

  const websiteItems = [
    { label: "Built with", value: "Next.js 14" },
    { label: "Lines of JS code", value: linesOfCode.toLocaleString() },
    { label: "Last deployed", value: getLastDeployDate() },
    { label: "Database", value: "MongoDB" },
    { label: "Styling", value: "Tailwind CSS" },
  ];

  const StatCard = ({ label, value }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 bg-white dark:bg-transparent">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-6xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Statistics</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          By the numbers and beyond
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* At Scale Section */}
            <section className="mb-16">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">At Scale</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional impact and production metrics
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {atScaleItems.map((item, index) => (
                  <StatCard key={index} label={item.label} value={item.value} />
                ))}
              </div>
            </section>

            {/* Engineering DNA Section */}
            <section className="mb-16">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Engineering DNA</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Technical preferences and personality
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {engineeringDnaItems.map((item, index) => (
                  <StatCard key={index} label={item.label} value={item.value} />
                ))}
              </div>
            </section>

            {/* This Website Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">This Website</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Technical stack and deployment details
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {websiteItems.map((item, index) => (
                  <StatCard key={index} label={item.label} value={item.value} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
