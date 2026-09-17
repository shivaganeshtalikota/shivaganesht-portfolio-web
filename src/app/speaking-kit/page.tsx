import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, Arrow, Tag } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { CopyButton } from "@/components/CopyButton";
import { EVENTS, KIT, SITE, TALKS } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/speaking-kit" },
  title: "Speaker kit",
  description:
    "Bio at three lengths, headshots, topics and past talks for Shiva Ganesh Talikota. Everything an event organiser needs, in one place.",
};

export default function SpeakingKitPage() {
  const past = [
    ...TALKS.map((t) => ({ title: t.title, venue: t.venue, year: t.year, role: t.role })),
    ...EVENTS.filter((e) => /speaker/i.test(e.role)).map((e) => ({
      title: e.title,
      venue: e.venue,
      year: e.year,
      role: e.role,
    })),
  ];

  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Speaker kit"
        title={<>Everything you need to <em className="italic">put me on a bill.</em></>}
        lede="If you're running an event and need my details, take them from here rather than emailing me for them. Copy any bio with one click."
      />

      {/* bios */}
      <section className="shell">
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">02</span>
            <span className="label">Bio, at three lengths</span>
          </div>
        </Reveal>
        <Stagger className="mt-8 space-y-4">
          {KIT.bios.map((b) => (
            <StaggerItem key={b.length}>
              <div className="surface p-6 md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <span className="label">{b.length}</span>
                  <CopyButton text={b.text} />
                </div>
                <p className="safe-text mt-4 text-pretty text-[15.5px] leading-[1.7] text-[var(--ink-2)]">
                  {b.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* headshots */}
      <section className="shell py-20 md:py-28">
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">03</span>
            <span className="label">Headshots</span>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="safe-text mt-6 max-w-[54ch] text-[15px] text-[var(--ink-2)]">
            Use any of these. Right-click and save, or open in a new tab for the full resolution.
          </p>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-3">
          {KIT.headshots.map((h) => (
            <StaggerItem key={h.src}>
              <a href={h.src} target="_blank" rel="noreferrer" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-sunken)]">
                  <Image
                    src={h.src}
                    alt={`${SITE.name} — ${h.label}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="text-[14px]">{h.label}</span>
                  <span className="mono-sm text-[var(--ink-3)]">{h.note}</span>
                </div>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* topics */}
      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">04</span>
              <span className="label">What I talk about</span>
            </div>
          </Reveal>
          <Stagger className="mt-8">
            {KIT.topics.map((t, i) => (
              <StaggerItem key={t}>
                <div className="flex items-baseline gap-5 border-b border-[var(--rule)] py-5">
                  <span className="label shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="safe-text text-pretty text-[16px] text-[var(--ink-2)]">{t}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* past talks */}
      <section className="shell py-20 md:py-28">
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">05</span>
            <span className="label">Where I{"'"}ve spoken</span>
          </div>
        </Reveal>
        <Stagger className="mt-8">
          {past.map((t) => (
            <StaggerItem key={t.title + t.year}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--rule)] py-4">
                <div className="min-w-0">
                  <p className="safe-text text-[16px]">{t.title}</p>
                  <p className="safe-text mt-0.5 text-[13px] text-[var(--ink-3)]">{t.venue}</p>
                </div>
                <div className="flex shrink-0 items-baseline gap-4">
                  <Tag>{t.role}</Tag>
                  <span className="mono-sm text-[var(--ink-3)]">{t.year}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
            <Arrow href={`mailto:${SITE.email}?subject=${encodeURIComponent("Speaking invitation")}`}>
              Invite me to speak
            </Arrow>
            <Arrow href="/speaking">See the photographs</Arrow>
          </div>
        </Reveal>
      </section>
    </>
  );
}
