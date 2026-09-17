import type { Project } from "@/data/site";
import { Chip } from "./ui";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const n = String(index + 1).padStart(2, "0");

  return (
    <article className="card card-hover group relative overflow-hidden p-7 md:p-9">
      {/* accent hairline that lights up on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${project.accent}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: project.accent }}
              aria-hidden
            />
            <h3 className="text-title-3">{project.name}</h3>
          </div>
          <p className="mt-2 text-pretty text-[15px] leading-snug text-[var(--label-secondary)]">
            {project.tagline}
          </p>
        </div>
        <span
          className="shrink-0 font-mono text-[11px] tracking-wide text-[var(--label-quaternary)]"
          aria-hidden
        >
          {n}
        </span>
      </div>

      <dl className="mt-6 flex flex-wrap gap-x-7 gap-y-2 border-t border-[var(--separator)] pt-5 text-[12.5px]">
        <div>
          <dt className="text-[var(--label-tertiary)]">Role</dt>
          <dd className="mt-0.5 font-medium">{project.role}</dd>
        </div>
        <div>
          <dt className="text-[var(--label-tertiary)]">Year</dt>
          <dd className="mt-0.5 font-medium tabular-nums">{project.year}</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-3.5">
        {project.body.map((p) => (
          <p key={p.slice(0, 24)} className="text-pretty text-[14.5px] leading-relaxed text-[var(--label-secondary)]">
            {p}
          </p>
        ))}
      </div>

      {project.highlights.length > 0 && (
        <ul className="mt-6 space-y-2">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2.5 text-[13.5px] leading-snug">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={project.accent}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-[3px] shrink-0"
                aria-hidden
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-[var(--label-secondary)]">{h}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-7 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>

      {project.links.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--separator)] pt-5">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--accent)] transition-opacity duration-300 hover:opacity-70"
            >
              {l.label}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          ))}
        </div>
      )}

      {project.archived && (
        <p className="mt-5 text-[12px] text-[var(--label-tertiary)]">
          Earlier work — source not publicly hosted.
        </p>
      )}
    </article>
  );
}
