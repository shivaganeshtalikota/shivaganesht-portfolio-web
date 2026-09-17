"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Click my name enough times and the site slowly loses its composure.
   Three stages, each further apart than the last, so it stays a surprise
   rather than becoming a nuisance. */

const SAY: Record<number, string> = {
  1: "you can keep going.",
  2: "still going, then.",
  3: "two more.",
  4: "one more. I mean it.",
  5: "fine. hold on to something.",
  6: "that was the whole joke.",
  7: "there is genuinely nothing else here.",
  8: "…alright, you've earned another one.",
  9: "no, this is fine.",
  10: "please stop.",
  11: "you leave me no choice.",
  12: "I hope you're happy.",
};

const AFTER = [
  "we're just two people clicking a name now.",
  "the projects page is right there.",
  "I've run out of jokes. you win.",
  "seriously, go read about pAIr.",
];

export function FooterName() {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach(clearTimeout);
      const html = document.documentElement;
      html.classList.remove("barrel-roll", "upside-down", "comic-sans");
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  /* Rotate around the middle of what's on screen, not the middle of a
     7,000px document — otherwise the page swings out of view entirely. */
  const setOrigin = useCallback(() => {
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const y = window.scrollY + vh / 2;
    document.documentElement.style.setProperty("--roll-origin", `50% ${y}px`);
  }, []);

  /* Clicking fast could otherwise stack two stages and leave two competing
     transforms on <body>. Each stage starts from a clean slate. */
  const resetStages = useCallback(() => {
    document.documentElement.classList.remove("barrel-roll", "upside-down", "comic-sans");
  }, []);

  const say = useCallback((text: string, ms = 3200) => {
    const id = Date.now();
    setToast({ text, id });
    later(() => setToast((c) => (c && c.id === id ? null : c)), ms);
  }, []);

  const onClick = () => {
    const n = count + 1;
    setCount(n);
    const html = document.documentElement;

    say(SAY[n] ?? AFTER[(n - 13) % AFTER.length], n === 5 ? 4200 : 3200);

    if (reduce) return;

    // 5 — a slow roll, all the way round
    if (n === 5) {
      resetStages();
      setOrigin();
      html.classList.add("barrel-roll");
      later(() => html.classList.remove("barrel-roll"), 2700);
    }

    // 9 — and this time it just stays there
    if (n === 9) {
      resetStages();
      setOrigin();
      html.classList.add("upside-down");
      later(() => say("ok, righting the ship."), 2600);
      later(() => html.classList.remove("upside-down"), 3600);
    }

    // 12 — the worst thing I can do to a serif portfolio
    if (n === 12) {
      resetStages();
      html.classList.add("comic-sans");
      later(() => say("there. a whole design system, ruined."), 2400);
      later(() => html.classList.remove("comic-sans"), 5200);
    }
  };

  const letters = SITE.name.split("");

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${SITE.name}. Also a button, if you're curious.`}
        className="font-display block cursor-pointer text-left text-[30px] leading-none tracking-[-0.015em] md:text-[38px]"
      >
        {letters.map((ch, i) =>
          ch === " " ? (
            <span key={i}>&nbsp;</span>
          ) : (
            <motion.span
              key={i}
              className="inline-block"
              animate={
                reduce || count === 0
                  ? {}
                  : {
                      y: [0, -9 - Math.min(count, 6) * 2, 0],
                      rotate: count >= 3 ? [0, i % 2 ? 14 : -14, 0] : 0,
                      color:
                        count >= 2 ? ["var(--ink)", "var(--accent)", "var(--ink)"] : "var(--ink)",
                    }
              }
              transition={{ duration: 0.55, delay: i * 0.024, ease: EASE }}
            >
              {ch}
            </motion.span>
          )
        )}
      </button>

      <AnimatePresence mode="wait">
        {toast && (
          <motion.span
            key={toast.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="mono-sm pointer-events-none absolute -bottom-6 left-0 whitespace-nowrap text-[11px] text-[var(--accent)]"
            role="status"
          >
            {toast.text}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
