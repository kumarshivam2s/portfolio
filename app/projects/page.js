"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiExternalLink,
  FiGithub,
  FiCode,
  FiPlay,
  FiStar,
  FiLink,
} from "react-icons/fi";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchProjects();

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
      setEnabled(data.showProjects !== false);
      setMaintenance(!!data.maintenanceMode);
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects/public");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "github":
        return <FiGithub size={16} />;
      case "external":
        return <FiExternalLink size={16} />;
      case "play":
        return <FiPlay size={16} />;
      case "code":
        return <FiCode size={16} />;
      case "star":
        return <FiStar size={16} />;
      default:
        return <FiLink size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show maintenance UI if site is in maintenance mode
  if (maintenance) {
    return (
      <div className="min-h-screen p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Maintenance Mode</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The site is currently in maintenance mode. Please check back soon.
          </p>
        </div>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-screen p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Projects Disabled</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The projects section is currently disabled by the site
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-6xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Projects</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Selection of projects and work
        </p>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No projects yet.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Check back soon for new projects
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 flex flex-col h-[280px]"
              >
                {/* Title - clickable */}
                <Link href={`/projects/${project._id}`}>
                  <h2 className="text-xl font-semibold mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors cursor-pointer hover:underline">
                    {project.title}
                    {project.featured && (
                      <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-2 py-0.5 rounded no-underline">
                        Featured
                      </span>
                    )}
                  </h2>
                </Link>

                {/* Description - fixed height */}
                <p className="text-gray-600 dark:text-gray-500 text-sm mb-4 leading-relaxed line-clamp-3 min-h-[60px]">
                  {project.description}
                </p>

                {/* Technologies - max 5, fixed position */}
                <div className="mb-4 min-h-[32px]">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies &&
                      project.technologies.slice(0, 5).map((tech, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-1 text-xs text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    {project.technologies &&
                      project.technologies.length > 5 && (
                        <span className="inline-block px-2 py-1 text-xs text-gray-500 dark:text-gray-500">
                          +{project.technologies.length - 5} more
                        </span>
                      )}
                  </div>
                </div>

                {/* Spacer to push links to bottom */}
                <div className="flex-grow"></div>

                {/* Links - always at bottom */}
                <div className="flex gap-4 flex-wrap min-h-[24px] mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  {project.links && project.links.length > 0 ? (
                    project.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        {getIcon(link.icon)}
                        {link.label}
                      </a>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      No links available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
