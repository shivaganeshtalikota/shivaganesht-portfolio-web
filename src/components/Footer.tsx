import Link from "next/link";
import { SITE, SOCIALS } from "@/data/site";
import { SECRETS } from "@/lib/secrets";
import { FooterName } from "./FooterName";
import { FooterSecrets } from "./FooterSecrets";
import { Mark } from "./Mark";

/* Every page on the site, grouped the way a visitor would look for it:
   who I am and what I've made, and then everything an organiser or a brand
   needs. Nothing should be more than one scroll to the bottom away. */
const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "The site",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About me" },
      { href: "/now", label: "Now" },
      { href: "/projects", label: "Projects" },
      { href: "/experience", label: "Experience" },
      { href: "/awards", label: "Recognition" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "For organisers",
    links: [
      { href: "/work-with-me", label: "Work with me" },
      { href: "/speaking", label: "Talks & events" },
      { href: "/speaking-kit", label: "Speaker kit" },
      { href: "/contact?topic=talk", label: "Invite me to speak" },
      { href: "/brand", label: "Logo & brand" },
      { href: "/links", label: "All my links" },
    ],
  },
];

const linkCls = "text-[14px] text-[var(--ink-2)] transition-colors duration-300 hover:text-[var(--ink)]";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--rule)] bg-[var(--bg-sunken)]">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3.5">
              <Link href="/brand" aria-label="The logo, to download" title="The logo, to download" className="shrink-0 transition-transform duration-500 hover:-rotate-6">
                <Mark size={40} />
              </Link>
              <FooterName />
            </div>
            <p className="safe-text mt-7 max-w-[34ch] text-[14.5px] leading-relaxed text-[var(--ink-2)]">
              <span className="block">
                {SITE.role} at{" "}
                <a href={SITE.companyUrl} target="_blank" rel="noreferrer" className="link-underline text-[var(--ink)]">
                  matriXO
                </a>
                .
              </span>
              <span className="block">Based in {SITE.location}.</span>
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="safe-text mt-6 inline-block text-[15px] text-[var(--accent)] transition-opacity hover:opacity-70"
            >
              {SITE.email}
            </a>
            <div className="mt-5">
              <FooterSecrets total={SECRETS.length} />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className="md:col-span-2" aria-label={col.title}>
              <p className="label">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-3">
            <p className="label">Elsewhere</p>
            <ul className="mt-4 space-y-2.5">
              {SOCIALS.map((s) => (
                <li key={s.label} className="flex items-baseline justify-between gap-4">
                  <a href={s.href} target={s.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className={linkCls}>
                    {s.label}
                  </a>
                  <span className="mono-sm truncate text-[11px] text-[var(--ink-3)]">{s.handle}</span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-4">
                <a href={SITE.resume} target="_blank" rel="noreferrer" className={linkCls}>
                  Résumé
                </a>
                <span className="mono-sm text-[11px] text-[var(--ink-3)]">PDF</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-[var(--rule)] pt-6 md:flex-row md:items-center md:justify-between">
          <p className="mono-sm text-[var(--ink-3)]">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <p className="mono-sm text-[var(--ink-3)]">
            Built in Hyderabad · press <kbd className="text-[var(--ink-2)]">⌘K</kbd> to search
          </p>
        </div>
      </div>
    </footer>
  );
}
