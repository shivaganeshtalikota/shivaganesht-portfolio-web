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
        index="01"
        eyebrow="Contact"
        title={<>Let's <em className="italic">talk.</em></>}
        lede="Open to engineering roles, collaborations and speaking invitations. I read every message myself."
      />

      <section className="shell pb-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pl-8">
            <Reveal delay={0.08}>
              <div className="space-y-10 lg:sticky lg:top-28">
                <div>
                  <p className="label">Direct</p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="safe-text mt-3 block text-[19px] text-[var(--accent)] transition-opacity duration-300 hover:opacity-70"
                  >
                    {SITE.email}
                  </a>
                  <p className="mt-2 text-[14px] text-[var(--ink-2)]">{SITE.location}</p>
                  {SITE.available && (
                    <p className="mt-4 inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                      <span className="label text-[var(--accent)]">{SITE.availableLabel}</span>
                    </p>
                  )}
                </div>

                <div>
                  <p className="label">Mentoring</p>
                  <p className="safe-text mt-3 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                    I take 1:1 sessions on Topmate — career, engineering, building in public. There's a
                    free discovery call if you just want to talk.
                  </p>
                  <a
                    href={SITE.topmate}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--rule-strong)] px-5 py-2.5 text-[14px] transition-colors duration-300 hover:bg-[var(--fill)]"
                  >
                    Book on Topmate
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                </div>

                <div>
                  <p className="label">Elsewhere</p>
                  <ul className="mt-3">
                    {SOCIALS.filter((s) => s.label !== "Email").map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-baseline justify-between gap-4 border-b border-[var(--rule)] py-3.5 transition-colors duration-300 hover:text-[var(--accent)]"
                        >
                          <span className="text-[14.5px]">{s.label}</span>
                          <span className="mono-sm truncate text-[var(--ink-3)]">{s.handle}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
