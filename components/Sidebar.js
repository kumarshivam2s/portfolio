"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { isAdminSessionClient } from "@/lib/adminClient";
import {
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
} from "react-icons/fi";

const navigation = [
  { name: "About", href: "/about" },
  { name: "Resume", href: "/resume" },
  { name: "Projects", href: "/projects" },
  { name: "Stats", href: "/stats" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const socialLinks = [
  { icon: FiGithub, href: "https://github.com/kumarshivam2s", label: "GitHub" },
  {
    icon: FiLinkedin,
    href: "https://linkedin.com/in/kumarshivam2s",
    label: "LinkedIn",
  },
  { icon: FiMail, href: "mailto:kumarshivam.new@gmail.com", label: "Email" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // load persisted value
    try {
      const v = localStorage.getItem("sidebar_collapsed");
      const val = v === "1";
      setCollapsed(val);
      if (val) document.documentElement.classList.add("sidebar-collapsed");
    } catch (e) {}
  }, []);

  const toggleCollapsed = () => {
    try {
      const next = !collapsed;
      setCollapsed(next);
      if (next) {
        localStorage.setItem("sidebar_collapsed", "1");
        document.documentElement.classList.add("sidebar-collapsed");
      } else {
        localStorage.removeItem("sidebar_collapsed");
        document.documentElement.classList.remove("sidebar-collapsed");
      }
      // notify other tabs
      try {
        window.dispatchEvent(new Event("sidebar:toggle"));
      } catch (e) {}
    } catch (e) {}
  };
  useEffect(() => {
    setMounted(true);
    try {
      setIsAdminMode(isAdminSessionClient());
    } catch (e) {
      setIsAdminMode(false);
    }

    // Listen for changes to admin session or admin_view flags (in other tabs)
    const onStorage = (e) => {
      if (
        e.key === "admin_login_ts" ||
        e.key === "admin_view" ||
        e.key === "admin_logged_out"
      ) {
        try {
          // If another tab logged out, clear any tab-local admin state
          if (e.key === "admin_logged_out") {
            try {
              sessionStorage.removeItem("admin_view");
              sessionStorage.removeItem("admin_token");
              sessionStorage.removeItem("admin_login_ts");
            } catch (err) {}
          }
          setIsAdminMode(isAdminSessionClient());
        } catch (err) {
          setIsAdminMode(false);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link
            href={isAdminMode ? "/admin" : "/"}
            className="text-[26px] font-bold"
          >
            SHIVAM's PORTFOLIO
          </Link>
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 top-[65px]"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-[65px] left-0 bottom-0 w-80 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-6">
            {/* Mobile Profile (always visible) */}
            <div className="text-center mb-4 block cursor-pointer">
              <div className="profile-image w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 ring-2 ring-gray-300 dark:ring-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src="/profile.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-[20px] font-bold mb-1">Kumar Shivam</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                kumarshivam.new@gmail.com
              </p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const href = item.href;
                const isActive =
                  pathname === href || pathname?.startsWith(href + "/");

                const handleClick = (e) => {
                  // set admin_view so the public page knows you arrived via admin
                  if (isAdminMode) {
                    try {
                      sessionStorage.setItem(
                        "admin_view",
                        JSON.stringify({ path: href, ts: Date.now() }),
                      );
                    } catch (err) {}
                  }
                  // then close mobile menu
                  try {
                    toggleMobileMenu();
                  } catch (e) {}
                };

                return (
                  <Link
                    key={item.name}
                    href={href}
                    onClick={handleClick}
                    className={`block px-3 py-2 rounded text-base font-medium transition-colors ${
                      isActive
                        ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-3 justify-center">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>

              {/* Mobile copyright inside hamburger menu */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Kumar Shivam. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-[28rem] bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="flex flex-col h-full px-4 pt-3 pb-4 relative">
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:inline-flex items-center justify-center absolute top-3 right-3 w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {collapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            )}
          </button>

          {/* Profile Section */}
          <Link
            href="/"
            onClick={() => {
              if (isAdminMode)
                try {
                  sessionStorage.setItem(
                    "admin_view",
                    JSON.stringify({ path: "/", ts: Date.now() }),
                  );
                } catch (e) {}
            }}
            className="text-center mb-3 block cursor-pointer pt-3 pb-1"
          >
            <div className="profile-image w-28 h-28 mx-auto mb-2 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 ring-2 ring-gray-300 dark:ring-gray-700 shadow transition-shadow duration-150">
              <img
                src="/profile.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="112" height="112"%3E%3Crect width="112" height="112" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="42" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <h2 className="text-xl font-semibold mb-1">Kumar Shivam</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              kumarshivam.new@gmail.com
            </p>
          </Link>

          {/* About Section */}
          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">
              About
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
              Hi, I’m Kumar Shivam — turning chaos into clean pipelines since
              2024.
            </p>
          </div>

          {/* Navigation */}
          <nav className="mb-3 flex-shrink-0">
            <ul className="space-y-0.5">
              {navigation.map((item) => {
                const href = item.href;
                const isActive =
                  pathname === href || pathname?.startsWith(href + "/");

                const handleClick = () => {
                  if (isAdminMode) {
                    try {
                      sessionStorage.setItem(
                        "admin_view",
                        JSON.stringify({ path: href, ts: Date.now() }),
                      );
                    } catch (err) {}
                  }
                };

                return (
                  <li key={item.name}>
                    <Link
                      href={href}
                      onClick={handleClick}
                      className={`block px-3 py-1.5 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme Toggle */}
          {mounted && (
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-base font-medium">Theme</span>
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <FiMoon size={16} />
                  ) : (
                    <FiSun size={16} />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Social Links */}
          <div className="flex gap-4 justify-center mb-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>

          {/* Footer - pushed to bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 text-center pb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Kumar Shivam. All rights reserved.
            </p>
          </div>
        </div>
      </aside>

      {/* Open Sidebar button (shows only when collapsed on lg+ screens) */}
      <button
        onClick={toggleCollapsed}
        aria-label="Open sidebar"
        title="Open sidebar"
        className="open-sidebar-btn hidden items-center gap-2 fixed left-0 top-16 z-50 ml-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-sm">More</span>
      </button>
    </>
  );
}
