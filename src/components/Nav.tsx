"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { NAV, SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`grid h-9 w-9 place-items-center rounded-full text-[var(--label-secondary)] transition-colors duration-300 hover:bg-[var(--fill-tertiary)] hover:text-[var(--label)] ${className}`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
        suppressHydrationWarning
      >
        {isDark ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.4v2M12 19.6v2M2.4 12h2M19.6 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
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
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500"
        style={{
          background: scrolled || open ? "var(--glass)" : "transparent",
          backdropFilter: scrolled || open ? "var(--glass-blur)" : "none",
          WebkitBackdropFilter: scrolled || open ? "var(--glass-blur)" : "none",
          borderBottom: `1px solid ${scrolled && !open ? "var(--separator)" : "transparent"}`,
        }}
      >
        <nav
          className="mx-auto flex max-w-[1120px] items-center justify-between px-[22px] md:px-8"
          style={{ height: "var(--nav-h)" }}
          aria-label="Main"
        >
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-[-0.015em] text-[var(--label)] transition-opacity duration-300 hover:opacity-60"
          >
            {SITE.shortName}
          </Link>

          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV.filter((n) => n.href !== "/").map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative block px-3.5 py-1.5 text-[13px] tracking-[-0.005em] transition-colors duration-300"
                    style={{ color: active ? "var(--label)" : "var(--label-secondary)" }}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-[var(--fill-tertiary)]"
                        transition={{ duration: 0.45, ease: EASE }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/contact"
              className="hidden rounded-full bg-[var(--accent)] px-4 py-1.5 text-[13px] font-medium text-white transition-all duration-300 hover:bg-[var(--accent-hover)] md:block"
            >
              Get in touch
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--label)] transition-colors hover:bg-[var(--fill-tertiary)] md:hidden"
            >
              <span className="relative block h-[11px] w-[17px]">
                <motion.span
                  className="absolute left-0 block h-[1.5px] w-full rounded-full bg-current"
                  animate={open ? { top: 5, rotate: 45 } : { top: 0, rotate: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
                <motion.span
                  className="absolute left-0 block h-[1.5px] w-full rounded-full bg-current"
                  animate={open ? { top: 5, rotate: -45 } : { top: 10, rotate: 0 }}
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
            className="fixed inset-0 z-40 md:hidden"
            style={{
              top: "var(--nav-h)",
              background: "var(--glass-strong)",
              backdropFilter: "var(--glass-blur)",
              WebkitBackdropFilter: "var(--glass-blur)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <motion.ul
              className="flex flex-col px-[22px] pt-3"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
            >
              {NAV.map((item) => (
                <motion.li
                  key={item.href}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <Link
                    href={item.href}
                    className="block border-b border-[var(--separator)] py-4 text-[26px] font-semibold tracking-[-0.022em]"
                    style={{
                      color: pathname === item.href ? "var(--accent)" : "var(--label)",
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
