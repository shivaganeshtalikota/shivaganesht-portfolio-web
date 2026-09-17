import type { Metadata } from "next";
import { PageHeader, Arrow } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { NOW, SITE } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/now" },
  title: "Now",
  description:
    "What Shiva Ganesh Talikota is working on right now: automapp, matriXO, DevAgentic workshops, and what he's open to.",
};

export default function NowPage() {
  return (
    <>
      <PageHeader
        index="01"
        eyebrow={`Now · updated ${NOW.updated}`}
        title={<>What I{"'"}m doing <em className="italic">at the moment.</em></>}
        lede={NOW.intro}
      />

      <section className="shell">
        <Stagger>
          {NOW.sections.map((sec, i) => (
            <StaggerItem key={sec.heading}>
              <div className="grid gap-5 border-t border-[var(--rule)] py-10 md:grid-cols-12 md:gap-8 md:py-12">
                <div className="md:col-span-4">
                  <span className="label">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="font-display mt-3 text-[26px] leading-tight md:text-[30px]">
                    {sec.heading}
                  </h2>
                </div>
                <ul className="space-y-3.5 md:col-span-8">
                  {sec.items.map((item) => (
                    <li key={item.slice(0, 24)} className="flex gap-3">
                      <span className="mt-[11px] h-px w-3 shrink-0 bg-[var(--accent)]" aria-hidden />
                      <span className="safe-text text-pretty text-[15.5px] leading-[1.65] text-[var(--ink-2)]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="shell py-16 md:py-24">
        <Reveal>
          <p className="mono-sm text-[var(--ink-3)]">
            Last updated {NOW.updated}. If this is badly out of date, do tell me.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <Arrow href="/projects">See the work</Arrow>
            <Arrow href={`mailto:${SITE.email}`}>Email me</Arrow>
          </div>
        </Reveal>
      </section>
    </>
  );
}
