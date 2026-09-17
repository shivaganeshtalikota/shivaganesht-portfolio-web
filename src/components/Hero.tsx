"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { HERO, SITE } from "@/data/site";
import { NeuralField } from "./NeuralField";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden">
      <NeuralField className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

      <div className="shell pt-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* headline */}
          <div className="lg:col-span-7">
            <motion.div
              className="flex items-center gap-3"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {SITE.available && (
                <span className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  </span>
                  <span className="label text-[var(--accent)]">{SITE.availableLabel}</span>
                </span>
              )}
            </motion.div>

            <h1 className="t-hero mt-7">
              {HERO.lines.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, delay: 0.08 + i * 0.08, ease: EASE }}
                  >
                    {i === HERO.lines.length - 1 ? (
                      <>
                        actually <em className="italic text-[var(--accent)]">ship.</em>
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="t-lede safe-text mt-8 max-w-[46ch]"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.42, ease: EASE }}
            >
              {HERO.sub}
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.52, ease: EASE }}
            >
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--ink)] px-6 py-3 text-[14.5px] text-[var(--bg)] transition-opacity duration-300 hover:opacity-85"
              >
                See the work
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a
                href={SITE.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--rule-strong)] px-6 py-3 text-[14.5px] transition-colors duration-300 hover:bg-[var(--fill)]"
              >
                Résumé
                <span className="label">PDF</span>
              </a>
            </motion.div>
          </div>

          {/* portrait */}
          <motion.figure
            className="lg:col-span-5 lg:pt-3"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.24, ease: EASE }}
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-sunken)] lg:max-w-none">
              <Image
                src="/portrait/hero.webp"
                alt={`${SITE.name}, ${SITE.role}`}
                fill
                priority
                sizes="(max-width: 1024px) 340px, 420px"
                className="object-cover object-[50%_18%]"
              />
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-3">
              <span className="label">{SITE.location}</span>
              <span className="label">Est. 2023</span>
            </figcaption>
          </motion.figure>
        </div>

        {/* Stat band. Each cell carries its own top rule, so the dividers
            always line up however the grid reflows. */}
        <motion.dl
          className="mt-14 grid grid-cols-2 gap-x-5 gap-y-8 md:mt-24 md:grid-cols-4 md:gap-x-8 md:gap-y-0"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
        >
          {HERO.stats.map((s) => (
            <div key={s.label} className="flex flex-col border-t border-[var(--rule)] pt-5">
              <dt className="label">{s.label}</dt>
              <dd className="font-display mt-2.5 text-[32px] leading-none tracking-[-0.02em] md:text-[44px]">
                {s.value}
              </dd>
              <dd className="mono-sm mt-2 text-pretty text-[var(--ink-3)]">{s.note}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
