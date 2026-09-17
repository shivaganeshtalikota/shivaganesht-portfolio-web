import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { PROJECTS } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/projects" },
  title: "Work",
  description:
    "matriXO, automapp, pAIr and more — the systems Shiva Ganesh Talikota has designed, built and shipped.",
};

export default function ProjectsPage() {
  const featured = PROJECTS.filter((p) => p.featured);
  const earlier = PROJECTS.filter((p) => !p.featured);

  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Selected work"
        title={<>What I built, and <em className="italic">how it works.</em></>}
        lede="No adjectives, just what each one does and what it is made of. Where the source is public, it is linked."
      />

      <section className="shell">
        <Stagger className="grid items-stretch gap-5 lg:grid-cols-2">
          {featured.map((p, i) => (
            <StaggerItem key={p.slug} className="h-full">
              <ProjectCard project={p} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="shell py-20 md:py-32">
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">02</span>
            <span className="label">Earlier work</span>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <p className="safe-text mt-8 max-w-[56ch] text-[15.5px] leading-relaxed text-[var(--ink-2)]">
            Competition entries and research builds from earlier in the degree. Some of this code
            lived on a GitHub account I no longer have access to, so there is nothing to link.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid items-stretch gap-5 lg:grid-cols-2">
          {earlier.map((p, i) => (
            <StaggerItem key={p.slug} className="h-full">
              <ProjectCard project={p} index={featured.length + i} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
