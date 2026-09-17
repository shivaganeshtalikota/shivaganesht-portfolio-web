import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, Button, Chip } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { ABOUT_LONG, EDUCATION, SITE, SKILLS } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Shiva Ganesh Talikota — founder of matriXO, product engineer, and speaker based in Hyderabad. The longer version.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="I founded a company before I finished the degree."
        lede="The short version is on the homepage. Here's what actually happened."
      />

      <section className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <div className="space-y-6">
            {ABOUT_LONG.map((p, i) => (
              <Reveal key={p.slice(0, 20)} delay={i * 0.06}>
                <p className="text-pretty text-[17px] leading-[1.65] text-[var(--label-secondary)] md:text-[19px]">
                  {p}
                </p>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-3 pt-4">
                <Button href={SITE.resume} variant="secondary" download>
                  Download résumé
                </Button>
                <Button href="/contact">Get in touch</Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <figure className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[var(--radius-xl)]">
                <Image
                  src="/portrait/wide.webp"
                  alt="Shiva Ganesh Talikota"
                  width={2200}
                  height={1467}
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[12.5px] text-[var(--label-tertiary)]">
                Hyderabad, India.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* education */}
      <section className="shell py-24 md:py-32">
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

            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
              Relevant coursework
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {EDUCATION.coursework.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* skills */}
      <section className="border-t border-[var(--separator)] bg-[var(--bg-secondary)] py-24 md:py-32">
        <div className="shell">
          <Reveal>
            <h2 className="text-title-2 text-balance">What I work with</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 max-w-2xl text-pretty text-[15px] text-[var(--label-secondary)] md:text-[17px]">
              Grouped by what I reach for, not by how well I know it — everything here has shipped
              in something real.
            </p>
          </Reveal>

          <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((group) => (
              <StaggerItem key={group.group}>
                <div className="card h-full p-6">
                  <h3 className="text-[15px] font-semibold tracking-[-0.012em]">{group.group}</h3>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {group.items.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
