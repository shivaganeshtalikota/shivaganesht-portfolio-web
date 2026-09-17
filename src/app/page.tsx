import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { Button, SectionHeading, TextLink } from "@/components/ui";
import { ABOUT_SHORT, AWARDS, EVENTS, PROJECTS, SITE } from "@/data/site";

export default function HomePage() {
  const featured = PROJECTS.filter((p) => p.featured);
  const speaking = EVENTS.slice(0, 6);
  const topAwards = AWARDS.slice(0, 3);

  return (
    <>
      <Hero />

      {/* ── about ─────────────────────────────────────────────── */}
      <section className="shell py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <Reveal>
            <div className="relative aspect-square max-w-[320px] overflow-hidden rounded-[var(--radius-xl)] md:max-w-none">
              <Image
                src="/portrait/microsoft.webp"
                alt="Shiva Ganesh Talikota at the Microsoft Campus, Hyderabad"
                width={900}
                height={900}
                sizes="(max-width: 768px) 320px, 420px"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <div className="self-center">
            <Reveal delay={0.08}>
              <p className="text-[13px] font-medium text-[var(--accent)]">About</p>
            </Reveal>
            <Reveal delay={0.14}>
              <h2 className="text-title-2 mt-2 text-balance">
                Founder first. Engineer always.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-body-lg mt-5 text-pretty text-[var(--label-secondary)]">
                {ABOUT_SHORT}
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-7">
                <TextLink href="/about">Read the longer version</TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── selected work ─────────────────────────────────────── */}
      <section className="border-t border-[var(--separator)] bg-[var(--bg-secondary)] py-24 md:py-32">
        <div className="shell">
          <SectionHeading
            eyebrow="Selected work"
            title="Four things I built that are live right now."
            lede="A company, an automation engine, a multi-agent compliance system, and a production site for a client. Not demos."
            action={{ href: "/projects", label: "All projects" }}
          />
          <Stagger className="grid gap-5 lg:grid-cols-2">
            {featured.map((p, i) => (
              <StaggerItem key={p.slug}>
                <ProjectCard project={p} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── speaking ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="shell">
          <SectionHeading
            eyebrow="Speaking"
            title="I've spoken at Microsoft, ISB and T-Hub."
            lede="Ten documented events — as speaker, organiser and sponsorship director — with the photographs to go with them."
            action={{ href: "/speaking", label: "See all events" }}
          />
        </div>
        <Stagger className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[22px] pb-4 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {speaking.map((ev) => (
            <StaggerItem key={ev.slug} className="shrink-0 snap-start">
              <Link
                href={`/speaking#${ev.slug}`}
                className="group block w-[268px] md:w-[320px]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--fill-tertiary)]">
                  <Image
                    src={ev.photos[0].thumb}
                    alt={ev.title}
                    fill
                    sizes="(max-width: 768px) 268px, 320px"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/75">
                      {ev.role} · {ev.year}
                    </p>
                    <p className="mt-1 text-pretty text-[16px] font-semibold leading-tight tracking-[-0.012em] text-white">
                      {ev.title}
                    </p>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── recognition ───────────────────────────────────────── */}
      <section className="border-t border-[var(--separator)] bg-[var(--bg-secondary)] py-24 md:py-32">
        <div className="shell">
          <SectionHeading
            eyebrow="Recognition"
            title="Some of it got written down."
            action={{ href: "/awards", label: "All recognition" }}
          />
          <Stagger className="grid gap-5 md:grid-cols-3">
            {topAwards.map((a) => (
              <StaggerItem key={a.title}>
                <div className="card h-full p-7">
                  <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--accent)]">
                    {a.year}
                  </p>
                  <h3 className="mt-3 text-pretty text-[18px] font-semibold leading-snug tracking-[-0.014em]">
                    {a.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] text-[var(--label-tertiary)]">{a.org}</p>
                  <p className="mt-4 text-pretty text-[14px] leading-relaxed text-[var(--label-secondary)]">
                    {a.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="shell py-28 text-center md:py-36">
        <Reveal>
          <h2 className="text-title-1 mx-auto max-w-3xl text-balance">
            Got a hard problem? I'd like to hear it.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-body-lg mx-auto mt-5 max-w-xl text-pretty text-[var(--label-secondary)]">
            Open to engineering roles, collaborations and speaking invitations. I read every
            message myself.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Get in touch</Button>
            <Button href={`mailto:${SITE.email}`} variant="secondary">
              {SITE.email}
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
