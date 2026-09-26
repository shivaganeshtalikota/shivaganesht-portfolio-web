import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { TESTIMONIALS, SITE } from "@/data/site";
import { Arrow } from "./ui";

export function Testimonials({ index = "05", compact = false }: { index?: string; compact?: boolean }) {
  return (
    <section className={compact ? "" : "shell py-20 md:py-32"}>
      {!compact && (
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">{index}</span>
            <span className="label">What people said</span>
          </div>
        </Reveal>
      )}
      <Stagger className={`grid gap-5 md:grid-cols-3 ${compact ? "" : "mt-10"}`}>
        {TESTIMONIALS.map((t) => (
          <StaggerItem key={t.name} className="h-full">
            <figure className="surface flex h-full flex-col p-7">
              <span className="font-display text-[46px] leading-[0.6] text-[var(--accent)]" aria-hidden>
                &ldquo;
              </span>
              <blockquote className="safe-text mt-4 flex-1 text-pretty text-[15.5px] leading-[1.65] text-[var(--ink)]">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-[var(--rule)] pt-4">
                <span className="block text-[14px]">{t.name}</span>
                <span className="mono-sm mt-0.5 block text-[var(--ink-3)]">{t.context}</span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="mono-sm text-[var(--ink-3)]">Rated 5 out of 5 on Topmate</span>
          <Arrow href={SITE.topmate}>Read them there</Arrow>
        </div>
      </Reveal>
    </section>
  );
}
