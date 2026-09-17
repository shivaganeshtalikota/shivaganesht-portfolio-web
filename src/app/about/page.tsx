import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, Button, Tag } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { ABOUT_LONG, EDUCATION, SITE, SKILLS } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About",
  description:
    "Shiva Ganesh Talikota — founder of matriXO, product engineer and speaker in Hyderabad. The longer version.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        index="01"
        eyebrow="About"
        title={<>I founded a company before I <em className="italic">finished the degree.</em></>}
        lede="The short version is on the homepage. Here's what actually happened."
      />

      <section className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="space-y-7">
              {ABOUT_LONG.map((p, i) => (
                <Reveal key={p.slice(0, 20)} delay={i * 0.04}>
                  <p
                    className={
                      i === 0
                        ? "safe-text text-pretty text-[19px] leading-[1.6] md:text-[22px]"
                        : "safe-text text-pretty text-[16.5px] leading-[1.7] text-[var(--ink-2)]"
                    }
                  >
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <div className="mt-12 flex flex-wrap gap-3">
                <Button href={SITE.resume} variant="outline">
                  Download résumé
                </Button>
                <Button href="/contact">Get in touch</Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pl-8">
            <Reveal delay={0.1}>
              <figure className="lg:sticky lg:top-28">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-sunken)]">
                  <Image
                    src="/portrait/wide.webp"
                    alt="Shiva Ganesh Talikota"
                    fill
                    sizes="(max-width: 1024px) 100vw, 460px"
                    className="object-cover object-[50%_30%]"
                  />
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="label">Hyderabad</span>
                  <span className="label">India</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* education */}
      <section className="shell py-20 md:py-32">
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
              <p className="label mt-8">Relevant coursework</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {EDUCATION.coursework.map((c) => (
                  <Tag key={c}>{c}</Tag>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* skills */}
      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-20 md:py-32">
        <div className="shell">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">03</span>
              <span className="label">Toolkit</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="t-2 mt-8 max-w-[22ch] text-balance">
              Grouped by what I <em className="italic">reach for.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="safe-text mt-4 max-w-[52ch] text-[15px] text-[var(--ink-2)]">
              Not by how well I know it — everything here has shipped in something real.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((group) => (
              <StaggerItem key={group.group} className="h-full">
                <div className="h-full bg-[var(--bg)] p-6">
                  <h3 className="label">{group.group}</h3>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {group.items.map((s) => (
                      <Tag key={s}>{s}</Tag>
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
