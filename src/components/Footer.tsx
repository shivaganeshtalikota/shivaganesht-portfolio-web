import Link from "next/link";
import { NAV, SITE, SOCIALS } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--separator)] bg-[var(--bg-secondary)]">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.015em]">{SITE.name}</p>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[var(--label-secondary)]">
              {SITE.role} at{" "}
              <a
                href={SITE.companyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--label)] underline decoration-[var(--label-quaternary)] underline-offset-2 transition-colors hover:decoration-[var(--label)]"
              >
                matriXO
              </a>
              . Based in {SITE.location}.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
              Pages
            </p>
            <ul className="mt-3 space-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-[13px] text-[var(--label-secondary)] transition-colors duration-300 hover:text-[var(--label)]"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
              Elsewhere
            </p>
            <ul className="mt-3 space-y-2">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="text-[13px] text-[var(--label-secondary)] transition-colors duration-300 hover:text-[var(--label)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={SITE.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-[var(--label-secondary)] transition-colors duration-300 hover:text-[var(--label)]"
                >
                  Résumé (PDF)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--separator)] pt-6 text-[12px] text-[var(--label-tertiary)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Designed and built in Hyderabad.</p>
        </div>
      </div>
    </footer>
  );
}
