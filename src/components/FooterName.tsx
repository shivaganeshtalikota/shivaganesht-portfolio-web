"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Click my name enough times and the page gives up. */
const LINES = [
  "you can keep going.",
  "still going, then.",
  "two more.",
  "one more. I mean it.",
  "fine. you asked for this.",
];

const AFTER = [
  "ok that's the whole joke.",
  "there is genuinely nothing else here.",
  "…you're very thorough. I respect it.",
  "go read the projects page instead.",
];

export function FooterName() {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const onClick = () => {
    const n = count + 1;
    setCount(n);

    if (n < 5) {
      say(LINES[n - 1]);
      return;
    }

    if (n === 5) {
      say(LINES[4]);
      if (!reduce) {
        const html = document.documentElement;
        setRolling(true);
        html.classList.add("barrel-roll");
        setTimeout(() => {
          html.classList.remove("barrel-roll");
          setRolling(false);
        }, 1200);
      }
      return;
    }

    say(AFTER[(n - 6) % AFTER.length]);
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
                      y: [0, -10 - count * 1.5, 0],
                      rotate: count >= 3 ? [0, i % 2 ? 12 : -12, 0] : 0,
                      color:
                        count >= 2
                          ? ["var(--ink)", "var(--accent)", "var(--ink)"]
                          : "var(--ink)",
                    }
              }
              transition={{
                duration: 0.5,
                delay: i * 0.022,
                ease: EASE,
                repeat: 0,
              }}
            >
              {ch}
            </motion.span>
          )
        )}
      </button>

      <AnimatePresence>
        {toast && (
          <motion.span
            key={toast}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="mono-sm pointer-events-none absolute -bottom-6 left-0 whitespace-nowrap text-[11px] text-[var(--accent)]"
            role="status"
          >
            {rolling ? "🌀 " : ""}
            {toast}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
