import type { Metadata } from "next";
import { PageHeader, Button } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { EDUCATION, EXPERIENCE, SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Founder at matriXO, Dell Technologies ambassador, Intel Unnati trainee, Student Tribe, TurboHire and OSSEB.",
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Experience"
        title={<>Seven roles, run <em className="italic">alongside a degree.</em></>}
        lede="Where I've worked and what I actually shipped there."
      />

      <section className="shell">
        <ol>
          {EXPERIENCE.map((role, i) => (
            <li key={role.org + role.period} className="border-t border-[var(--rule)] py-10 md:py-12">
              <Reveal delay={Math.min(i * 0.04, 0.2)}>
                <div className="grid gap-5 md:grid-cols-12 md:gap-8">
                  <div className="md:col-span-4">
                    <div className="flex items-baseline gap-3">
                      <span className="label">{String(i + 1).padStart(2, "0")}</span>
                      {role.current && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                          <span className="label text-[var(--accent)]">Current</span>
                        </span>
                      )}
                    </div>
                    <h2 className="font-display safe-text mt-3 text-[26px] leading-tight md:text-[30px]">
                      {role.href ? (
                        <a
                          href={role.href}
                          target="_blank"
                          rel="noreferrer"
                          className="link-underline transition-colors hover:text-[var(--accent)]"
                        >
                          {role.org}
                        </a>
                      ) : (
                        role.org
                      )}
                    </h2>
                    <p className="mono-sm mt-3 text-[var(--ink-3)]">{role.period}</p>
                  </div>

                  <div className="md:col-span-8">
                    <p className="safe-text text-[16px] font-medium">{role.title}</p>
                    <p className="safe-text mt-0.5 text-[13.5px] text-[var(--ink-3)]">{role.place}</p>
                    <ul className="mt-5 space-y-3">
                      {role.points.map((pt) => (
                        <li key={pt.slice(0, 24)} className="flex gap-3">
                          <span className="mt-[10px] h-px w-3 shrink-0 bg-[var(--accent)]" aria-hidden />
                          <span className="safe-text text-pretty text-[14.5px] leading-[1.65] text-[var(--ink-2)]">
                            {pt}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-24 md:py-32">
        <div className="shell">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">02</span>
              <span className="label">Education</span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-10 grid gap-6 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2 className="font-display safe-text text-[26px] leading-tight md:text-[32px]">
                  {EDUCATION.school}
                </h2>
                <p className="mono-sm mt-3 text-[var(--ink-3)]">{EDUCATION.period}</p>
              </div>
              <div className="md:col-span-7">
                <p className="safe-text text-[16px] text-[var(--ink-2)]">{EDUCATION.degree}</p>
                <p className="safe-text mt-1 text-[14px] text-[var(--ink-3)]">{EDUCATION.place}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-12">
              <Button href={SITE.resume} variant="outline">
                Download the full résumé
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
