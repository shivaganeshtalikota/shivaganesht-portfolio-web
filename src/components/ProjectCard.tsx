import type { Project } from "@/data/site";
import { Tag } from "./ui";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const n = String(index + 1).padStart(2, "0");

  return (
    <article className="surface lift group flex h-full flex-col p-7 md:p-9">
      <header className="flex items-start justify-between gap-5 border-b border-[var(--rule)] pb-5">
        <div className="min-w-0">
          <h3 className="font-display safe-text text-[26px] leading-none md:text-[30px]">
            {project.name}
          </h3>
          <p className="safe-text mt-3 text-pretty text-[15px] leading-snug text-[var(--ink-2)]">
            {project.tagline}
          </p>
        </div>
        <span className="label shrink-0 pt-1">{n}</span>
      </header>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <dt className="label">Role</dt>
          <dd className="safe-text mt-1 text-[13.5px]">{project.role}</dd>
        </div>
        <div>
          <dt className="label">Year</dt>
          <dd className="mono-sm mt-1 text-[13px]">{project.year}</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-3.5">
        {project.body.map((p) => (
          <p key={p.slice(0, 24)} className="safe-text text-pretty text-[14.5px] leading-[1.65] text-[var(--ink-2)]">
            {p}
          </p>
        ))}
      </div>

      {project.highlights.length > 0 && (
        <ul className="mt-6 space-y-2.5 border-t border-[var(--rule)] pt-5">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[13.5px] leading-snug">
              <span className="mt-[7px] h-px w-3 shrink-0 bg-[var(--accent)]" aria-hidden />
              <span className="safe-text text-[var(--ink-2)]">{h}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <div className="mt-auto pt-7">
        {project.links.length > 0 ? (
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--rule)] pt-5">
            {project.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="group/l inline-flex items-center gap-1.5 text-[13.5px] text-[var(--ink)] transition-colors duration-300 hover:text-[var(--accent)]"
              >
                <span className="link-underline">{l.label}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/l:translate-x-0.5 group-hover/l:-translate-y-0.5"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            ))}
          </div>
        ) : (
          project.archived && (
            <p className="mono-sm border-t border-[var(--rule)] pt-5 text-[var(--ink-3)]">
              Earlier work — source not publicly hosted
            </p>
          )
        )}
      </div>
    </article>
  );
}
