import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { EventGallery } from "@/components/EventGallery";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { EVENTS, TALKS } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/speaking" },
  title: "Speaking",
  description:
    "Speaking at the Microsoft Campus and GitHub Copilot Dev Days, pitching at ISB, organising at T-Hub, DraperU and South India's CSR Summit.",
};

export default function SpeakingPage() {
  const photoCount = EVENTS.reduce((n, e) => n + e.photos.length, 0);
  const total = EVENTS.length + TALKS.length;

  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Speaking & Events"
        title={<>Talks, workshops, and a few <em className="italic">very good rooms.</em></>}
        lede="Some of these I spoke at, some I helped run, and a couple I just turned up to and learned something. Most of it was photographed."
      />

      <section className="shell pb-12">
        <Reveal>
          <dl className="grid grid-cols-3 border-y border-[var(--rule)]">
            {[
              { v: String(total), l: "Events" },
              { v: "4×", l: "At Microsoft" },
              { v: String(photoCount), l: "Photographs" },
            ].map((s) => (
              <div key={s.l} className="py-7 pr-4">
                <dt className="label">{s.l}</dt>
                <dd className="font-display mt-2 text-[32px] leading-none md:text-[42px]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <EventGallery events={EVENTS} />

      {/* engagements without photography */}
      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-20 md:py-32">
        <div className="shell">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">02</span>
              <span className="label">Also on the record</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="t-2 mt-8 max-w-[24ch] text-balance">
              The ones nobody <em className="italic">photographed.</em>
            </h2>
          </Reveal>

          <Stagger className="mt-12">
            {TALKS.map((t, i) => (
              <StaggerItem key={t.title}>
                <div className="grid gap-4 border-t border-[var(--rule)] py-8 md:grid-cols-12 md:gap-8">
                  <div className="md:col-span-1">
                    <span className="label">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="font-display safe-text text-[22px] leading-tight md:text-[25px]">
                      {t.title}
                    </h3>
                    <p className="safe-text mt-2 text-[13.5px] text-[var(--ink-3)]">{t.venue}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="label text-[var(--accent)]">{t.role}</p>
                    <p className="mono-sm mt-1.5 text-[var(--ink-3)]">{t.year}</p>
                  </div>
                  <div className="md:col-span-5">
                    <p className="safe-text text-pretty text-[14.5px] leading-[1.7] text-[var(--ink-2)]">
                      {t.note}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="shell py-14">
        <p className="mono-sm text-[var(--ink-3)]">
          Every photograph here is from the event it sits under. Click any of them to see it properly.
        </p>
      </section>
    </>
  );
}
