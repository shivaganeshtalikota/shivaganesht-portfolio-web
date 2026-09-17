import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { AWARDS, CERTIFICATIONS } from "@/data/site";

export const metadata: Metadata = {
  title: "Awards & Recognition",
  description:
    "Guinness World Records participation at Agentathon 2025, Runner-Up at SAP Code Unnati Innovation Marathon 4.0, Microsoft Learn Student Ambassador and more.",
};

const KIND_LABEL: Record<string, string> = {
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
        eyebrow="Awards & Recognition"
        title="The parts that got written down."
        lede="Stated precisely — where something is a participation rather than a win, it says so."
      />

      {/* hero award — the Guinness one, with the photo */}
      <section className="shell">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="grid md:grid-cols-[0.8fr_1.2fr]">
              {hero.image && (
                <div className="relative aspect-[4/5] md:aspect-auto">
                  <Image
                    src={hero.image}
                    alt={hero.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover object-top"
                  />
                </div>
              )}
              <div className="p-8 md:p-11">
                <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[12px] font-medium text-[var(--accent)]">
                  {KIND_LABEL[hero.kind]} · {hero.year}
                </span>
                <h2 className="text-title-2 mt-5 text-balance">{hero.title}</h2>
                <p className="mt-2 text-[15px] text-[var(--label-tertiary)]">{hero.org}</p>
                <p className="mt-6 text-pretty text-[16px] leading-relaxed text-[var(--label-secondary)] md:text-[17px]">
                  {hero.body}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="shell py-16 md:py-20">
        <Stagger className="grid gap-5 md:grid-cols-2">
          {rest.map((a) => (
            <StaggerItem key={a.title}>
              <div className="card h-full p-7 md:p-8">
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">
                    {KIND_LABEL[a.kind]}
                  </span>
                  <span className="text-[11.5px] tabular-nums text-[var(--label-tertiary)]">
                    {a.year}
                  </span>
                </div>
                <h2 className="mt-3 text-pretty text-[19px] font-semibold leading-snug tracking-[-0.015em]">
                  {a.title}
                </h2>
                <p className="mt-1.5 text-[13.5px] text-[var(--label-tertiary)]">{a.org}</p>
                <p className="mt-4 text-pretty text-[14.5px] leading-relaxed text-[var(--label-secondary)]">
                  {a.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-t border-[var(--separator)] bg-[var(--bg-secondary)] py-24 md:py-32">
        <div className="shell">
          <Reveal>
            <h2 className="text-title-2 text-balance">Certifications</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="mt-8 divide-y divide-[var(--separator)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--separator)] bg-[var(--bg-elevated)]">
              {CERTIFICATIONS.map((c) => (
                <li
                  key={c.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-6 py-5"
                >
                  <div>
                    <p className="text-[15px] font-medium">{c.name}</p>
                    <p className="mt-0.5 text-[13px] text-[var(--label-tertiary)]">{c.org}</p>
                  </div>
                  <span className="text-[13px] tabular-nums text-[var(--label-tertiary)]">
                    {c.year}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
