import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { AWARDS, CERTIFICATIONS } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/awards" },
  title: "Recognition",
  description:
    "Guinness World Records participation at Agentathon 2025, Runner-Up at SAP Code Unnati 4.0, 4× speaker at Microsoft, and more.",
};

const KIND: Record<string, string> = {
  record: "World record",
  award: "Award",
  role: "Role",
  cert: "Certification",
};

export default function AwardsPage() {
  const hero = AWARDS[0];
  const rest = AWARDS.slice(1);

  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Recognition"
        title={<>Awards, and what they <em className="italic">actually mean.</em></>}
        lede="Written carefully. Where I took part rather than won, it says that, because the difference matters."
      />

      <section className="shell">
        <Reveal>
          <article className="surface overflow-hidden">
            <div className="grid md:grid-cols-12">
              {hero.image && (
                <div className="relative aspect-[4/5] md:col-span-5 md:aspect-auto md:min-h-[440px]">
                  <Image
                    src={hero.image}
                    alt={hero.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-cover object-[50%_25%]"
                  />
                </div>
              )}
              <div className="p-8 md:col-span-7 md:p-12">
                <div className="flex items-center gap-3">
                  <span className="label text-[var(--accent)]">{KIND[hero.kind]}</span>
                  <span className="mono-sm text-[var(--ink-3)]">{hero.year}</span>
                </div>
                <h2 className="t-2 safe-text mt-6 text-balance">{hero.title}</h2>
                <p className="safe-text mt-3 text-[14.5px] text-[var(--ink-3)]">{hero.org}</p>
                <p className="safe-text mt-7 text-pretty text-[16px] leading-[1.7] text-[var(--ink-2)]">
                  {hero.body}
                </p>
              </div>
            </div>
          </article>
        </Reveal>
      </section>

      <section className="shell py-16 md:py-20">
        <Stagger className="grid gap-5 md:grid-cols-2">
          {rest.map((a) => (
            <StaggerItem key={a.title} className="h-full">
              <article className="surface lift flex h-full flex-col p-7 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="label text-[var(--accent)]">{KIND[a.kind]}</span>
                  <span className="mono-sm text-[var(--ink-3)]">{a.year}</span>
                </div>
                <h2 className="safe-text mt-5 text-pretty text-[20px] font-semibold leading-snug tracking-[-0.015em]">
                  {a.title}
                </h2>
                <p className="safe-text mt-2 text-[13.5px] text-[var(--ink-3)]">{a.org}</p>
                <p className="safe-text mt-5 text-pretty text-[14.5px] leading-[1.65] text-[var(--ink-2)]">
                  {a.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-20 md:py-32">
        <div className="shell">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">02</span>
              <span className="label">Certifications</span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="mt-8">
              {CERTIFICATIONS.map((c) => (
                <li
                  key={c.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--rule)] py-5"
                >
                  <div className="min-w-0">
                    <p className="safe-text text-[16px]">{c.name}</p>
                    <p className="safe-text mt-0.5 text-[13px] text-[var(--ink-3)]">{c.org}</p>
                  </div>
                  <span className="mono-sm shrink-0 text-[var(--ink-3)]">{c.year}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
