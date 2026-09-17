import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { Arrow, Button, SectionHead } from "@/components/ui";
import { ABOUT_SHORT, AWARDS, EVENTS, PROJECTS, SITE } from "@/data/site";

export default function HomePage() {
  const featured = PROJECTS.filter((p) => p.featured);
  const rail = EVENTS.slice(0, 6);
  const top = AWARDS.slice(0, 3);

  return (
    <>
      <Hero />

      {/* ── about ───────────────────────────────────────────── */}
      <section className="shell py-20 md:py-36">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <Reveal>
              <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[var(--radius-md)] bg-[var(--bg-sunken)] md:max-w-none">
                <Image
                  src="/portrait/microsoft.webp"
                  alt="Shiva Ganesh Talikota at the Microsoft Campus, Hyderabad"
                  fill
                  sizes="(max-width: 768px) 280px, 360px"
                  className="object-cover object-[50%_22%]"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="label mt-3">Microsoft Campus · Hyderabad</p>
            </Reveal>
          </div>

          <div className="md:col-span-8 md:pl-6 lg:pl-16">
            <Reveal>
              <span className="label">01 — About</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="t-2 mt-6 max-w-[20ch] text-balance">
                Why I started <em className="italic">matriXO</em>.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="t-lede safe-text mt-7 max-w-[56ch] text-pretty">{ABOUT_SHORT}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8">
                <Arrow href="/about">Read the longer version</Arrow>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── work ────────────────────────────────────────────── */}
      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-20 md:py-36">
        <div className="shell">
          <SectionHead
            index="02 — Selected work"
            title={<>Four things you can <em className="italic">open right now.</em></>}
            action={{ href: "/projects", label: "All work" }}
          />
          <Stagger className="grid items-stretch gap-5 lg:grid-cols-2">
            {featured.map((p, i) => (
              <StaggerItem key={p.slug} className="h-full">
                <ProjectCard project={p} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── speaking ────────────────────────────────────────── */}
      <section className="py-20 md:py-36">
        <div className="shell">
          <SectionHead
            index="03 — Speaking"
            title={<>Where I{"'"}ve been <em className="italic">talking.</em></>}
            lede="Ten of them are documented here, with the photographs. Speaking, organising, and one stint running sponsorship."
            action={{ href: "/speaking", label: "All events" }}
          />
        </div>

        <Stagger className="shell grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {rail.map((ev) => (
            <StaggerItem key={ev.slug}>
              <Link href={`/speaking#${ev.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-sunken)]">
                  <Image
                    src={ev.photos[0].thumb}
                    alt={ev.title}
                    fill
                    sizes="(max-width: 768px) 46vw, 30vw"
                    className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-3.5 flex items-baseline justify-between gap-3">
                  <span className="label truncate">{ev.role}</span>
                  <span className="mono-sm shrink-0 text-[var(--ink-3)]">{ev.year}</span>
                </div>
                <p className="safe-text mt-1.5 text-pretty text-[15px] leading-snug transition-colors duration-300 group-hover:text-[var(--accent)]">
                  {ev.title}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── recognition ─────────────────────────────────────── */}
      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-20 md:py-36">
        <div className="shell">
          <SectionHead
            index="04 — Recognition"
            title={<>Awards, and the <em className="italic">honest version.</em></>}
            action={{ href: "/awards", label: "All recognition" }}
          />
          <Stagger className="grid gap-5 md:grid-cols-3">
            {top.map((a) => (
              <StaggerItem key={a.title} className="h-full">
                <div className="surface lift flex h-full flex-col p-7">
                  <span className="mono-sm text-[var(--accent)]">{a.year}</span>
                  <h3 className="safe-text mt-4 text-pretty text-[19px] font-semibold leading-snug tracking-[-0.015em]">
                    {a.title}
                  </h3>
                  <p className="safe-text mt-2 text-[13px] text-[var(--ink-3)]">{a.org}</p>
                  <p className="safe-text mt-5 text-pretty text-[14px] leading-relaxed text-[var(--ink-2)]">
                    {a.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="shell py-24 md:py-40">
        <Reveal>
          <p className="label">05 — Contact</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="t-1 mt-7 max-w-[16ch] text-balance">
            Working on something <em className="italic text-[var(--accent)]">difficult?</em>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="t-lede safe-text mt-6 max-w-[46ch] text-pretty">
            I read everything that comes in. Roles, collaborations, or an invitation to come and
            speak somewhere.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/contact">Get in touch</Button>
            <Button href={SITE.topmate} variant="outline">
              Book a session on Topmate
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
