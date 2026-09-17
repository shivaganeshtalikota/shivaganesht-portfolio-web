import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="shell pt-32 pb-12 md:pt-40 md:pb-16">
      <Reveal>
        <p className="text-[13px] font-medium tracking-[0.01em] text-[var(--accent)]">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h1 className="text-title-1 mt-3 text-balance">{title}</h1>
      </Reveal>
      {lede && (
        <Reveal delay={0.16}>
          <p className="text-body-lg mt-5 max-w-2xl text-pretty text-[var(--label-secondary)]">
            {lede}
          </p>
        </Reveal>
      )}
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
      <div className="max-w-2xl">
        {eyebrow && (
          <Reveal>
            <p className="text-[13px] font-medium text-[var(--accent)]">{eyebrow}</p>
          </Reveal>
        )}
        <Reveal delay={0.06}>
          <h2 className="text-title-2 mt-2 text-balance">{title}</h2>
        </Reveal>
        {lede && (
          <Reveal delay={0.12}>
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[var(--label-secondary)] md:text-[17px]">
              {lede}
            </p>
          </Reveal>
        )}
      </div>
      {action && (
        <Reveal delay={0.16}>
          <TextLink href={action.href}>{action.label}</TextLink>
        </Reveal>
      )}
    </div>
  );
}

export function TextLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls =
    "group inline-flex items-center gap-1 text-[15px] font-medium text-[var(--accent)] transition-opacity duration-300 hover:opacity-70";
  const inner = (
    <>
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </>
  );

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noreferrer"
        className={cls}
      >
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
  variant = "primary",
  external,
  download,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
  download?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium transition-all duration-300 active:scale-[0.97]";
  const styles =
    variant === "primary"
      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
      : "border border-[var(--separator-opaque)] text-[var(--label)] hover:bg-[var(--fill-tertiary)]";
  const cls = `${base} ${styles}`;

  const isExternal = external || href.startsWith("http") || href.startsWith("mailto:");
  if (isExternal || download) {
    return (
      <a
        href={href}
        className={cls}
        target={href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noreferrer"
      >
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

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--fill-tertiary)] px-3 py-1 text-[12.5px] font-medium tracking-[-0.003em] text-[var(--label-secondary)]">
      {children}
    </span>
  );
}
