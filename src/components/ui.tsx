import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageHeader({
  index,
  eyebrow,
  title,
  lede,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: string;
}) {
  return (
    <header className="shell pt-page pb-12 md:pb-20">
      <Reveal>
        <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
          <span className="label">{index}</span>
          <span className="label">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 className="t-1 safe-text mt-8 max-w-[18ch] text-balance">{title}</h1>
      </Reveal>
      {lede && (
        <Reveal delay={0.12}>
          <p className="t-lede safe-text mt-6 max-w-[54ch] text-pretty">{lede}</p>
        </Reveal>
      )}
    </header>
  );
}

export function SectionHead({
  index,
  title,
  lede,
  action,
}: {
  index: string;
  title: ReactNode;
  lede?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-12 border-b border-[var(--rule)] pb-6 md:mb-16">
      <Reveal>
        <span className="label">{index}</span>
      </Reveal>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-[26ch]">
          <Reveal delay={0.05}>
            <h2 className="t-2 safe-text text-balance">{title}</h2>
          </Reveal>
        </div>
        {lede && (
          <Reveal delay={0.1}>
            <p className="safe-text max-w-[40ch] text-pretty text-[15px] leading-relaxed text-[var(--ink-2)]">
              {lede}
            </p>
          </Reveal>
        )}
        {action && (
          <Reveal delay={0.14}>
            <Arrow href={action.href}>{action.label}</Arrow>
          </Reveal>
        )}
      </div>
    </div>
  );
}

export function Arrow({ href, children }: { href: string; children: ReactNode }) {
  const cls =
    "group inline-flex shrink-0 items-center gap-2 text-[14px] text-[var(--ink)] transition-colors duration-300 hover:text-[var(--accent)]";
  const inner = (
    <>
      <span className="link-underline">{children}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
      >
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </>
  );
  if (href.startsWith("http") || href.startsWith("mailto:") || href.endsWith(".pdf")) {
    return (
      <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function Button({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14.5px] transition-all duration-300 active:scale-[0.98]";
  const styles =
    variant === "solid"
      ? "bg-[var(--ink)] text-[var(--bg)] hover:opacity-85"
      : "border border-[var(--rule-strong)] text-[var(--ink)] hover:bg-[var(--fill)]";
  const cls = `${base} ${styles}`;
  const ext = href.startsWith("http") || href.startsWith("mailto:") || href.endsWith(".pdf");

  if (ext) {
    return (
      <a href={href} className={cls} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="mono-sm inline-flex items-center rounded-full border border-[var(--rule)] px-2.5 py-1 text-[11px] text-[var(--ink-2)]">
      {children}
    </span>
  );
}
