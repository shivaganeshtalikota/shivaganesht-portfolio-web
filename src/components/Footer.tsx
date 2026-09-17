import Link from "next/link";
import { NAV, SITE, SOCIALS } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--rule)] bg-[var(--bg-sunken)]">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-[30px] leading-none md:text-[38px]">{SITE.name}</p>
            <p className="safe-text mt-4 max-w-[34ch] text-[14.5px] leading-relaxed text-[var(--ink-2)]">
              {SITE.role} at{" "}
              <a href={SITE.companyUrl} target="_blank" rel="noreferrer" className="link-underline text-[var(--ink)]">
                matriXO
              </a>
              . Based in {SITE.location}.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="safe-text mt-6 inline-block text-[15px] text-[var(--accent)] transition-opacity hover:opacity-70"
            >
              {SITE.email}
            </a>
          </div>

          <nav className="md:col-span-3" aria-label="Footer">
            <p className="label">Pages</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-[14px] text-[var(--ink-2)] transition-colors duration-300 hover:text-[var(--ink)]">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="label">Elsewhere</p>
            <ul className="mt-4 space-y-2.5">
              {SOCIALS.map((s) => (
                <li key={s.label} className="flex items-baseline justify-between gap-4">
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="text-[14px] text-[var(--ink-2)] transition-colors duration-300 hover:text-[var(--ink)]"
                  >
                    {s.label}
                  </a>
                  <span className="mono-sm truncate text-[11px] text-[var(--ink-3)]">{s.handle}</span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-4">
                <a href={SITE.resume} target="_blank" rel="noreferrer" className="text-[14px] text-[var(--ink-2)] transition-colors duration-300 hover:text-[var(--ink)]">
                  Résumé
                </a>
                <span className="mono-sm text-[11px] text-[var(--ink-3)]">PDF</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-[var(--rule)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-sm text-[var(--ink-3)]">
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <p className="mono-sm text-[var(--ink-3)]">
            Built in Hyderabad · press <kbd className="text-[var(--ink-2)]">⌘K</kbd>
          </p>
        </div>
      </div>
    </footer>
  );
}
