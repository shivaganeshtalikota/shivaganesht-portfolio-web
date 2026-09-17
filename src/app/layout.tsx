import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { AWARDS, PROJECTS, SITE } from "@/data/site";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Easter } from "@/components/Easter";
import { Terminal } from "@/components/Terminal";
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
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  category: "technology",
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
    images: [{ url: "/portrait/hero.webp", width: 1400, height: 1400, alt: `${SITE.name} — ${SITE.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/portrait/hero.webp"],
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
      knowsLanguage: ["en", "te", "hi"],
      seeks: { "@type": "Demand", name: SITE.availableLabel },
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
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who is Shiva Ganesh Talikota?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Shiva Ganesh Talikota is a founder and product engineer based in Hyderabad, India. He founded matriXO in 2023, an education-technology platform that maps what students learn in college against what roles actually ask for, and grew it from zero to more than 2,000 users. He graduated in Computer Science with an AI & ML specialisation from Kommuri Pratap Reddy Institute of Technology in May 2026.",
          },
        },
        {
          "@type": "Question",
          name: "What is matriXO?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "matriXO is an education-technology platform founded by Shiva Ganesh Talikota in 2023. It maps what students actually learn in college against what employers ask for, then closes the gap with targeted recommendations. It is built on Next.js, React, TypeScript and Firebase, serves over 2,000 users, and also runs DevAgentic, an agentic-AI workshop series.",
          },
        },
        {
          "@type": "Question",
          name: "What has Shiva Ganesh Talikota built?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "His main builds are matriXO, the EdTech platform he founded; automapp, a natural-language automation engine built on the rule that the language model proposes plans but never executes them; and pAIr, a seven-agent AI compliance and government-scheme navigator for Indian MSMEs that retrieves over a 310-document policy corpus and answers in more than fifteen Indian languages. pAIr was Runner-Up at the SAP Code Unnati Innovation Marathon 4.0.",
          },
        },
        {
          "@type": "Question",
          name: "Where has Shiva Ganesh Talikota spoken?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "He has spoken four times at Microsoft campuses in Hyderabad, including on Generative AI at the Generative AI Summit and on GitHub Copilot in Visual Studio Code at GitHub Copilot Dev Days Telangana. He has also spoken to 350+ students on agentic AI at AVNIET, delivered a guest session on creativity and innovation at JBIET, pitched at the Indian School of Business, and hosts DevAgentic, matriXO's own agentic-AI workshop series at DraperU India.",
          },
        },
        {
          "@type": "Question",
          name: "How can I contact Shiva Ganesh Talikota?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `By email at ${SITE.email}, via LinkedIn at linkedin.com/in/shivaganesht, on GitHub at github.com/shivaganeshtalikota, or by booking a 1:1 session at topmate.io/shivaganesht. He is open to engineering roles, collaborations and speaking invitations.`,
          },
        },
      ],
    },
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
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      </head>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--accent)] focus:px-5 focus:py-2.5 focus:text-sm focus:text-[var(--accent-ink)]"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <Easter />
          <Terminal />
        </Providers>
      </body>
    </html>
  );
}
