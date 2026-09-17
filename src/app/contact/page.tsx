import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { SITE, SOCIALS } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with Shiva Ganesh Talikota — ${SITE.email}. Open to engineering roles, collaborations and speaking invitations.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk."
        lede="Open to engineering roles, collaborations and speaking invitations. I read every message myself."
      />

      <section className="shell pb-24 md:pb-32">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-8 lg:sticky lg:top-28">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
                  Direct
                </p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-3 block text-pretty text-[17px] font-medium text-[var(--accent)] transition-opacity duration-300 hover:opacity-70"
                >
                  {SITE.email}
                </a>
                <p className="mt-2 text-[13.5px] text-[var(--label-secondary)]">{SITE.location}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
                  Elsewhere
                </p>
                <ul className="mt-3 divide-y divide-[var(--separator)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--separator)]">
                  {SOCIALS.filter((s) => s.label !== "Email").map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between px-4 py-3.5 transition-colors duration-300 hover:bg-[var(--fill-tertiary)]"
                      >
                        <span>
                          <span className="block text-[14px] font-medium">{s.label}</span>
                          <span className="block text-[12.5px] text-[var(--label-tertiary)]">
                            {s.handle}
                          </span>
                        </span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                          className="text-[var(--label-tertiary)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        >
                          <path d="M7 17L17 7M9 7h8v8" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
                  Résumé
                </p>
                <a
                  href={SITE.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium text-[var(--accent)] transition-opacity duration-300 hover:opacity-70"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
