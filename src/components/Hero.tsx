"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HERO, SITE } from "@/data/site";
import { Button } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const lines = HERO.headline.split("\n");

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 md:pt-36">
      {/* ambient light — Apple uses a single soft bloom, never a gradient wash */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[110px]"
        style={{
          y: reduce ? 0 : glowY,
          background:
            "radial-gradient(circle at 30% 40%, #0071e3 0%, transparent 60%), radial-gradient(circle at 70% 60%, #af52de 0%, transparent 60%)",
        }}
      />

      <div className="shell relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <motion.p
              className="text-[13px] font-medium tracking-[0.01em] text-[var(--accent)]"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              {HERO.eyebrow}
            </motion.p>

            <h1 className="text-display mt-4 text-balance">
              {lines.map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.95, delay: 0.1 + i * 0.09, ease: EASE }}
                  >
                    {i === lines.length - 1 ? (
                      <span className="accent-gradient">{line}</span>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="text-body-lg mt-6 max-w-xl text-pretty text-[var(--label-secondary)]"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.38, ease: EASE }}
            >
              {HERO.sub}
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap gap-3"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.48, ease: EASE }}
            >
              <Button href="/projects">See the work</Button>
              <Button href={SITE.resume} variant="secondary" download>
                Download résumé
              </Button>
            </motion.div>
          </div>

          {/* portrait */}
          <motion.div
            className="relative mx-auto w-full max-w-[380px] lg:max-w-none"
            style={{ y: reduce ? 0 : imgY }}
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
          >
            <div
              className="relative aspect-square overflow-hidden"
              style={{ borderRadius: "28% / 28%" }}
            >
              <Image
                src="/portrait/hero.webp"
                alt={`${SITE.name}, ${SITE.role}`}
                width={1400}
                height={1400}
                priority
                sizes="(max-width: 1024px) 380px, 460px"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10"
              style={{ borderRadius: "28% / 28%" }}
            />
          </motion.div>
        </div>

        {/* stat tiles */}
        <motion.dl
          className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--separator)] bg-[var(--separator)] md:mt-24 md:grid-cols-4"
          style={{ opacity: reduce ? 1 : fade }}
          initial={reduce ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
        >
          {HERO.stats.map((s) => (
            <div key={s.label} className="bg-[var(--bg)] px-5 py-7 text-center md:px-6 md:py-9">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block text-[28px] font-bold tracking-[-0.025em] tabular-nums md:text-[36px]">
                  {s.value}
                </span>
                <span className="mt-1.5 block text-[13px] font-medium text-[var(--label)]">
                  {s.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-[var(--label-tertiary)]">
                  {s.note}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
