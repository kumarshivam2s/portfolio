"use client";

import { useEffect, useState } from "react";

export default function Testimonials({ testimonials = null }) {
  const defaults = [
    {
      name: "Alice",
      quote: "Shivam is a fantastic engineer — the pipelines are beautiful.",
    },
    { name: "Bob", quote: "Great collaboration and solid systems thinking." },
  ];

  const [list, setList] = useState(testimonials || defaults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testimonials && testimonials.length) {
      setList(testimonials);
      return;
    }

    let mounted = true;
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          // Only show active testimonials on the public site
          const fetched = data.testimonials || defaults;
          setList(fetched.filter((t) => t.active !== false));
        }
      } catch (err) {
        console.error("Failed to fetch testimonials", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
    return () => (mounted = false);
  }, [testimonials]);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Testimonials</h3>

      {loading ? (
        <div className="text-sm text-gray-500">Loading testimonials...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((t, i) => (
            <blockquote
              key={t._id || i}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">"{t.quote}"</p>
              <div className="text-xs font-semibold">— {t.name}</div>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
