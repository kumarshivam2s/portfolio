"use client";

import { useEffect, useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
} from "react-icons/fi";

export default function ContactPage() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setEnabled(data.showContact !== false);
      } catch (err) {
        console.error("Failed to load settings for contact", err);
      }
    };
    fetchSettings();

    const onStorage = (e) => {
      if (e.key === "settings_updated_at") fetchSettings();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!enabled) {
    return (
      <div className="min-h-screen p-4 sm:p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Contact Disabled</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The contact page is currently disabled by the site administrator.
          </p>
        </div>
      </div>
    );
  }

  const contactInfo = [
    {
      icon: FiMail,
      label: "Email",
      value: "kumarshivam.new@gmail.com",
      href: "mailto:kumarshivam.new@gmail.com",
    },
    {
      icon: FiPhone,
      label: "Phone",
      value: "+91 98765 43210",
      href: "tel:+919876543210",
    },
    {
      icon: FiMapPin,
      label: "Location",
      value: "Noida, Uttar Pradesh, India",
      href: "#",
    },
  ];

  const socialLinks = [
    {
      icon: FiGithub,
      label: "GitHub",
      href: "https://github.com/kumarshivam2s",
    },
    {
      icon: FiLinkedin,
      label: "LinkedIn",
      href: "https://linkedin.com/in/kumarshivam2s",
    },
    {
      icon: FiTwitter,
      label: "Twitter",
      href: "https://twitter.com/kumarshivam2s",
    },
    {
      icon: FiInstagram,
      label: "Instagram",
      href: "https://instagram.com/kumarshivam2s",
    },
    {
      icon: FiMail,
      label: "Email",
      href: "mailto:kumarshivam.new@gmail.com",
    },
  ];

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Contact</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          I respond faster to ideas than to spam.
          <br />
          Reach out if you want to connect, collaborate, or just say hi.
        </p>

        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-gray-200 dark:border-gray-800">
            Connect
          </h2>

          <div className="space-y-4 mb-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.href}
                  className="flex items-start gap-3 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {info.label}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {info.value}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Follow</h3>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    title={social.label}
                  >
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
