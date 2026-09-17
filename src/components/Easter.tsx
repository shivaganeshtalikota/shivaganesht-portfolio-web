"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { NAV, SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

const BOOT = [
  "$ whoami",
  "shiva ganesh talikota — founder & product engineer",
  "",
  "$ cat /etc/stack",
  "next.js 16 · typescript strict · tailwind v4 · raw webgl",
  "no three.js. that hero is a 4kb fragment shader.",
  "",
  "$ ls ~/shipped",
  "matrixo/      2,000+ users, 99.9% uptime",
  "automapp/     the model proposes, it never executes",
  "pAIr/         7 agents, 310 policy docs, 15+ languages",
  "",
  "$ uptime",
  "building since 2023. still going.",
  "",
  "$ echo $CONTACT",
  SITE.email,
  "",
  "you found the konami code. nicely done.",
];

type Cmd = { id: string; label: string; hint: string; run: () => void; group: string };

export function Easter() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── console signature ─────────────────────────────────────── */
  useEffect(() => {
    const s = "color:#c93800;font:600 13px ui-monospace,monospace";
    const d = "color:#6e6a61;font:12px ui-monospace,monospace";
    // eslint-disable-next-line no-console
    console.log(
      `%c
   ┌────────────────────────────────┐
   │  SHIVA GANESH TALIKOTA         │
   │  founder & product engineer    │
   └────────────────────────────────┘
%cYou opened the console. I like you already.

  · that hero is a hand-written WebGL fragment shader (~4kb, no three.js)
  · press  ⌘K / Ctrl+K  for the command palette
  · there is a konami code on this page
  · hiring, or want to build something?  ${SITE.email}
`,
      s,
      d
    );
  }, []);

  /* ── konami, plus a few typed words ────────────────────────── */
  useEffect(() => {
    let i = 0;
    let buf = "";

    // typing any of these anywhere on the page does something
    const WORDS: Record<string, () => void> = {
      shiva: () => window.dispatchEvent(new Event("open-terminal")),
      sudo: () => window.dispatchEvent(new Event("open-terminal")),
      hire: () => window.dispatchEvent(new Event("open-palette")),
      theme: () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"),
    };

    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      // konami
      if (k === KONAMI[i]) {
        i += 1;
        if (i === KONAMI.length) {
          i = 0;
          setTerm(true);
        }
      } else {
        i = k === KONAMI[0] ? 1 : 0;
      }

      // typed words — never while the visitor is filling in a field
      if (typing) {
        buf = "";
        return;
      }
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        buf = (buf + e.key.toLowerCase()).slice(-12);
        for (const w of Object.keys(WORDS)) {
          if (buf.endsWith(w)) {
            buf = "";
            WORDS[w]();
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTheme]);

  /* type out the boot sequence */
  useEffect(() => {
    if (!term) {
      setTyped([]);
      return;
    }
    let line = 0;
    setTyped([]);
    const t = setInterval(() => {
      line += 1;
      setTyped(BOOT.slice(0, line));
      if (line >= BOOT.length) clearInterval(t);
    }, 110);
    return () => clearInterval(t);
  }, [term]);

  /* ── palette open/close ────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setTerm(false);
      }
      if (e.key === "/" && !open && !term) {
        const el = document.activeElement;
        const typing = el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
        if (!typing) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-palette", onOpen);
    };
  }, [open, term]);

  useEffect(() => {
    document.body.style.overflow = open || term ? "hidden" : "";
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else {
      setQ("");
      setSel(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, term]);

  const commands = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => {
      router.push(href);
      setOpen(false);
    };
    const ext = (href: string) => () => {
      window.open(href, "_blank", "noopener");
      setOpen(false);
    };
    return [
      ...NAV.map((n) => ({
        id: `nav${n.href}`,
        label: n.label,
        hint: n.href,
        group: "Go to",
        run: go(n.href),
      })),
      {
        id: "email",
        label: "Copy email address",
        hint: SITE.email,
        group: "Actions",
        run: () => {
          navigator.clipboard?.writeText(SITE.email);
          setOpen(false);
        },
      },
      { id: "resume", label: "Download résumé", hint: "PDF", group: "Actions", run: ext(SITE.resume) },
      {
        id: "theme",
        label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`,
        hint: "Theme",
        group: "Actions",
        run: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          setOpen(false);
        },
      },
      { id: "gh", label: "GitHub", hint: "shivaganeshtalikota", group: "Elsewhere", run: ext("https://github.com/shivaganeshtalikota") },
      { id: "li", label: "LinkedIn", hint: "in/shivaganesht", group: "Elsewhere", run: ext("https://www.linkedin.com/in/shivaganesht") },
      { id: "tm", label: "Book a session on Topmate", hint: "shivaganesht", group: "Elsewhere", run: ext(SITE.topmate) },
      { id: "mx", label: "Visit matriXO", hint: "matrixo.in", group: "Elsewhere", run: ext("https://matrixo.in") },
    ];
  }, [router, resolvedTheme, setTheme]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) => (c.label + c.hint + c.group).toLowerCase().includes(s));
  }, [q, commands]);

  useEffect(() => setSel(0), [q]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((i) => (i + 1) % Math.max(filtered.length, 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      filtered[sel]?.run();
    }
  };

  let lastGroup = "";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.18 }}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              className="relative w-full max-w-[540px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule-strong)] bg-[var(--bg-raised)] shadow-[var(--shadow-lg)]"
              initial={{ y: -12, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
              onKeyDown={onListKey}
            >
              <div className="flex items-center gap-3 border-b border-[var(--rule)] px-4">
                <span className="label shrink-0">⌘K</span>
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search pages and actions…"
                  aria-label="Search commands"
                  className="w-full bg-transparent py-4 text-[15px] outline-none placeholder:text-[var(--ink-3)]"
                />
              </div>
              <ul className="max-h-[52vh] overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <li className="px-3 py-6 text-center text-[13px] text-[var(--ink-3)]">Nothing matches that.</li>
                )}
                {filtered.map((c, i) => {
                  const showGroup = c.group !== lastGroup;
                  lastGroup = c.group;
                  return (
                    <li key={c.id}>
                      {showGroup && <p className="label px-3 pb-1 pt-3">{c.group}</p>}
                      <button
                        type="button"
                        onMouseEnter={() => setSel(i)}
                        onClick={c.run}
                        className="flex w-full items-center justify-between gap-4 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors"
                        style={{ background: i === sel ? "var(--fill-2)" : "transparent" }}
                      >
                        <span className="truncate text-[14px]">{c.label}</span>
                        <span className="mono-sm shrink-0 text-[var(--ink-3)]">{c.hint}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* konami terminal */}
      <AnimatePresence>
        {term && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.25 }}
            onClick={() => setTerm(false)}
          >
            <div className="absolute inset-0 bg-[#050505]/96" />
            <motion.pre
              className="relative max-h-[80vh] w-full max-w-[620px] overflow-auto rounded-[var(--radius-md)] border border-[#1f1f1f] bg-[#0a0a0a] p-6 font-mono text-[12.5px] leading-[1.7] text-[#d8d5cd] shadow-2xl"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              {typed.map((l, i) => (
                <div key={i} style={{ color: l.startsWith("$") ? "#ff5c26" : undefined }}>
                  {l || " "}
                </div>
              ))}
              <span className="inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse bg-[#ff5c26]" />
              <div className="mt-5 border-t border-[#1f1f1f] pt-3 text-[11px] text-[#6b675f]">
                press esc or click anywhere to close
              </div>
            </motion.pre>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
