"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MENU, SITE, SOCIALS, type MenuGroup, type MenuLink } from "@/data/site";
import { unlock } from "@/lib/secrets";
import { Mark } from "./Mark";
import { ThemeSwitch } from "./ThemeSwitch";

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

/* ── dropdowns ───────────────────────────────────────────────── */

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

/* Opens on hover, with a short grace period on the way out so the pointer
   can cross the gap into the panel. The chevron opens it by click or keyboard. */
function Dropdown({
  label,
  href,
  active,
  align = "left",
  children,
}: {
  label: string;
  href?: string;
  active: boolean;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLLIElement>(null);
  const closeT = useRef<number | undefined>(undefined);

  const show = () => {
    window.clearTimeout(closeT.current);
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => setOpen(false), [pathname]);
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
    <li ref={wrap} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <div className="flex items-center">
        {href ? (
          <Link href={href} className="nav-link" aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        ) : (
          <button type="button" className="nav-link" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {label}
          </button>
        )}
        <button
          type="button"
          aria-label={`${open ? "Hide" : "Show"} the ${label} pages`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-ml-1.5 grid h-7 w-5 place-items-center text-[var(--ink-3)] transition-colors hover:text-[var(--ink)]"
        >
          <Chevron open={open} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto" }}
            exit={{ opacity: 0, y: -4, filter: "blur(4px)", pointerEvents: "none" }}
            transition={{ duration: 0.26, ease: EASE }}
            className={`absolute top-full z-10 pt-2 ${align === "right" ? "right-0" : "-left-2"}`}
          >
            <div className="w-[292px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--rule-strong)] bg-[var(--bg-raised)] p-1.5 shadow-[var(--shadow-lg)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function PanelLink({ item, active }: { item: MenuLink; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group/item flex items-start gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors duration-200 hover:bg-[var(--fill-2)]"
    >
      <span
        aria-hidden
        className="mt-[10px] h-px shrink-0 transition-all duration-300 group-hover/item:!w-4 group-hover/item:!bg-[var(--accent)]"
        style={{ width: active ? 16 : 10, background: active ? "var(--accent)" : "var(--rule-strong)" }}
      />
      <span className="min-w-0">
        <span className="block text-[14px] leading-snug" style={{ color: active ? "var(--ink)" : undefined }}>
          {item.label}
        </span>
        <span className="mono-sm mt-0.5 block text-[10.5px] leading-snug text-[var(--ink-3)]">{item.note}</span>
      </span>
    </Link>
  );
}

function SocialLinks() {
  return (
    <ul>
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
              <span className="mono-sm block truncate text-[10.5px] text-[var(--ink-3)]">{s.handle}</span>
            </span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-[var(--ink-3)] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

const pathOf = (href: string) => href.split("?")[0];

/* ── the logo: the S, which opens out into my name ───────────── */

// how long the name stays open after the pointer leaves the S
const PEEK_LINGER = 2500;

function Logo({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  // Hover opens the name straight away, but it lingers after the pointer
  // leaves rather than snapping shut. Mouse only: on a phone a tap would
  // otherwise leave it stuck open.
  const [peek, setPeek] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const enter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(t.current);
    setPeek(true);
  };
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setPeek(false), PEEK_LINGER);
  };

  return (
    <Link
      href="/"
      onClick={onClick}
      onPointerEnter={enter}
      onPointerLeave={leave}
      aria-label={`${SITE.name}, home`}
      data-expanded={expanded || peek}
      className="logo flex min-w-0 items-center gap-2.5"
    >
      <Mark size={30} data-logo-mark="" />
      <span className="logo-name font-display text-[18px] tracking-[-0.01em] md:text-[19px]" data-logo-name="">
        <span>
          {SITE.name.split("").map((ch, i) => (
            <span key={i} className="logo-l" style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}

/* ── the bar ─────────────────────────────────────────────────── */

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const taps = useRef<number[]>([]);

  /* Tap the S five times quickly: the phone-friendly way into the boot
     sequence, since the Konami code needs a keyboard. */
  const onLogoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2600), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      window.dispatchEvent(new Event("konami-boot"));
      unlock("logo");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // While the intro plays, the bar holds my name open so the flying one has
  // somewhere to land; three seconds after it lands, the name folds back into
  // the S (except at the top of the home page, where it always shows).
  const [hold, setHold] = useState(false);
  useEffect(() => {
    const state = document.documentElement.dataset.intro;
    if (state !== "on" && state !== "run") return;
    setHold(true);
    let t = 0;
    const onDone = () => {
      t = window.setTimeout(() => setHold(false), 3000);
    };
    window.addEventListener("intro-done", onDone);
    return () => {
      window.removeEventListener("intro-done", onDone);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // The full name shows at the top of the home page, and for a moment after
  // the intro lands it. Everywhere else it's the S, and hovering opens it out
  // (the Logo handles that itself, so it can linger).
  const expanded = hold || (pathname === "/" && !scrolled && !open);
  // a link with a query ("/contact?topic=talk") is an action, not a page,
  // so it never makes its group look like the page you're on
  const isActive = (g: MenuGroup) =>
    pathname === pathOf(g.href) || !!g.items?.some((it) => !it.href.includes("?") && pathname === it.href);
  const mobileGroups: MenuGroup[] = [
    { label: "Home", href: "/" },
    ...MENU,
    { label: "Work with me", href: "/work-with-me" },
  ];

  return (
    <>
      <header
        className="site-header fixed inset-x-0 top-0 z-[60]"
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
            maskImage: open ? "none" : "linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)",
            WebkitMaskImage: open ? "none" : "linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)",
            height: open ? "100%" : "calc(100% + 16px)",
          }}
        />
        {/* Opaque cap behind the status bar. The gradient above fades out, so
            without this the notch strip would still reveal scrolling content. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 transition-opacity duration-500"
          style={{ height: "var(--safe-t)", background: "var(--bg)", opacity: scrolled || open ? 1 : 0 }}
        />
        <nav
          className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 md:px-10 xl:grid xl:grid-cols-[1fr_auto_1fr]"
          style={{ height: "var(--nav-h)" }}
          aria-label="Main"
        >
          <div className="flex min-w-0 items-center">
            <Logo expanded={expanded} onClick={onLogoTap} />
          </div>

          <ul className="hidden items-center gap-1 xl:flex">
            {MENU.map((g) =>
              g.items ? (
                <Dropdown key={g.label} label={g.label} href={g.href} active={isActive(g)}>
                  {g.items.map((it) => (
                    <PanelLink key={it.href} item={it} active={pathname === pathOf(it.href) && !it.href.includes("?")} />
                  ))}
                </Dropdown>
              ) : (
                <li key={g.label}>
                  <Link href={g.href} className="nav-link" aria-current={isActive(g) ? "page" : undefined}>
                    {g.label}
                  </Link>
                </li>
              )
            )}
            <Dropdown label="Elsewhere" active={false} align="right">
              <SocialLinks />
            </Dropdown>
          </ul>

          <div className="flex shrink-0 items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-palette"))}
              aria-label="Search the site"
              className="glass-surface hidden items-center gap-2 rounded-full px-3 py-1.5 text-[12px] text-[var(--ink-2)] backdrop-blur-md backdrop-saturate-150 transition-colors hover:text-[var(--ink)] md:flex"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <span className="hidden lg:inline">Search</span>
              <kbd className="font-mono text-[10px] tracking-tight">⌘K</kbd>
            </button>
            <ThemeSwitch />
            <Link
              href="/work-with-me"
              className="hidden whitespace-nowrap rounded-full bg-[var(--ink)] px-4 py-1.5 text-[13px] text-[var(--bg)] transition-opacity duration-300 hover:opacity-85 md:block"
            >
              Work with me
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink)] transition-colors hover:bg-[var(--fill)] xl:hidden"
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
            className="fixed inset-0 z-[55] overflow-y-auto overscroll-contain xl:hidden"
            style={{ top: "calc(var(--nav-h) + var(--safe-t))", background: "var(--bg)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <motion.ul
              className="flex flex-col px-5 pt-2"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            >
              {mobileGroups.map((g, i) => {
                // the group's own link already goes to its first page
                const rest = g.items?.filter((it) => it.href !== g.href) ?? [];
                const here = pathname === pathOf(g.href);
                return (
                  <motion.li
                    key={g.label}
                    className="border-b border-[var(--rule)]"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                    }}
                  >
                    <Link
                      href={g.href}
                      className="flex items-baseline gap-4 py-3.5"
                      style={{ color: here ? "var(--accent)" : "var(--ink)" }}
                    >
                      <span className="label w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-display text-[28px] leading-none">{g.label}</span>
                    </Link>
                    {rest.length > 0 && (
                      <ul className="-mt-1 pb-3 pl-10">
                        {rest.map((it) => (
                          <li key={it.href}>
                            <Link
                              href={it.href}
                              className="flex items-baseline gap-3 py-1.5"
                              style={{
                                color:
                                  pathname === pathOf(it.href) && !it.href.includes("?") ? "var(--accent)" : "var(--ink-2)",
                              }}
                            >
                              <span className="shrink-0 text-[15.5px]">{it.label}</span>
                              <span className="mono-sm truncate text-[10.5px] text-[var(--ink-3)]">{it.note}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
            <div className="px-5 pb-12 pt-8">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new Event("open-palette"));
                }}
                className="flex w-full items-center gap-3 rounded-full border border-[var(--rule-strong)] px-4 py-3 text-[14px] text-[var(--ink-2)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                Search the site
              </button>
              <p className="label mt-8">Elsewhere</p>
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
