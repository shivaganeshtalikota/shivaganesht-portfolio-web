import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AWARDS, EVENTS, LANGUAGES, PROJECTS, SERVICES, SITE, TALKS } from "@/data/site";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Easter } from "@/components/Easter";
import { Terminal } from "@/components/Terminal";
import { ScrollReset } from "@/components/ScrollReset";
import { Analytics } from "@vercel/analytics/next";
import { Field3D } from "@/components/Field3D";
import { Intro } from "@/components/Intro";
import { ScrollRail } from "@/components/ScrollRail";
import { Secrets } from "@/components/Secrets";
import { Shortcuts } from "@/components/Shortcuts";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  keywords: [
    ...SITE.keywords,
    "AI speaker Hyderabad",
    "agentic AI speaker India",
    "tech speaker for colleges",
    "GitHub Copilot speaker",
    "AI workshop for students",
    "student founder India",
    "EdTech founder Hyderabad",
    "tech brand collaboration",
    "hire AI engineer Hyderabad",
    "KPRIT",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    firstName: "Shiva Ganesh",
    lastName: "Talikota",
    username: "shivaganesht",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    // geo signals — this is a Hyderabad-based person and it matters for local search
    "geo.region": "IN-TG",
    "geo.placename": "Hyderabad, Telangana, India",
    "geo.position": "17.385044;78.486671",
    ICBM: "17.385044, 78.486671",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
  width: "device-width",
  initialScale: 1,
  // lets the page (and the nav glass) extend under the notch
  viewportFit: "cover",
};

/* ── structured data ────────────────────────────────────────────
   A single @graph. Person is the anchor; the rest hangs off it so
   answer engines can resolve entities rather than guess.
   ──────────────────────────────────────────────────────────────── */

const personId = `${SITE.url}/#person`;
const siteId = `${SITE.url}/#website`;

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: SITE.name,
      alternateName: ["Shiva Ganesh", "shivaganesht"],
      url: SITE.url,
      email: `mailto:${SITE.email}`,
      image: `${SITE.url}/portrait/hero.webp`,
      jobTitle: SITE.role,
      description: SITE.description,
      gender: "Male",
      nationality: { "@type": "Country", name: "India" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
      worksFor: {
        "@type": "Organization",
        name: "matriXO",
        url: "https://matrixo.in",
        description:
          "An education-technology platform that maps what students learn in college against what roles actually ask for.",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Kommuri Pratap Reddy Institute of Technology",
        address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
      },
      knowsAbout: [
        "Artificial Intelligence",
        "Agentic AI",
        "Multi-agent systems",
        "Generative AI",
        "Machine Learning",
        "Natural Language Processing",
        "Full-stack engineering",
        "Next.js",
        "TypeScript",
        "Python",
        "Firebase",
        "EdTech",
        "Blockchain",
      ],
      knowsLanguage: LANGUAGES.map((l) => ({ "@type": "Language", name: l.name, alternateName: l.code })),
      seeks: { "@type": "Demand", name: SITE.availableLabel },
      hasOccupation: {
        "@type": "Occupation",
        name: "Product Engineer",
        occupationLocation: { "@type": "City", name: "Hyderabad" },
        skills: "Agentic AI, multi-agent systems, Next.js, TypeScript, Python, FastAPI, Firebase",
      },
      makesOffer: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.summary,
          url: `${SITE.url}/work-with-me#${s.slug}`,
        },
        areaServed: { "@type": "Country", name: "India" },
      })),
      sameAs: [
        "https://github.com/shivaganeshtalikota",
        "https://www.linkedin.com/in/shivaganesht",
        "https://instagram.com/shivaganesh.speaks",
        "https://topmate.io/shivaganesht",
        "https://matrixo.in",
      ],
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      url: SITE.url,
      name: SITE.name,
      inLanguage: "en-IN",
      publisher: { "@id": personId },
      about: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      url: SITE.url,
      name: SITE.title,
      isPartOf: { "@id": siteId },
      mainEntity: { "@id": personId },
      dateModified: "2026-09-17",
    },
    {
      "@type": "ItemList",
      name: "Projects by Shiva Ganesh Talikota",
      numberOfItems: PROJECTS.length,
      itemListElement: PROJECTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: p.name,
          description: p.tagline,
          applicationCategory: "WebApplication",
          author: { "@id": personId },
          ...(p.links[0] ? { url: p.links[0].href } : {}),
        },
      })),
    },
    ...AWARDS.filter((a) => a.kind === "award" || a.kind === "record").map((a) => ({
      "@type": "CreativeWork",
      name: `${a.title} — ${a.org}`,
      description: a.body,
      dateCreated: a.year,
      creator: { "@id": personId },
    })),
    ...[...EVENTS.map((e) => ({ title: e.title, venue: e.venue, year: e.year, role: e.role, note: e.blurb })),
        ...TALKS.map((t) => ({ title: t.title, venue: t.venue, year: t.year, role: t.role, note: t.note }))]
      .filter((e) => /speaker|host|organis/i.test(e.role))
      .map((e) => ({
        "@type": "Event",
        name: e.title,
        startDate: e.year.slice(0, 4),
        description: e.note,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: e.venue, address: { "@type": "PostalAddress", addressCountry: "IN" } },
        performer: { "@id": personId },
      })),
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            // theme before first paint, and whether this load gets the intro:
            // every time a page is opened, never for reduced motion (moving
            // between pages inside the site doesn't reload, so it doesn't replay)
            __html: `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){d.setAttribute('data-theme',t)}}catch(e){}try{var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.setAttribute('data-intro',rm?'done':'on')}catch(e){d.setAttribute('data-intro','done')}try{var n=navigator,c=n.connection;if((n.deviceMemory&&n.deviceMemory<=4)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2)||(c&&c.saveData)){d.classList.add('lite')}}catch(e){}})();`,
          }}
        />
        <JsonLd data={graph} />
      </head>
      <body>
        <Intro />
        <Providers>
          <ScrollReset />
          <Field3D />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--accent)] focus:px-5 focus:py-2.5 focus:text-sm focus:text-[var(--accent-ink)]"
          >
            Skip to content
          </a>
          <Nav />
          <ScrollRail />
          <main id="main">{children}</main>
          <Footer />
          <Easter />
          <Terminal />
          <Secrets />
          <Shortcuts />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
