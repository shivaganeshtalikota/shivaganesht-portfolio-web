import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import { CopyButton } from "@/components/CopyButton";
import { Crumbs } from "@/components/JsonLd";
import { Mark } from "@/components/Mark";
import { SITE } from "@/data/site";
import brand from "@/data/brand.json";

export const metadata: Metadata = {
  alternates: { canonical: "/brand" },
  title: "Logo & brand",
  description:
    "Shiva Ganesh Talikota's logo, the serif S with the vermilion dot, to download as SVG, PNG or JPG on dark, light, grey and colour backgrounds, with the brand colours.",
};

type File = { kind: string; href: string };
type Item = {
  key: string;
  label: string;
  note: string;
  bg: string | null;
  colors: string[];
  preview: string;
  wide?: boolean;
  round?: boolean;
  files: File[];
};

const COLOURS = [
  { name: "Night", hex: "#0c0b0a", note: "the square, dark pages" },
  { name: "Paper", hex: "#faf9f7", note: "light pages" },
  { name: "Ink", hex: "#14130f", note: "text on light" },
  { name: "Cream", hex: "#f2f0ec", note: "text on dark, the S" },
  { name: "Vermilion", hex: "#ff5c26", note: "the dot, on dark" },
  { name: "Deep vermilion", hex: "#c93800", note: "the dot, on light" },
];

// a see-through checkerboard, so transparent files look transparent
const CHECKER =
  "repeating-conic-gradient(var(--fill-2) 0% 25%, transparent 0% 50%) 50% / 16px 16px";

function fileName(href: string) {
  return `shiva-ganesh-talikota-${href.split("/").pop()}`;
}

export default function BrandPage() {
  const groups = brand.groups as { title: string; lede: string; items: Item[] }[];

  return (
    <>
      <Crumbs name="Logo & brand" path="/brand" />
      <PageHeader
        index="01"
        eyebrow="Logo & brand"
        title={<>The S, and <em className="italic">where to get it.</em></>}
        lede="If you're putting me on a poster, a slide or an event page, take the logo from here. Every version is drawn from the same outline the site uses, so they all match."
      />

      {/* the mark, big, and the one-click everything */}
      <section className="shell">
        <Reveal>
          <div className="surface grid items-center gap-10 p-8 md:grid-cols-12 md:p-12">
            <div className="flex justify-center md:col-span-5">
              <Mark size={184} />
            </div>
            <div className="md:col-span-7">
              <p className="label">The mark</p>
              <p className="safe-text mt-4 max-w-[46ch] text-pretty text-[16px] leading-relaxed text-[var(--ink-2)]">
                A serif S from Instrument Serif, with a full stop in vermilion. It&apos;s the favicon, the corner of
                every page, and it stands in for my name wherever my name won&apos;t fit.
              </p>
              <a
                href={brand.zip}
                download
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[var(--ink)] px-6 py-3 text-[14.5px] text-[var(--bg)] transition-opacity duration-300 hover:opacity-85"
              >
                Download everything
                <span className="mono-sm text-[11px] opacity-70">ZIP · 26 files</span>
              </a>
              <p className="mono-sm mt-4 text-[11px] text-[var(--ink-3)]">
                SVG, PNG and JPG, every background, plus a short note on using it.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {groups.map((g, gi) => (
        <section key={g.title} className="shell pt-20 md:pt-28">
          <Reveal>
            <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="label">{String(gi + 2).padStart(2, "0")}</span>
              <span className="label">{g.title}</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="safe-text mt-6 max-w-[60ch] text-[15px] leading-relaxed text-[var(--ink-2)]">{g.lede}</p>
          </Reveal>

          <Stagger className={`mt-10 grid gap-5 ${g.items[0]?.wide ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {g.items.map((it) => (
              <StaggerItem key={it.key}>
                <article className="surface overflow-hidden">
                  <div
                    className="grid place-items-center p-8"
                    style={{
                      background: it.bg ?? CHECKER,
                      aspectRatio: it.wide ? "2.4 / 1" : "4 / 3",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- the SVG itself, unprocessed */}
                    <img
                      src={it.preview}
                      alt={`${SITE.name} logo, ${it.label}`}
                      className={`max-h-full w-auto ${it.wide ? "max-w-[88%]" : "h-[62%]"} ${it.round ? "rounded-full" : ""}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[15.5px]">{it.label}</h3>
                      <span className="flex gap-1" aria-hidden>
                        {it.colors.map((c, i) => (
                          <span
                            key={c + i}
                            className="h-3 w-3 rounded-full border border-[var(--rule-strong)]"
                            style={{ background: c }}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mono-sm mt-1.5 text-[11px] leading-relaxed text-[var(--ink-3)]">{it.note}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {it.files.map((f) => (
                        <a
                          key={f.href}
                          href={f.href}
                          download={fileName(f.href)}
                          className="mono-sm inline-flex items-center gap-1.5 rounded-full border border-[var(--rule-strong)] px-3 py-1.5 text-[11px] text-[var(--ink-2)] transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 4v12M6 10l6 6 6-6M5 20h14" />
                          </svg>
                          {f.kind}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ))}

      {/* colours */}
      <section className="shell pt-20 md:pt-28">
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">{String(groups.length + 2).padStart(2, "0")}</span>
            <span className="label">Colours</span>
          </div>
        </Reveal>
        <Stagger className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {COLOURS.map((c) => (
            <StaggerItem key={c.hex}>
              <div className="surface overflow-hidden">
                <div className="h-20 border-b border-[var(--rule)]" style={{ background: c.hex }} />
                <div className="p-4">
                  <p className="text-[14px]">{c.name}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="mono-sm text-[11px] text-[var(--ink-2)]">{c.hex}</span>
                    <CopyButton text={c.hex} />
                  </div>
                  <p className="mono-sm mt-1.5 text-[10.5px] leading-snug text-[var(--ink-3)]">{c.note}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* using it */}
      <section className="shell py-20 md:py-28">
        <Reveal>
          <div className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
            <span className="label">{String(groups.length + 3).padStart(2, "0")}</span>
            <span className="label">Using it</span>
          </div>
        </Reveal>
        <Stagger className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            ["Give it room", "Keep at least a quarter of the mark's width clear on every side. It's small and quiet; crowding it makes it look like a typo."],
            ["Keep it whole", "Don't stretch it, rotate it, recolour the S or move the dot. If none of the versions here suit the background, the transparent S will."],
            ["Not too small", "The square reads down to 16 pixels, which is what the browser tab uses. Below about 24, drop the name and use the mark alone."],
          ].map(([h, b]) => (
            <StaggerItem key={h}>
              <h3 className="font-display text-[24px] leading-tight">{h}</h3>
              <p className="safe-text mt-3 text-pretty text-[15px] leading-relaxed text-[var(--ink-2)]">{b}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
