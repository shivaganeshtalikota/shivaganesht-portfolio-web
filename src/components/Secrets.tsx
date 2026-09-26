"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SECRETS, foundSecrets, resetSecrets, type SecretId } from "@/lib/secrets";
import { field } from "@/lib/field";
import { SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

type Toast = { id: number; text: string; ms: number };

/* The tracker stays hidden until the first secret is found. That first
   "1 of 17" is the hook: people who find one go looking for the rest. */

export function Secrets() {
  const [found, setFound] = useState<SecretId[]>([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    setFound(foundSecrets());

    const push = (text: string, ms = 3400) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-2), { id, text, ms }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
    };

    const onSecret = (e: Event) => {
      const { id, count } = (e as CustomEvent<{ id: SecretId | null; count: number }>).detail;
      setFound(foundSecrets());
      if (!id) return;
      const s = SECRETS.find((x) => x.id === id);
      push(`✦ ${s?.label.toLowerCase()} · ${count} of ${SECRETS.length}`, 3800);
      if (count === SECRETS.length) {
        setTimeout(() => {
          field({ type: "text", text: `${SECRETS.length}/${SECRETS.length}`, hold: 5000 });
          field({ type: "pulse" });
          push("you found every single one. email me and tell me, genuinely.", 7000);
        }, 900);
      }
    };
    const onToast = (e: Event) => {
      const { text, ms } = (e as CustomEvent<{ text: string; ms: number }>).detail;
      push(text, ms);
    };
    const onOpen = () => setOpen(true);

    window.addEventListener("secret", onSecret);
    window.addEventListener("site-toast", onToast);
    window.addEventListener("open-secrets", onOpen);
    return () => {
      window.removeEventListener("secret", onSecret);
      window.removeEventListener("site-toast", onToast);
      window.removeEventListener("open-secrets", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const total = SECRETS.length;
  const all = found.length === total;

  return (
    <>
      {/* toasts */}
      <div
        className="no-print pointer-events-none fixed left-4 z-[94] flex max-w-[min(360px,calc(100vw-6rem))] flex-col gap-2 md:left-7"
        style={{ bottom: "calc(1.25rem + var(--safe-b))" }}
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mono-sm rounded-[var(--radius-sm)] border border-[var(--rule-strong)] bg-[var(--bg-raised)] px-3.5 py-2.5 text-[11.5px] leading-snug text-[var(--ink)] shadow-[var(--shadow-lg)]"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No floating counter: the count and the clues live in the footer
          (FooterSecrets), and a toast says so whenever one is found. */}

      {/* the list */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="no-print fixed inset-0 z-[125] flex items-end justify-center px-3 pb-3 sm:items-center sm:px-4 sm:pb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Secrets found"
              initial={{ y: 16, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.98 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="relative flex max-h-[82vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule-strong)] bg-[var(--bg-raised)] shadow-[var(--shadow-lg)]"
            >
              <header className="flex items-center justify-between gap-4 border-b border-[var(--rule)] px-5 py-4">
                <div>
                  <p className="label">Secrets</p>
                  <p className="font-display mt-1 text-[26px] leading-none">
                    {found.length} <span className="text-[var(--ink-3)]">of {total}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mono-sm rounded px-2 py-1 text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
                >
                  esc
                </button>
              </header>

              <div className="h-1 w-full bg-[var(--fill-2)]">
                <div
                  className="h-full bg-[var(--accent)] transition-[width] duration-700"
                  style={{ width: `${(found.length / total) * 100}%` }}
                />
              </div>

              <ul className="flex-1 overflow-y-auto px-2 py-2">
                {SECRETS.map((s, i) => {
                  const got = found.includes(s.id);
                  return (
                    <li
                      key={s.id}
                      className="flex items-baseline gap-3 rounded-[var(--radius-sm)] px-3 py-2.5"
                    >
                      <span className="mono-sm w-5 shrink-0 text-[var(--ink-3)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block text-[14px]"
                          style={{ color: got ? "var(--ink)" : "var(--ink-3)" }}
                        >
                          {got ? s.label : "???"}
                        </span>
                        {!got && (
                          <span className="mono-sm block text-[11px] text-[var(--ink-3)]">hint: {s.hint}</span>
                        )}
                      </span>
                      <span aria-hidden className={got ? "text-[var(--accent)]" : "text-[var(--ink-4)]"}>
                        {got ? "✦" : "·"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <footer className="border-t border-[var(--rule)] px-5 py-4">
                {all ? (
                  <a
                    href={`mailto:${SITE.email}?subject=${encodeURIComponent(`I found all ${total} secrets`)}`}
                    className="text-[14px] text-[var(--accent)] transition-opacity hover:opacity-75"
                  >
                    You found every one. Tell me, I would genuinely like to know →
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <p className="mono-sm text-[11px] text-[var(--ink-3)]">
                      The hints are vague on purpose. Most of them are about me.
                    </p>
                    <button
                      type="button"
                      onClick={() => resetSecrets()}
                      className="mono-sm shrink-0 text-[11px] text-[var(--ink-3)] underline-offset-2 hover:underline"
                    >
                      reset
                    </button>
                  </div>
                )}
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
