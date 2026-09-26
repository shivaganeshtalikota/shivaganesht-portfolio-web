"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { unlock } from "@/lib/secrets";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Vim-style "g then a letter" navigation, plus ? for the cheat sheet.
   Deliberately no single-letter shortcuts: the site also listens for
   typed words like "chai" and "matrix", and those must never collide. */

const GOTO: { key: string; href: string; label: string }[] = [
  { key: "h", href: "/", label: "Home" },
  { key: "a", href: "/about", label: "About" },
  { key: "p", href: "/projects", label: "Work" },
  { key: "e", href: "/experience", label: "Experience" },
  { key: "s", href: "/speaking", label: "Speaking" },
  { key: "r", href: "/awards", label: "Recognition" },
  { key: "n", href: "/now", label: "Now" },
  { key: "w", href: "/work-with-me", label: "Work with me" },
  { key: "k", href: "/speaking-kit", label: "Speaker kit" },
  { key: "c", href: "/contact", label: "Contact" },
];

const OTHER: { keys: string; label: string }[] = [
  { keys: "⌘ K  or  /", label: "Command palette" },
  { keys: "?", label: "This sheet" },
  { keys: "esc", label: "Close whatever is open" },
  { keys: "↑ ↑ ↓ ↓ ← → ← → B A", label: "You know what this is" },
];

export function Shortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const gAt = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)
      )
        return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
        unlock("shortcuts");
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      const k = e.key.toLowerCase();
      const now = performance.now();
      if (k === "g") {
        gAt.current = now;
        setPending(true);
        setTimeout(() => setPending(false), 1100);
        return;
      }
      if (now - gAt.current < 1100) {
        const hit = GOTO.find((g) => g.key === k);
        gAt.current = 0;
        setPending(false);
        if (hit) {
          e.preventDefault();
          setOpen(false);
          router.push(hit.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      {/* a tiny "g…" indicator so the sequence feels acknowledged */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="no-print mono-sm pointer-events-none fixed left-1/2 top-[calc(var(--nav-h)+var(--safe-t)+14px)] z-[70] -translate-x-1/2 rounded-full border border-[var(--rule-strong)] bg-[var(--bg-raised)] px-3 py-1 text-[11px] text-[var(--ink-2)] shadow-[var(--shadow)]"
          >
            g <span className="text-[var(--ink-3)]">then…</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="no-print fixed inset-0 z-[125] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts"
              initial={{ y: 14, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative max-h-[86vh] w-full max-w-[560px] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--rule-strong)] bg-[var(--bg-raised)] p-6 shadow-[var(--shadow-lg)] md:p-7"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-display text-[28px] leading-none">Shortcuts</p>
                <span className="label">press g, then a letter</span>
              </div>

              <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {GOTO.map((g) => (
                  <li key={g.key} className="flex items-center justify-between gap-3 border-b border-[var(--rule)] py-2">
                    <span className="text-[14px] text-[var(--ink-2)]">{g.label}</span>
                    <kbd className="mono-sm rounded border border-[var(--rule-strong)] px-1.5 py-0.5 text-[11px]">
                      g {g.key}
                    </kbd>
                  </li>
                ))}
              </ul>

              <ul className="mt-6 space-y-2">
                {OTHER.map((o) => (
                  <li key={o.label} className="flex items-center justify-between gap-3 border-b border-[var(--rule)] py-2">
                    <span className="text-[14px] text-[var(--ink-2)]">{o.label}</span>
                    <kbd className="mono-sm shrink-0 rounded border border-[var(--rule-strong)] px-1.5 py-0.5 text-[11px]">
                      {o.keys}
                    </kbd>
                  </li>
                ))}
              </ul>

              <p className="mono-sm mt-6 text-[11px] leading-relaxed text-[var(--ink-3)]">
                There are also a handful of words you can just type anywhere on the page. None of them
                are listed here. Most of them are about me.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
