import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { EventGallery } from "@/components/EventGallery";
import { Reveal } from "@/components/Reveal";
import { EVENTS } from "@/data/site";

export const metadata: Metadata = {
  title: "Speaking & Events",
  description:
    "Ten documented events — speaking at the Microsoft Campus, pitching at ISB, and organising at T-Hub, GDSC WoW and South India's CSR Summit.",
};

export default function SpeakingPage() {
  const photoCount = EVENTS.reduce((n, e) => n + e.photos.length, 0);
  const speakingCount = EVENTS.filter((e) => /speaker/i.test(e.role)).length;

  return (
    <>
      <PageHeader
        eyebrow="Speaking & Events"
        title="Ten rooms I stood in, and what happened in them."
        lede="Talks, pitches, summits and the volunteering in between — photographed as they happened."
      />

      <section className="shell pb-16 md:pb-24">
        <Reveal>
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--separator)] bg-[var(--separator)]">
            {[
              { v: String(EVENTS.length), l: "Events documented" },
              { v: String(speakingCount), l: "As speaker" },
              { v: String(photoCount), l: "Photographs" },
            ].map((s) => (
              <div key={s.l} className="bg-[var(--bg)] px-4 py-6 text-center md:py-8">
                <dt className="sr-only">{s.l}</dt>
                <dd>
                  <span className="block text-[26px] font-bold tracking-[-0.025em] tabular-nums md:text-[34px]">
                    {s.v}
                  </span>
                  <span className="mt-1 block text-[12.5px] text-[var(--label-secondary)]">
                    {s.l}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <EventGallery events={EVENTS} />

      <section className="shell pt-24">
        <p className="text-[12.5px] text-[var(--label-tertiary)]">
          All photographs are from the events described. Click any image to open it full size.
        </p>
      </section>
    </>
  );
}
