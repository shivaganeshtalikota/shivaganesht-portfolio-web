"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { NAV, SITE, SOCIALS } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── social icons ────────────────────────────────────────────── */

const ICONS: Record<string, React.ReactNode> = {
  GitHub: (
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  ),
  LinkedIn: (
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3V9zm7 0h3.8v1.71h.05c.53-.95 1.83-1.96 3.76-1.96 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21h-4V9z" />
  ),
  Instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.2" />
    </>
  ),
  Topmate: (
    <>
      <circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  Email: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

function Elsewhere() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[13.5px] transition-colors duration-300"
        style={{ color: open ? "var(--ink)" : "var(--ink-2)" }}
      >
        Elsewhere
        <motion.svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
            exit={{ opacity: 0, y: -4, pointerEvents: "none" }}
            transition={{ duration: 0.24, ease: EASE }}
            className="absolute right-0 top-full z-10 w-[236px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--rule-strong)] bg-[var(--bg-raised)] p-1.5 shadow-[var(--shadow-lg)]"
          >
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors duration-200 hover:bg-[var(--fill-2)]"
                >
                  <span className="shrink-0 text-[var(--ink-3)] transition-colors duration-200 group-hover:text-[var(--accent)]">
                    <Icon name={s.label} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] leading-tight">{s.label}</span>
                    <span className="mono-sm block truncate text-[10.5px] text-[var(--ink-3)]">
                      {s.handle}
                    </span>
                  </span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="shrink-0 text-[var(--ink-3)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  >
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-2)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden suppressHydrationWarning>
        {dark ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
          </>
        )}
      </svg>
    </button>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[60]"
        // padding, not margin, so the glass layer below covers the notch too —
        // otherwise page content scrolls up and shows above the bar
        style={{ paddingTop: "var(--safe-t)" }}
      >
        {/* The blur lives on its own layer spanning the full header box,
            notch included, and is masked to fade out at the bottom so there's
            no hard band cutting across the page. Nav content stays crisp. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500"
          style={{
            opacity: scrolled || open ? 1 : 0,
            background: open
              ? "var(--bg)"
              : "linear-gradient(to bottom, var(--glass) 0%, var(--glass) 62%, transparent 100%)",
            backdropFilter: "saturate(180%) blur(22px)",
            WebkitBackdropFilter: "saturate(180%) blur(22px)",
            maskImage: open
              ? "none"
              : "linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)",
            WebkitMaskImage: open
              ? "none"
              : "linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)",
            height: open ? "100%" : "calc(100% + 16px)",
          }}
        />
        {/* Opaque cap behind the status bar. The gradient above fades out, so
            without this the notch strip would still reveal scrolling content. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 transition-opacity duration-500"
          style={{
            height: "var(--safe-t)",
            background: "var(--bg)",
            opacity: scrolled || open ? 1 : 0,
          }}
        />
        <nav
          className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 md:px-10"
          style={{ height: "var(--nav-h)" }}
          aria-label="Main"
        >
          <Link href="/" className="group flex min-w-0 items-baseline gap-2">
            <span className="font-display truncate text-[17px] tracking-[-0.01em] md:text-[19px]">
              {SITE.name}
            </span>
            <span className="label hidden shrink-0 pb-px lg:inline">{SITE.initials}</span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.filter((n) => n.href !== "/").map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative block px-3 py-1.5 text-[13.5px] transition-colors duration-300"
                    style={{ color: active ? "var(--ink)" : "var(--ink-2)" }}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute inset-x-3 -bottom-px h-px bg-[var(--accent)]"
                        transition={{ duration: 0.45, ease: EASE }}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Elsewhere />
            </li>
          </ul>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-palette"))}
              aria-label="Open command palette"
              className="hidden items-center gap-2 rounded-full border border-[var(--rule)] px-3 py-1.5 text-[12px] text-[var(--ink-3)] transition-colors hover:border-[var(--rule-strong)] hover:text-[var(--ink)] md:flex"
            >
              <span>Search</span>
              <kbd className="font-mono text-[10px] tracking-tight">⌘K</kbd>
            </button>
            <ThemeToggle />
            <Link
              href="/contact"
              className="hidden rounded-full bg-[var(--ink)] px-4 py-1.5 text-[13px] text-[var(--bg)] transition-opacity duration-300 hover:opacity-85 md:block"
            >
              Get in touch
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink)] transition-colors hover:bg-[var(--fill)] lg:hidden"
            >
              <span className="relative block h-[10px] w-[16px]">
                <motion.span
                  className="absolute left-0 block h-[1.5px] w-full bg-current"
                  animate={open ? { top: 4.5, rotate: 45 } : { top: 0, rotate: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
                <motion.span
                  className="absolute left-0 block h-[1.5px] w-full bg-current"
                  animate={open ? { top: 4.5, rotate: -45 } : { top: 9, rotate: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[55] lg:hidden"
            style={{
              top: "calc(var(--nav-h) + var(--safe-t))",
              background: "var(--bg)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <motion.ul
              className="flex flex-col px-5 pt-4"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            >
              {NAV.map((item, i) => (
                <motion.li
                  key={item.href}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <Link
                    href={item.href}
                    className="flex items-baseline gap-4 border-b border-[var(--rule)] py-4"
                    style={{ color: pathname === item.href ? "var(--accent)" : "var(--ink)" }}
                  >
                    <span className="label w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[30px] leading-none">{item.label}</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="px-5 pt-8">
              <p className="label">Elsewhere</p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noreferrer"
                      aria-label={s.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--rule)] text-[var(--ink-2)] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      <Icon name={s.label} size={18} />
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${SITE.email}`}
                className="mono-sm mt-5 inline-block break-all text-[var(--ink-2)] transition-colors hover:text-[var(--accent)]"
              >
                {SITE.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
