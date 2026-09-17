"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { NAV, SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

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
        className="fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color,backdrop-filter] duration-500"
        style={{
          background: scrolled || open ? "var(--glass)" : "transparent",
          backdropFilter: scrolled || open ? "saturate(160%) blur(16px)" : "none",
          WebkitBackdropFilter: scrolled || open ? "saturate(160%) blur(16px)" : "none",
          borderBottom: `1px solid ${scrolled && !open ? "var(--glass-rule)" : "transparent"}`,
        }}
      >
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
              top: "var(--nav-h)",
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
              <a
                href={`mailto:${SITE.email}`}
                className="mono-sm break-all text-[var(--ink-2)] transition-colors hover:text-[var(--accent)]"
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
