import type { Metadata } from "next";
import { PageHeader, Button } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { EDUCATION, EXPERIENCE, SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Founder and product engineer at matriXO, Dell Technologies ambassador, Intel Unnati trainee, and technical lead at OSSEB.",
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="Where I've worked, and what I shipped there."
        lede="Four roles across three years, running in parallel with a Computer Science degree."
      />

      <section className="shell">
        <ol className="relative">
          {EXPERIENCE.map((role, i) => (
            <li key={role.org} className="relative pb-14 pl-8 last:pb-0 md:pl-11">
              {/* rail */}
              {i !== EXPERIENCE.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[5px] top-4 h-full w-px bg-[var(--separator)] md:left-[7px]"
                />
              )}
              <span
                aria-hidden
                className="absolute left-0 top-[7px] grid h-[11px] w-[11px] place-items-center rounded-full md:h-[15px] md:w-[15px]"
                style={{
                  background: role.current ? "var(--accent)" : "var(--bg)",
                  boxShadow: role.current
                    ? "0 0 0 4px var(--accent-soft)"
                    : "inset 0 0 0 2px var(--separator-opaque)",
                }}
              />

              <Reveal delay={i * 0.05}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-title-3">
                    {role.href ? (
                      <a
                        href={role.href}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-opacity duration-300 hover:opacity-60"
                      >
                        {role.org}
                      </a>
                    ) : (
                      role.org
                    )}
                  </h2>
                  <span className="shrink-0 text-[13.5px] tabular-nums text-[var(--label-tertiary)]">
                    {role.period}
                  </span>
                </div>

                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[15px] font-medium text-[var(--label-secondary)]">
                  {role.title}
                  {role.current && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11.5px] font-medium text-[var(--accent)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                      Current
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] text-[var(--label-tertiary)]">{role.place}</p>

                <ul className="mt-5 space-y-3">
                  {role.points.map((pt) => (
                    <li
                      key={pt.slice(0, 24)}
                      className="text-pretty text-[14.5px] leading-relaxed text-[var(--label-secondary)]"
                    >
                      {pt}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-[var(--separator)] bg-[var(--bg-secondary)] py-24 md:py-32">
        <div className="shell">
          <Reveal>
            <h2 className="text-title-2 text-balance">Education</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card mt-8 p-7 md:p-9">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-title-3">{EDUCATION.school}</h3>
                <span className="text-[13.5px] tabular-nums text-[var(--label-tertiary)]">
                  {EDUCATION.period}
                </span>
              </div>
              <p className="mt-2 text-[15px] text-[var(--label-secondary)]">{EDUCATION.degree}</p>
              <p className="mt-1 text-[13.5px] text-[var(--label-tertiary)]">{EDUCATION.place}</p>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-10">
              <Button href={SITE.resume} variant="secondary" download>
                Download the full résumé
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
