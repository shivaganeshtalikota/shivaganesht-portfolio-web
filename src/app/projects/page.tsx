import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { PROJECTS } from "@/data/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "matriXO, automapp, pAIr and more — the systems Shiva Ganesh Talikota has designed, built and shipped.",
};

export default function ProjectsPage() {
  const featured = PROJECTS.filter((p) => p.featured);
  const earlier = PROJECTS.filter((p) => !p.featured);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I built, and what they actually do."
        lede="Every project here is described by its architecture, not its buzzwords. Where there's source, it's linked."
      />

      <section className="shell">
        <Stagger className="grid gap-5 lg:grid-cols-2">
          {featured.map((p, i) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="shell py-24 md:py-32">
        <Reveal>
          <h2 className="text-title-2 text-balance">Earlier work</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-2xl text-pretty text-[15px] text-[var(--label-secondary)] md:text-[17px]">
            Competition entries and research builds from earlier in the degree. Some of the source
            lived on a GitHub account that is no longer available.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 lg:grid-cols-2">
          {earlier.map((p, i) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} index={featured.length + i} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
