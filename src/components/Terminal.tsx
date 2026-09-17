"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { AWARDS, EXPERIENCE, PROJECTS, SITE, EVENTS, TALKS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

type Line = { t: "out" | "cmd" | "accent" | "dim" | "err"; v: string };

const PROMPT = "visitor@shivaganesh:~$";

const MENU: Line[] = [
  { t: "accent", v: "shivaganesh.sh" },
  { t: "dim", v: "pick a number, or type something. `help` lists the rest." },
  { t: "out", v: "" },
  { t: "out", v: "  1  about        the short version" },
  { t: "out", v: "  2  projects     what I have built" },
  { t: "out", v: "  3  experience   where I've worked" },
  { t: "out", v: "  4  speaking     stages, talks and workshops" },
  { t: "out", v: "  5  awards       and what they mean" },
  { t: "out", v: "  6  contact      how to reach me" },
  { t: "out", v: "" },
];

const HELP: Line[] = [
  { t: "accent", v: "commands" },
  { t: "out", v: "  about · projects · experience · speaking · awards · contact" },
  { t: "out", v: "  stack        what this site is built with" },
  { t: "out", v: "  resume       download the PDF" },
  { t: "out", v: "  open <page>  navigate the site" },
  { t: "out", v: "  theme        toggle light / dark" },
  { t: "out", v: "  menu         show the numbered menu" },
  { t: "out", v: "  clear        clear the screen" },
  { t: "out", v: "  exit         close the terminal" },
  { t: "dim", v: "" },
  { t: "dim", v: "  a few more exist that are not on this list. poke around." },
  { t: "out", v: "" },
];

export function Terminal() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [booted, setBooted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = useCallback((add: Line[]) => setLines((l) => [...l, ...add]), []);

  /* one-time nudge so people notice it exists */
  useEffect(() => {
    const seen = (() => {
      try {
        return localStorage.getItem("term-seen");
      } catch {
        return null;
      }
    })();
    if (seen) return;
    const t = setTimeout(() => setNudge(true), 6000);
    const t2 = setTimeout(() => setNudge(false), 16000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setNudge(false);
    try {
      localStorage.setItem("term-seen", "1");
    } catch {
      /* private mode — fine */
    }
    if (!booted) {
      setBooted(true);
      setLines([
        { t: "dim", v: `${SITE.name} — ${SITE.role}` },
        { t: "dim", v: `${SITE.location} · ${new Date().getFullYear()}` },
        { t: "out", v: "" },
        ...MENU,
      ]);
    }
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [open, booted]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-terminal", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-terminal", onOpen);
    };
  }, [open]);

  /* ── command implementations ─────────────────────────────── */

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    push([{ t: "cmd", v: `${PROMPT} ${raw}` }]);
    setHistory((h) => [raw, ...h].slice(0, 60));
    setHIdx(-1);

    const go = (href: string, label: string) => {
      push([{ t: "accent", v: `→ opening ${label}…` }, { t: "out", v: "" }]);
      setTimeout(() => {
        router.push(href);
        setOpen(false);
      }, 420);
    };

    switch (cmd) {
      case "1":
      case "about":
      case "whoami": {
        push([
          { t: "accent", v: "about" },
          { t: "out", v: "" },
          { t: "out", v: "  I started matriXO in 2023, in my second year of college." },
          { t: "out", v: "  It compares what a student has covered against what jobs" },
          { t: "out", v: "  are asking for, and points at the gap. Over 2,000 people" },
          { t: "out", v: "  use it. I built all of it." },
          { t: "out", v: "" },
          { t: "out", v: "  B.Tech CSE (AI & ML), KPRIT Hyderabad, 2022 — 2026." },
          { t: "dim", v: "  type `open about` if you want the longer story." },
          { t: "out", v: "" },
        ]);
        break;
      }
      case "2":
      case "projects":
      case "ls": {
        push([
          { t: "accent", v: `projects (${PROJECTS.length})` },
          { t: "out", v: "" },
          ...PROJECTS.filter((p) => p.featured).flatMap<Line>((p) => [
            { t: "out", v: `  ${p.name.padEnd(26)} ${p.year}` },
            { t: "dim", v: `    ${p.tagline}` },
          ]),
          { t: "out", v: "" },
          { t: "dim", v: `  + ${PROJECTS.filter((p) => !p.featured).length} earlier builds. \`open projects\` for all.` },
          { t: "out", v: "" },
        ]);
        break;
      }
      case "3":
      case "experience": {
        push([
          { t: "accent", v: "experience" },
          { t: "out", v: "" },
          ...EXPERIENCE.flatMap<Line>((r) => [
            { t: "out", v: `  ${r.period.padEnd(18)} ${r.org}` },
            { t: "dim", v: `  ${" ".repeat(18)} ${r.title}` },
          ]),
          { t: "out", v: "" },
        ]);
        break;
      }
      case "4":
      case "speaking": {
        push([
          { t: "accent", v: `speaking — ${EVENTS.length + TALKS.length} events` },
          { t: "out", v: "" },
          ...EVENTS.slice(0, 5).map<Line>((e) => ({
            t: "out",
            v: `  ${e.year.padEnd(10)} ${e.title}`,
          })),
          ...TALKS.slice(0, 3).map<Line>((t) => ({
            t: "out",
            v: `  ${t.year.padEnd(10)} ${t.title}`,
          })),
          { t: "out", v: "" },
          { t: "dim", v: "  four of those were at Microsoft. 31 photos on the site." },
          { t: "out", v: "" },
        ]);
        break;
      }
      case "5":
      case "awards":
      case "recognition": {
        push([
          { t: "accent", v: "recognition" },
          { t: "out", v: "" },
          ...AWARDS.slice(0, 5).flatMap<Line>((a) => [
            { t: "out", v: `  ${a.year.padEnd(12)} ${a.title}` },
            { t: "dim", v: `  ${" ".repeat(12)} ${a.org}` },
          ]),
          { t: "out", v: "" },
        ]);
        break;
      }
      case "6":
      case "contact":
      case "hire": {
        push([
          { t: "accent", v: "contact" },
          { t: "out", v: "" },
          { t: "out", v: `  email      ${SITE.email}` },
          { t: "out", v: "  github     github.com/shivaganeshtalikota" },
          { t: "out", v: "  linkedin   linkedin.com/in/shivaganesht" },
          { t: "out", v: "  topmate    topmate.io/shivaganesht" },
          { t: "out", v: "" },
          { t: "accent", v: `  ${SITE.availableLabel.toLowerCase()}.` },
          { t: "out", v: "" },
        ]);
        break;
      }
      case "stack": {
        push([
          { t: "accent", v: "this site" },
          { t: "out", v: "" },
          { t: "out", v: "  next.js 16 · react 19 · typescript strict · tailwind v4" },
          { t: "out", v: "  instrument serif / instrument sans / jetbrains mono" },
          { t: "out", v: "  the hero is a 3d node graph in raw webgl, about 5kb" },
          { t: "dim", v: "  no three.js. i wrote the perspective matrices by hand." },
          { t: "out", v: "  every page is prerendered" },
          { t: "out", v: "" },
        ]);
        break;
      }
      case "resume":
      case "cv": {
        push([{ t: "accent", v: "→ downloading résumé…" }, { t: "out", v: "" }]);
        window.open(SITE.resume, "_blank", "noopener");
        break;
      }
      case "theme": {
        const next = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(next);
        push([{ t: "accent", v: `→ ${next} mode` }, { t: "out", v: "" }]);
        break;
      }
      case "menu":
        push(MENU);
        break;
      case "help":
      case "?":
        push(HELP);
        break;
      case "clear":
      case "cls":
        setLines([]);
        break;
      case "exit":
      case "quit":
      case "q":
        push([{ t: "dim", v: "bye." }]);
        setTimeout(() => setOpen(false), 260);
        break;

      /* ── easter eggs ───────────────────────────────────────── */
      case "sudo":
      case "sudo su":
      case "sudo -i":
        push([
          { t: "err", v: "visitor is not in the sudoers file." },
          { t: "dim", v: "this incident will be reported. (it will not be)" },
          { t: "out", v: "" },
        ]);
        break;
      case "rm -rf /":
      case "rm -rf":
        push([
          { t: "err", v: "nice try." },
          { t: "dim", v: "this whole thing is prerendered. there is nothing here to delete." },
          { t: "out", v: "" },
        ]);
        break;
      case "coffee":
        push([{ t: "err", v: "418 — I'm a teapot." }, { t: "dim", v: "i run on chai though." }, { t: "out", v: "" }]);
        break;
      case "42":
        push([{ t: "accent", v: "the answer to life, the universe, and everything." }, { t: "dim", v: "still does not ship itself." }, { t: "out", v: "" }]);
        break;
      case "matrix":
        push([{ t: "accent", v: "wake up, Neo…" }, { t: "dim", v: "(try the konami code on the page instead: ↑↑↓↓←→←→BA)" }, { t: "out", v: "" }]);
        break;
      case "konami":
        push([{ t: "dim", v: "↑ ↑ ↓ ↓ ← → ← → B A — press it on the page, not in here." }, { t: "out", v: "" }]);
        break;
      case "pwd":
        push([{ t: "out", v: "/home/shivaganesh/portfolio" }, { t: "out", v: "" }]);
        break;
      case "date":
        push([{ t: "out", v: new Date().toString() }, { t: "out", v: "" }]);
        break;
      case "uptime":
        push([{ t: "out", v: "building since 2023. still going." }, { t: "out", v: "" }]);
        break;
      case "vim":
      case "vi":
        push([{ t: "err", v: "you are already stuck in one terminal. do not push your luck." }, { t: "out", v: "" }]);
        break;
      case "npm install":
        push([{ t: "dim", v: "added 105 packages in 1m" }, { t: "dim", v: "(that actually happened)" }, { t: "out", v: "" }]);
        break;

      default: {
        if (cmd.startsWith("open ")) {
          const page = cmd.slice(5).trim().replace(/^\//, "");
          const map: Record<string, string> = {
            "": "/",
            home: "/",
            about: "/about",
            projects: "/projects",
            work: "/projects",
            experience: "/experience",
            speaking: "/speaking",
            awards: "/awards",
            recognition: "/awards",
            contact: "/contact",
          };
          if (page in map) go(map[page], page || "home");
          else push([{ t: "err", v: `no page called "${page}". try: about, projects, experience, speaking, awards, contact` }, { t: "out", v: "" }]);
          break;
        }
        if (cmd.startsWith("echo ")) {
          push([{ t: "out", v: raw.trim().slice(5) }, { t: "out", v: "" }]);
          break;
        }
        push([
          { t: "err", v: `command not found: ${raw.trim()}` },
          { t: "dim", v: "type `help`, or a number from 1 to 6." },
          { t: "out", v: "" },
        ]);
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      setInput("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(hIdx + 1, history.length - 1);
      if (n >= 0) {
        setHIdx(n);
        setInput(history[n]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = hIdx - 1;
      setHIdx(n);
      setInput(n >= 0 ? history[n] : "");
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const opts = ["about", "projects", "experience", "speaking", "awards", "contact", "stack", "resume", "theme", "menu", "help", "clear", "exit"];
      const m = opts.filter((o) => o.startsWith(input.trim().toLowerCase()));
      if (m.length === 1) setInput(m[0]);
      else if (m.length > 1 && input.trim()) push([{ t: "dim", v: m.join("   ") }]);
    }
  };

  const colour = (t: Line["t"]) =>
    t === "accent"
      ? "var(--accent)"
      : t === "cmd"
        ? "var(--ink)"
        : t === "err"
          ? "#e5484d"
          : t === "dim"
            ? "var(--ink-3)"
            : "var(--ink-2)";

  return (
    <>
      {/* launcher */}
      <div className="no-print fixed right-4 z-[95] flex items-center gap-3 md:right-7"
        style={{ bottom: "calc(1.25rem + var(--safe-b))" }}>
        <AnimatePresence>
          {nudge && !open && (
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, x: 8, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.96, pointerEvents: "none" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="hidden rounded-full border border-[var(--rule)] bg-[var(--bg-raised)] px-3.5 py-2 text-[12.5px] text-[var(--ink-2)] shadow-[var(--shadow)] sm:block"
            >
              psst — there&apos;s a terminal
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close terminal" : "Open interactive terminal"}
          aria-expanded={open}
          whileTap={{ scale: 0.92 }}
          className="relative grid h-12 w-12 place-items-center rounded-full border border-[var(--rule-strong)] bg-[var(--bg-raised)] shadow-[var(--shadow-lg)] transition-colors duration-300 hover:border-[var(--accent)] md:h-13 md:w-13"
        >
          {!open && !nudge && (
            <span className="absolute inset-0 animate-ping rounded-full border border-[var(--accent)] opacity-20" aria-hidden />
          )}
          <span className="font-mono text-[15px] leading-none text-[var(--accent)]" aria-hidden>
            {open ? "×" : ">_"}
          </span>
        </motion.button>
      </div>

      {/* terminal */}
      <AnimatePresence>
        {open && (
          <motion.section
            aria-label="Interactive terminal"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, y: 12, scale: 0.98, pointerEvents: "none" }}
            transition={{ duration: 0.34, ease: EASE }}
            onClick={() => inputRef.current?.focus()}
            className="no-print fixed inset-x-3 z-[96] flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--rule-strong)] bg-[var(--bg-raised)] shadow-[var(--shadow-lg)] sm:inset-x-auto sm:right-7 sm:w-[420px] md:w-[460px]"
            style={{
              bottom: "calc(5.5rem + var(--safe-b))",
              height: "min(60vh, 480px)",
              maxHeight: "calc(100dvh - 9rem - var(--safe-t) - var(--safe-b))",
            }}
          >
            <header className="flex shrink-0 items-center gap-2 border-b border-[var(--rule)] px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#e5484d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f5a623]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#46a758]" />
              </span>
              <span className="mono-sm ml-1 flex-1 truncate text-[var(--ink-3)]">shivaganesh.sh</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                aria-label="Close terminal"
                className="mono-sm rounded px-1.5 text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
              >
                esc
              </button>
            </header>

            <div
              ref={bodyRef}
              className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-[1.6] sm:text-[12.5px] sm:leading-[1.65]"
              role="log"
              aria-live="polite"
            >
              {lines.map((l, i) => (
                <div
                  key={i}
                  style={{ color: colour(l.t) }}
                  className="safe-text whitespace-pre-wrap"
                >
                  {l.v || " "}
                </div>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-[var(--rule)] px-4 py-3">
              <span className="mono-sm shrink-0 text-[var(--accent)]" aria-hidden>
                ❯
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Terminal input"
                placeholder="try 1, or `help`"
                className="w-full bg-transparent font-mono text-[12.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)]"
                style={{ fontSize: "16px" }}
              />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
