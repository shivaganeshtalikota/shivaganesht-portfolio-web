import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/JsonLd";
import { Mark } from "@/components/Mark";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { SITE, SOCIALS } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/links" },
  title: "Links",
  description:
    "Every link for Shiva Ganesh Talikota in one place: invite him to speak, work with him, the speaker kit, matriXO, Topmate, LinkedIn, GitHub and Instagram.",
};

/* The page for an Instagram bio: one column, big targets, the things people
   actually came for at the top. */
const PRIMARY = [
  { href: "/contact?topic=talk", label: "Invite me to speak", note: "events, colleges, meetups" },
  { href: "/work-with-me", label: "Work with me", note: "talks, workshops, brands, roles" },
  { href: "/speaking-kit", label: "Speaker kit", note: "bios, headshots, topics, as a PDF" },
  { href: SITE.topmate, label: "Book a 1:1 on Topmate", note: "the first call is free" },
  { href: SITE.companyUrl, label: "matriXO", note: "what I'm building" },
];

// files and other sites open as plain links, not client-side navigation
const isExternal = (href: string) => href.startsWith("http") || href.startsWith("mailto:") || href.endsWith(".pdf");

function Row({ href, label, note, strong }: { href: string; label: string; note?: string; strong?: boolean }) {
  const cls = `group flex items-center justify-between gap-4 rounded-[var(--radius-md)] border px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 ${
    strong
      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] hover:opacity-90"
      : "glass-surface relative backdrop-blur-md backdrop-saturate-150"
  }`;
  const inner = (
    <>
      <span className="min-w-0">
        <span className="block text-[16px] leading-snug">{label}</span>
        {note && (
          <span className={`mono-sm mt-0.5 block text-[11px] ${strong ? "opacity-70" : "text-[var(--ink-3)]"}`}>{note}</span>
        )}
      </span>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 transition-transform duration-500 group-hover:translate-x-1">
        {isExternal(href) ? <path d="M7 17L17 7M9 7h8v8" /> : <path d="M4 12h15M13 6l6 6-6 6" />}
      </svg>
    </>
  );
  return isExternal(href) ? (
    <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export default function LinksPage() {
  return (
    <>
      <Crumbs name="Links" path="/links" />
      <section className="shell pt-page pb-10">
        <div className="mx-auto max-w-[480px]">
          <Reveal>
            <div className="flex flex-col items-center text-center">
              <Mark size={68} />
              <h1 className="font-display mt-6 text-[40px] leading-none tracking-[-0.015em]">{SITE.name}</h1>
              <p className="mono-sm mt-3 text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                {SITE.role} · {SITE.location}
              </p>
              <p className="safe-text mt-5 max-w-[38ch] text-pretty text-[15px] leading-relaxed text-[var(--ink-2)]">
                I build AI systems, run matriXO, and talk about both on stage. Everything useful is below.
              </p>
            </div>
          </Reveal>

          <Stagger className="mt-10 space-y-3">
            {PRIMARY.map((l, i) => (
              <StaggerItem key={l.href}>
                <Row {...l} strong={i === 0} />
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1}>
            <p className="label mt-12">Elsewhere</p>
          </Reveal>
          <Stagger className="mt-4 grid grid-cols-2 gap-3">
            {SOCIALS.filter((s) => s.label !== "Topmate").map((s) => (
              <StaggerItem key={s.label}>
                <Row href={s.href} label={s.label} note={s.label === "Email" ? "write to me" : s.handle} />
              </StaggerItem>
            ))}
            <StaggerItem>
              <Row href={SITE.resume} label="Résumé" note="PDF" />
            </StaggerItem>
          </Stagger>

          <Reveal delay={0.1}>
            <div className="mt-12 text-center">
              <Link href="/" className="link-underline mono-sm text-[12px] text-[var(--ink-2)]">
                or see the whole site
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
