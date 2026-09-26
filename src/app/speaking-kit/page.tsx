import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, Arrow, Tag } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { CopyButton } from "@/components/CopyButton";
import { PrintButton } from "@/components/PrintButton";
import { Crumbs } from "@/components/JsonLd";
import { Mark } from "@/components/Mark";
import { EVENTS, KIT, SITE, TALKS } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/speaking-kit" },
  title: "Speaker kit: bios, headshots and talk topics",
  description:
    "Everything an event organiser needs to put Shiva Ganesh Talikota on a programme: bios at three lengths, headshots, the talks he gives and where he has spoken. Printable as a one-page PDF.",
};

export default function SpeakingKitPage() {
  // Only the times I was on the programme: speaking, hosting, organising.
  // Events I attended belong on the Speaking page, not in a speaker kit.
  const onStage = (role: string) => /speaker|host|organis|keynote|panel/i.test(role);
  const seen = new Set<string>();
  const past = [
    ...TALKS.map((t) => ({ title: t.title, venue: t.venue, year: t.year, role: t.role })),
    ...EVENTS.map((e) => ({ title: e.title, venue: e.venue, year: e.year, role: e.role })),
  ]
    .filter((t) => onStage(t.role))
    .filter((t) => (seen.has(t.title) ? false : (seen.add(t.title), true)))
    .sort((a, b) => b.year.localeCompare(a.year));

  // counted from the list itself, so the number can never drift from it
  const FACTS = [
    { big: String(past.length), text: "times on the programme, as speaker, host or organiser" },
    { big: "4×", text: "speaker on Microsoft campuses, Hyderabad" },
    { big: "350+", text: "students in one room, on agentic AI" },
    { big: "2,000+", text: "users on matriXO, which he founded" },
  ];
  const [oneLine, fifty, full] = KIT.bios;

  return (
    <>
      <Crumbs name="Speaker kit" path="/speaking-kit" />

      {/* ── on paper: one clean A4 speaker sheet, built from the same data ── */}
      <article className="print-only kit-sheet">
        <header className="ks-head">
          <div>
            <div className="ks-brand">
              <Mark size={22} />
              <p className="ks-eyebrow" style={{ margin: 0 }}>
                Speaker kit
              </p>
            </div>
            <h1 className="ks-name">{SITE.name}</h1>
            <p className="ks-role">
              {SITE.role} · {SITE.location}
            </p>
            <p className="ks-contact">
              {SITE.email} · {SITE.url.replace("https://", "")} · linkedin.com/in/shivaganesht
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- print needs the plain image */}
          <img className="ks-photo" src={KIT.headshots[0].src} alt={SITE.name} />
        </header>

        <section>
          <h2>Introduce me with</h2>
          <p className="ks-lead">{oneLine.text}</p>
        </section>
        <section>
          <h2>Short bio · fifty words</h2>
          <p>{fifty.text}</p>
        </section>
        <section>
          <h2>Full bio</h2>
          <p>{full.text}</p>
        </section>

        <section className="ks-cols">
          <div>
            <h2>Talks I give</h2>
            <ol>
              {KIT.topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
          <div>
            <h2>At a glance</h2>
            <ul className="ks-facts">
              {FACTS.map((f) => (
                <li key={f.text}>
                  <b>{f.big}</b>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* the one section allowed to run onto a second page */}
        <section style={{ breakInside: "auto" }}>
          <h2>Where I&apos;ve spoken</h2>
          <table>
            <tbody>
              {past.map((t) => (
                <tr key={t.title + t.year}>
                  <td>{t.year}</td>
                  <td>
                    {t.title}
                    <span style={{ color: "#6e6a61" }}> · {t.venue}</span>
                  </td>
                  <td>{t.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="ks-foot">
          Headshots and the latest version of this sheet: {SITE.url.replace("https://", "")}/speaking-kit · Invitations:{" "}
          {SITE.email}
        </p>
      </article>

      {/* ── on screen ─────────────────────────────────────────────────────── */}
      <div className="no-print">
        <PageHeader
          index="01"
          eyebrow="Speaker kit"
          title={<>Everything you need to <em className="italic">put me on a bill.</em></>}
          lede="If you're running an event and need my details, take them from here rather than emailing me for them. Copy any bio with one click, or save the whole thing as a one-page PDF."
        />

        {/* the two things people come here to do */}
        <section className="shell -mt-4">
          <Reveal>
            <div className="surface grid gap-6 p-6 md:grid-cols-12 md:items-center md:p-8">
              <div className="flex items-center gap-5 md:col-span-7">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-sunken)]">
                  <Image src={KIT.headshots[0].src} alt={SITE.name} fill sizes="80px" className="object-cover object-[50%_18%]" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[24px] leading-tight">{SITE.name}</p>
                  <p className="mono-sm mt-1 text-[11px] text-[var(--ink-3)]">
                    {SITE.role} · {SITE.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
                <PrintButton />
                <Arrow href="/contact?topic=talk">Invite me to speak</Arrow>
              </div>
            </div>
          </Reveal>
          <Stagger className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-4">
            {FACTS.map((f) => (
              <StaggerItem key={f.text}>
                <div className="h-full bg-[var(--bg)] p-5">
                  <p className="font-display text-[34px] leading-none">{f.big}</p>
                  <p className="mono-sm mt-2 text-[11px] leading-snug text-[var(--ink-3)]">{f.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* bios */}
        <section className="shell pt-20 md:pt-28">
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
                  <p className="safe-text mt-4 text-pretty text-[15.5px] leading-[1.7] text-[var(--ink-2)]">{b.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* topics */}
        <section className="shell pt-20 md:pt-28">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">03</span>
              <span className="label">What I talk about</span>
            </div>
          </Reveal>
          <Stagger className="mt-4">
            {KIT.topics.map((t, i) => (
              <StaggerItem key={t}>
                <div className="flex items-baseline gap-5 border-b border-[var(--rule)] py-5">
                  <span className="label shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="safe-text text-pretty text-[16px] text-[var(--ink-2)]">{t}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* headshots */}
        <section className="shell pt-20 md:pt-28">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">04</span>
              <span className="label">Headshots</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="safe-text mt-6 max-w-[54ch] text-[15px] text-[var(--ink-2)]">
              Use any of these. Click one for the full resolution, then save it.
            </p>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-3">
            {KIT.headshots.map((h) => (
              <StaggerItem key={h.src}>
                <a href={h.src} target="_blank" rel="noreferrer" className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-sunken)]">
                    <Image
                      src={h.src}
                      alt={`${SITE.name}, ${h.label}`}
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
          <Reveal delay={0.08}>
            <p className="mono-sm mt-8 text-[12px] text-[var(--ink-3)]">
              Need the logo too? It&apos;s on <a href="/brand" className="link-underline text-[var(--ink-2)]">the logo page</a>,
              as SVG, PNG and JPG.
            </p>
          </Reveal>
        </section>

        {/* past talks */}
        <section className="shell py-20 md:py-28">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">05</span>
              <span className="label">Where I&apos;ve spoken</span>
            </div>
          </Reveal>
          <Stagger className="mt-4">
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
              <Arrow href="/contact?topic=talk">Invite me to speak</Arrow>
              <Arrow href="/speaking">See the photographs</Arrow>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
