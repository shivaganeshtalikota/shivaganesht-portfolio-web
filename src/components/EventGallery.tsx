"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { EventPhoto, SpeakingEvent } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

type Slide = { photo: EventPhoto; caption: string; sub: string };

export function EventGallery({ events }: { events: SpeakingEvent[] }) {
  const slides: Slide[] = events.flatMap((ev) =>
    ev.photos.map((photo) => ({ photo, caption: ev.title, sub: `${ev.role} · ${ev.venue}` }))
  );

  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + slides.length) % slides.length)),
    [slides.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % slides.length)),
    [slides.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, prev, next]);

  let cursor = 0;

  return (
    <>
      <div>
        {events.map((ev, evi) => {
          const base = cursor;
          cursor += ev.photos.length;

          return (
            <article
              key={ev.slug}
              id={ev.slug}
              className="scroll-mt-28 border-t border-[var(--rule)] py-16 md:py-24"
            >
              <div className="shell">
                <div className="grid gap-6 md:grid-cols-12 md:gap-10">
                  <div className="md:col-span-4">
                    <div className="flex items-baseline gap-3">
                      <span className="label">{String(evi + 1).padStart(2, "0")}</span>
                      <span className="mono-sm text-[var(--ink-3)]">{ev.year}</span>
                    </div>
                    <h2 className="font-display safe-text mt-4 text-[27px] leading-[1.12] md:text-[33px]">
                      {ev.title}
                    </h2>
                    <p className="label mt-4 text-[var(--accent)]">{ev.role}</p>
                    <p className="safe-text mt-1.5 text-[13.5px] text-[var(--ink-3)]">{ev.venue}</p>
                  </div>
                  <div className="md:col-span-8 md:pt-1">
                    <p className="safe-text text-pretty text-[16px] leading-[1.7] text-[var(--ink-2)]">
                      {ev.blurb}
                    </p>
                  </div>
                </div>

                {/* true masonry — photos keep their own proportions, nothing is cropped.
                    Column count follows the photo count so short sets don't leave a dead column. */}
                <div
                  className={`mt-10 gap-3 [&>*]:mb-3 ${
                    ev.photos.length <= 2
                      ? "columns-2"
                      : ev.photos.length === 3
                        ? "columns-2 md:columns-3"
                        : "columns-2 md:columns-3 lg:columns-4"
                  }`}
                >
                  {ev.photos.map((photo, i) => (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => setIndex(base + i)}
                      aria-label={`Open photo ${i + 1} of ${ev.photos.length} from ${ev.title}`}
                      className="group relative block w-full break-inside-avoid overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-sunken)]"
                    >
                      <Image
                        src={photo.thumb}
                        alt={`${ev.title} — ${ev.venue}`}
                        width={photo.w}
                        height={photo.h}
                        sizes="(max-width: 768px) 46vw, (max-width: 1024px) 30vw, 23vw"
                        className="h-auto w-full transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-[var(--ink)] opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <AnimatePresence>
        {index !== null && (
          <motion.div
            className="fixed inset-0 z-[110] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.25, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <div className="absolute inset-0 bg-[#080807]/97 backdrop-blur-xl" onClick={close} />

            <div className="relative z-10 flex items-center justify-between px-5 py-4">
              <span className="mono-sm text-white/55">
                {String(index + 1).padStart(2, "0")} / {slides.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-6">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white md:left-8"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>

              <motion.figure
                key={slides[index].photo.src}
                className="flex max-h-full flex-col items-center"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Image
                  src={slides[index].photo.src}
                  alt={slides[index].caption}
                  width={slides[index].photo.w}
                  height={slides[index].photo.h}
                  sizes="100vw"
                  className="max-h-[70vh] w-auto rounded-[var(--radius-sm)] object-contain"
                  priority
                />
                <figcaption className="mt-5 max-w-[46ch] text-center">
                  <p className="safe-text text-[15px] text-white">{slides[index].caption}</p>
                  <p className="safe-text mt-1.5 text-[12.5px] text-white/50">{slides[index].sub}</p>
                </figcaption>
              </motion.figure>

              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white md:right-8"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
