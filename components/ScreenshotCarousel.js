"use client";

import { useEffect, useRef, useState } from "react";

export default function ScreenshotCarousel({ images = [] }) {
  const containerRef = useRef(null);
  const [index, setIndex] = useState(0);

  // build circular slides: [last, ...images, first]
  const hasMultiple = images && images.length > 1;
  const slides = hasMultiple
    ? [images[images.length - 1], ...images, images[0]]
    : images;

  // set initial position to the first real slide when using clones
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasMultiple) return;
    const onResize = () => {
      const w = el.clientWidth;
      // scroll to the actual first (index 1)
      el.scrollLeft = w;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hasMultiple]);

  // handle scroll to update index and circular jump
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isScrolling;

    const onScroll = () => {
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const w = el.clientWidth;
        const rawIndex = Math.round(el.scrollLeft / w);
        if (hasMultiple) {
          // rawIndex in slides indexes (0..slides.length-1)
          if (rawIndex === 0) {
            // jumped to cloned last -> snap to real last
            el.scrollTo({ left: (slides.length - 2) * w, behavior: "auto" });
            setIndex(slides.length - 3);
          } else if (rawIndex === slides.length - 1) {
            // jumped to cloned first -> snap to real first
            el.scrollTo({ left: 1 * w, behavior: "auto" });
            setIndex(0);
          } else {
            setIndex(rawIndex - 1);
          }
        } else {
          setIndex(rawIndex);
        }
      }, 80);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [slides, hasMultiple]);

  const scrollToReal = (realIndex, behavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (hasMultiple) {
      // account for cloned first at position 1
      el.scrollTo({ left: (realIndex + 1) * w, behavior });
      setIndex(realIndex);
    } else {
      el.scrollTo({ left: realIndex * w, behavior });
      setIndex(realIndex);
    }
  };

  const prev = () => {
    if (index === 0) {
      // go to last
      scrollToReal(images.length - 1);
    } else {
      scrollToReal(index - 1);
    }
  };

  const next = () => {
    if (index === images.length - 1) {
      scrollToReal(0);
    } else {
      scrollToReal(index + 1);
    }
  };

  // pointer drag for desktop swipe (dragging scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onPointerDown = (e) => {
      isDown = true;
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      scrollLeft = el.scrollLeft;
    };
    const onPointerMove = (e) => {
      if (!isDown) return;
      const x = e.clientX;
      const walk = startX - x;
      el.scrollLeft = scrollLeft + walk;
    };
    const onPointerUp = () => {
      isDown = false;
      // snap to nearest real slide
      const w = el.clientWidth;
      const rawIndex = Math.round(el.scrollLeft / w);
      if (hasMultiple) {
        if (rawIndex === 0) scrollToReal(images.length - 1, "auto");
        else if (rawIndex === slides.length - 1) scrollToReal(0, "auto");
        else scrollToReal(rawIndex - 1, "auto");
      } else {
        scrollToReal(rawIndex, "auto");
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [images.length, slides, hasMultiple]);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!images || images.length === 0) return null;

  return (
    <div>
      <div className="relative">
        {/* arrows for desktop */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="hidden md:inline-flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-black/60 p-2 rounded-full shadow"
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="hidden md:inline-flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-black/60 p-2 rounded-full shadow"
        >
          ›
        </button>

        <div
          ref={containerRef}
          className="flex space-x-4 overflow-x-auto snap-x snap-mandatory touch-pan-x scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {slides.map((img, i) => {
            const src = img?.url || img;
            return (
              <div
                key={i}
                className="min-w-[85%] md:min-w-full snap-start rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900"
                style={{ scrollSnapAlign: "start" }}
              >
                <img
                  src={src}
                  alt={img?.caption || `screenshot-${i + 1}`}
                  className="w-full h-64 md:h-96 object-cover"
                />
                {img?.caption && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-white/80 dark:bg-black/60">
                    {img.caption}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* indicators for desktop */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to ${i + 1}`}
            onClick={() => scrollToReal(i)}
            className={`w-2 h-2 rounded-full ${i === index ? "bg-gray-800 dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}`}
          />
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
