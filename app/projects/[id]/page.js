"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiExternalLink,
  FiGithub,
  FiCode,
  FiPlay,
  FiStar,
  FiLink,
  FiCalendar,
} from "react-icons/fi";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        setError("Project not found");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "github":
        return <FiGithub size={18} />;
      case "external":
        return <FiExternalLink size={18} />;
      case "play":
        return <FiPlay size={18} />;
      case "code":
        return <FiCode size={18} />;
      case "star":
        return <FiStar size={18} />;
      default:
        return <FiLink size={18} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  export const dynamic = "force-dynamic";

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen p-4 sm:p-8 lg:p-16">
        <div className="max-w-4xl w-full">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-8"
          >
            <FiArrowLeft size={18} />
            Back to Projects
          </Link>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">
              The project you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-16">
      <div className="max-w-4xl w-full">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-8"
        >
          <FiArrowLeft size={18} />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {project.title}
              {project.featured && (
                <span className="ml-3 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-1 rounded align-middle">
                  Featured
                </span>
              )}
            </h1>
          </div>

          {/* Date */}
          {project.createdAt && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 text-sm mb-6">
              <FiCalendar size={14} />
              {formatDate(project.createdAt)}
            </div>
          )}

          {/* Short Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Cover Image */}
        {project.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Reference Images */}
        {project.images && project.images.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              Screenshots & References
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                >
                  <img
                    src={image.url || image}
                    alt={
                      image.caption ||
                      `${project.title} screenshot ${index + 1}`
                    }
                    className="w-full h-auto object-cover"
                  />
                  {image.caption && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 p-3 bg-gray-50 dark:bg-gray-900">
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Content */}
        {project.content && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">About This Project</h2>
            <div
              className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Technologies Used</h2>
            <div className="flex flex-wrap gap-3">
              {project.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="inline-block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Project Links</h2>
            <div className="flex flex-wrap gap-4">
              {project.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {getIcon(link.icon)}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <FiArrowLeft size={18} />
            View All Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
