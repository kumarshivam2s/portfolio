"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateSlug } from "@/lib/utils";

const iconOptions = [
  { value: "github", label: "GitHub" },
  { value: "link", label: "Link" },
  { value: "external", label: "External" },
  { value: "play", label: "Play" },
  { value: "code", label: "Code" },
  { value: "star", label: "Star" },
];

export default function CreateProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    fullDescription: "",
    content: "",
    coverImage: "",
    technologies: "",
    images: [],
    status: "draft",
    featured: false,
    links: [],
  });

  const [currentLink, setCurrentLink] = useState({
    label: "",
    url: "",
    icon: "link",
  });

  const [currentImage, setCurrentImage] = useState({
    url: "",
    caption: "",
  });

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleAddLink = () => {
    if (currentLink.label && currentLink.url) {
      setFormData({
        ...formData,
        links: [...formData.links, currentLink],
      });
      setCurrentLink({ label: "", url: "", icon: "link" });
    }
  };

  const handleRemoveLink = (index) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    });
  };

  const handleAddImage = () => {
    if (currentImage.url) {
      setFormData({
        ...formData,
        images: [...formData.images, currentImage],
      });
      setCurrentImage({ url: "", caption: "" });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        technologies: formData.technologies
          ? formData.technologies
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
        credentials: "include",
      });

      if (response.ok) {
        router.push("/admin/projects");
      } else {
        const data = await response.json();
        setError(data.error || "Error creating project");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-3xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-6"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-8">Create New Project</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              required
              placeholder="Project title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="auto-generated"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from title
            </p>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Short Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Brief description (for cards)"
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Full Description
            </label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) =>
                setFormData({ ...formData, fullDescription: e.target.value })
              }
              placeholder="Detailed project description"
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Detailed Content (for project detail page) */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Detailed Content (HTML supported)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="<p>Detailed content about the project...</p>"
              rows="10"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              This content appears on the project detail page. HTML is
              supported.
            </p>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Reference Images Section */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Reference Images / Screenshots
            </h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={currentImage.url}
                  onChange={(e) =>
                    setCurrentImage({ ...currentImage, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={currentImage.caption}
                  onChange={(e) =>
                    setCurrentImage({
                      ...currentImage,
                      caption: e.target.value,
                    })
                  }
                  placeholder="Image caption..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="button"
                onClick={handleAddImage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Add Image
              </button>
            </div>

            {/* Images List */}
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-2">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={img.url || img}
                        alt={img.caption || `Image ${idx + 1}`}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm truncate max-w-xs">
                          {img.url || img}
                        </p>
                        {img.caption && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {img.caption}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Technologies
            </label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) =>
                setFormData({ ...formData, technologies: e.target.value })
              }
              placeholder="React, Node.js, MongoDB"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of technologies
            </p>
          </div>

          {/* Links Section */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Project Links</h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Link Label
                </label>
                <input
                  type="text"
                  value={currentLink.label}
                  onChange={(e) =>
                    setCurrentLink({ ...currentLink, label: e.target.value })
                  }
                  placeholder="e.g., GitHub, Live Demo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={currentLink.url}
                  onChange={(e) =>
                    setCurrentLink({ ...currentLink, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Icon</label>
                <select
                  value={currentLink.icon}
                  onChange={(e) =>
                    setCurrentLink({ ...currentLink, icon: e.target.value })
                  }
                  className="appearance-none w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-no-repeat"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 12px center",
                  }}
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddLink}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Add Link
              </button>
            </div>

            {/* Links List */}
            {formData.links.length > 0 && (
              <div className="space-y-2">
                {formData.links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{link.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {link.url}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="appearance-none w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 12px center",
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-7">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-semibold">Featured Project</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-gray-300 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
