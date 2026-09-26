import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Button, Tag } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { Testimonials } from "@/components/Testimonials";
import { Crumbs, JsonLd } from "@/components/JsonLd";
import { SERVICES, SITE } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/work-with-me" },
  title: "Work with me: talks, workshops, brand collaborations",
  description:
    "Book Shiva Ganesh Talikota to speak on agentic AI and generative AI, run a hands-on workshop, collaborate on a tech brand campaign, or hire him as an engineer. Hyderabad, India.",
  keywords: [
    "AI speaker Hyderabad",
    "agentic AI speaker India",
    "tech speaker for college events",
    "GitHub Copilot workshop",
    "AI workshop for students",
    "tech brand collaboration India",
    "hire AI engineer Hyderabad",
  ],
};

const FAQ = [
  {
    q: "Do you speak at colleges?",
    a: "Yes, most of my talks so far have been to students: guest sessions, club events and tech fests. Tell me the audience and the date.",
  },
  {
    q: "Where are you based, and do you travel?",
    a: "I'm in Hyderabad. Online and in person both work. Tell me the city and the date and we'll work it out.",
  },
  {
    q: "What does a brand collaboration look like?",
    a: "Usually me using your product properly, then showing it: a demo at an event, a hands-on session, or content on LinkedIn and Instagram. I only put my name to things I'd actually use.",
  },
  {
    q: "How much do you charge?",
    a: "It depends on the format and the audience. Write to me about the event and I'll come back to you with something straightforward.",
  },
  {
    q: "How quickly will you reply?",
    a: "Usually within a couple of days. Everything that comes through the contact form lands in my own inbox.",
  },
];

export default function WorkWithMePage() {
  return (
    <>
      <Crumbs name="Work with me" path="/work-with-me" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ways to work with Shiva Ganesh Talikota",
          itemListElement: SERVICES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.title,
              description: s.summary,
              provider: { "@id": `${SITE.url}/#person` },
              areaServed: { "@type": "Country", name: "India" },
            },
          })),
        }}
      />

      <PageHeader
        index="01"
        eyebrow="Work with me"
        title={<>Talks, workshops, and the <em className="italic">occasional brand.</em></>}
        lede="If you're putting on an event, launching something for students or engineers, or hiring, this is the page. Pick whatever fits and it comes straight to me."
      />

      <section className="shell">
        <Stagger className="space-y-5">
          {SERVICES.map((s, i) => (
            <StaggerItem key={s.slug}>
              <article
                id={s.slug}
                className="surface lift scroll-mt-28 grid gap-6 p-7 md:grid-cols-12 md:gap-10 md:p-10"
              >
                <div className="md:col-span-5">
                  <span className="label">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="font-display mt-3 text-[30px] leading-[1.05] md:text-[38px]">{s.title}</h2>
                  <p className="safe-text mt-4 text-pretty text-[15.5px] leading-[1.65] text-[var(--ink-2)]">
                    {s.summary}
                  </p>
                </div>

                <div className="md:col-span-4">
                  <p className="label">Formats</p>
                  <ul className="mt-3 space-y-2">
                    {s.formats.map((f) => (
                      <li key={f} className="flex gap-3 text-[14.5px] text-[var(--ink-2)]">
                        <span className="mt-[10px] h-px w-3 shrink-0 bg-[var(--accent)]" aria-hidden />
                        <span className="safe-text">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="label mt-6">Done before</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.proof.map((p) => (
                      <Tag key={p}>{p}</Tag>
                    ))}
                  </div>
                </div>

                <div className="flex items-end md:col-span-3 md:justify-end">
                  {s.external ? (
                    <Button href={s.external}>{s.cta}</Button>
                  ) : (
                    <Link
                      href={`/contact?topic=${s.topic}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-[14.5px] text-[var(--bg)] transition-opacity duration-300 hover:opacity-85"
                    >
                      {s.cta}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M4 12h15M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Testimonials index="02" />

      {/* how it works */}
      <section className="border-t border-[var(--rule)] bg-[var(--bg-sunken)] py-20 md:py-28">
        <div className="shell">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">03</span>
              <span className="label">How it goes</span>
            </div>
          </Reveal>
          <Stagger className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["Write to me", "Through the contact form or by email. The more detail, the faster I can say yes."],
              ["I reply", "Usually within a couple of days, from my own inbox, not a template."],
              ["We plan it", "A short call if it needs one. Then I show up prepared, which is most of the job."],
            ].map(([h, b], i) => (
              <StaggerItem key={h}>
                <span className="label">step {i + 1}</span>
                <h3 className="font-display mt-3 text-[26px] leading-tight">{h}</h3>
                <p className="safe-text mt-3 text-pretty text-[15px] leading-relaxed text-[var(--ink-2)]">{b}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* faq */}
      <section className="shell py-20 md:py-28">
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">04</span>
            <span className="label">Questions people ask</span>
          </div>
        </Reveal>
        <div className="mt-6">
          {FAQ.map((f) => (
            <Reveal key={f.q}>
              <details className="group border-b border-[var(--rule)] py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] [&::-webkit-details-marker]:hidden">
                  <span className="safe-text">{f.q}</span>
                  <span className="mono-sm shrink-0 text-[var(--ink-3)] transition-transform duration-300 group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="safe-text mt-4 max-w-[62ch] text-pretty text-[15px] leading-relaxed text-[var(--ink-2)]">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 flex flex-wrap gap-3">
            <Button href="/contact?topic=talk">Invite me to speak</Button>
            <Button href="/speaking-kit" variant="outline">
              Get the speaker kit
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
