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

  // running offset so a photo's index in the flat slide list is findable
  let cursor = 0;

  return (
    <>
      <div className="space-y-24 md:space-y-32">
        {events.map((ev) => {
          const base = cursor;
          cursor += ev.photos.length;

          return (
            <article key={ev.slug} id={ev.slug} className="scroll-mt-28">
              <div className="shell">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent)]">
                      {ev.role}
                    </span>
                    <span className="text-[13px] tabular-nums text-[var(--label-tertiary)]">
                      {ev.year}
                    </span>
                  </div>
                  <h2 className="text-title-2 mt-4 text-balance">{ev.title}</h2>
                  <p className="mt-2 text-[14px] text-[var(--label-tertiary)]">{ev.venue}</p>
                  <p className="mt-5 text-pretty text-[15.5px] leading-relaxed text-[var(--label-secondary)] md:text-[17px]">
                    {ev.blurb}
                  </p>
                </div>
              </div>

              <div className="mt-9 grid auto-rows-[180px] grid-cols-2 gap-3 px-[22px] sm:auto-rows-[220px] sm:grid-cols-3 md:px-8 lg:auto-rows-[260px] lg:grid-cols-4">
                {ev.photos.map((photo, i) => {
                  const wide = photo.w / photo.h > 1.45;
                  const tall = photo.h / photo.w > 1.4;
                  return (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => setIndex(base + i)}
                      aria-label={`Open photo ${i + 1} from ${ev.title}`}
                      className={`group relative overflow-hidden rounded-[var(--radius-md)] bg-[var(--fill-tertiary)] ${
                        wide ? "col-span-2" : ""
                      } ${tall ? "row-span-2" : ""}`}
                    >
                      <Image
                        src={photo.thumb}
                        alt={`${ev.title} — ${ev.venue}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/12"
                      />
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <div
              className="absolute inset-0 bg-black/92"
              style={{ backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
              onClick={close}
            />

            <div className="relative z-10 flex items-center justify-between px-5 py-4 text-white/85">
              <span className="text-[13px] tabular-nums">
                {index + 1} / {slides.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-4">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-8"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>

              <motion.figure
                key={slides[index].photo.src}
                className="flex max-h-full max-w-5xl flex-col items-center"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Image
                  src={slides[index].photo.src}
                  alt={slides[index].caption}
                  width={slides[index].photo.w}
                  height={slides[index].photo.h}
                  sizes="100vw"
                  className="max-h-[72vh] w-auto rounded-[var(--radius-md)] object-contain"
                  priority
                />
                <figcaption className="mt-5 max-w-xl text-center">
                  <p className="text-[15px] font-medium text-white">{slides[index].caption}</p>
                  <p className="mt-1 text-[13px] text-white/60">{slides[index].sub}</p>
                </figcaption>
              </motion.figure>

              <button
                type="button"
                onClick={next}
                aria-label="Next photo"
                className="absolute right-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
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
