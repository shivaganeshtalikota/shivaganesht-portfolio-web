import media from "./media.json";

/* ────────────────────────────────────────────────────────────────
   Single source of truth. Claims are either self-attested by Shiva
   or independently verified. Award wording is deliberately precise.
   ──────────────────────────────────────────────────────────────── */

export const SITE = {
  name: "Shiva Ganesh Talikota",
  shortName: "Shiva Ganesh Talikota",
  initials: "SGT",
  url: "https://shivaganeshtalikota.vercel.app",
  role: "Founder & Product Engineer",
  company: "matriXO",
  companyUrl: "https://matrixo.in",
  location: "Hyderabad, India",
  email: "shivaganesht@icloud.com",
  resume: "/Shiva-Ganesh-Talikota-Resume.pdf",
  topmate: "https://topmate.io/shivaganesht",
  available: true,
  availableLabel: "Open to engineering roles",
  title: "Shiva Ganesh Talikota — Founder & Product Engineer",
  description:
    "I'm Shiva. I run matriXO, build AI systems like automapp and pAIr, and speak at places like Microsoft and ISB. Based in Hyderabad.",
  keywords: [
    "Shiva Ganesh Talikota",
    "matriXO",
    "founder",
    "product engineer",
    "AI engineer",
    "agentic AI",
    "Next.js developer",
    "Hyderabad",
    "generative AI",
    "multi-agent systems",
  ],
} as const;

export const SOCIALS = [
  { label: "GitHub", handle: "shivaganeshtalikota", href: "https://github.com/shivaganeshtalikota" },
  { label: "LinkedIn", handle: "in/shivaganesht", href: "https://www.linkedin.com/in/shivaganesht" },
  { label: "Instagram", handle: "shivaganesh.speaks", href: "https://instagram.com/shivaganesh.speaks" },
  { label: "Topmate", handle: "shivaganesht", href: "https://topmate.io/shivaganesht" },
  { label: "Email", handle: SITE.email, href: `mailto:${SITE.email}` },
] as const;

/* ── hero ──────────────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "Founder & Product Engineer",
  lines: ["I build AI", "systems that", "actually ship."],
  sub: "I run matriXO, where we map what students learn in college against what jobs actually ask for. Most weeks I'm building. Some weeks I'm on a stage explaining how.",
  stats: [
    { value: "2,000+", label: "Users served", note: "on matriXO" },
    { value: "2,089", label: "Agentathon 2025", note: "people in one room" },
    { value: "20+", label: "Talks & events", note: "Microsoft, ISB, T-Hub" },
    { value: "4,800+", label: "Followers", note: "on LinkedIn" },
  ],
} as const;

export const ABOUT_SHORT =
  "I started matriXO in 2023, during my second year of college. The problem seemed obvious once I noticed it: you finish a degree with no real sense of which parts of it employers care about. So we built something that lines those two things up. A few thousand students use it now. The rest of my time goes to AI systems, client work, and the occasional stage.";

export const ABOUT_LONG = [
  "I learned to code because I wanted to make things, and school was slow about letting me. That impatience turned into matriXO in 2023. It runs on Next.js, TypeScript and Firebase, it went from nobody to a couple of thousand users while I was still an undergraduate, and I have been the one engineering it the whole way.",
  "The part I like most is underneath. automapp started from one stubborn rule I gave myself: the model can propose a plan, but it is never allowed to run anything. Everything else about that project follows from holding that line. pAIr was bigger and messier. Five of us, seven agents, and 310 documents of Indian government policy that somebody had to make searchable. It came second at the SAP Code Unnati Innovation Marathon 4.0.",
  "Before matriXO I was at TurboHire, where the work I drove took about 20% out of how long things took to run. I was on the core team at Wission Talks, and I ran media and marketing for Student Tribe. None of that was engineering, and all of it taught me things the degree did not.",
  "Then there is the talking. Four times at Microsoft now, most recently on GitHub Copilot at Copilot Dev Days Telangana, which crossed 1,100 registrations in a day. Agentic AI to 350 students at AVNIET. A hall of a hundred at JBIET on turning an idea into something real. Through matriXO I run DevAgentic, our own workshop series at DraperU India.",
  "My favourite moment was not on a stage though. I was in the audience at T-Hub when Bob Metcalfe was speaking, and I got to ask him what he was excited to build on Ethernet next. He co-invented the thing. He talked about factories and health monitoring and 400 Gbps like it was all still ahead of him. I think about that more than I expected to.",
  "I finished my degree in Computer Science with an AI and ML specialisation at Kommuri Pratap Reddy Institute of Technology in May 2026. I am in Hyderabad. If you have a problem worth chewing on, I would like to hear it.",
] as const;

/* ── projects ──────────────────────────────────────────────────── */

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  year: string;
  role: string;
  featured: boolean;
  body: string[];
  tech: string[];
  highlights: string[];
  links: { label: string; href: string }[];
  archived?: boolean;
};

export const PROJECTS: Project[] = [
  {
    slug: "matrixo",
    name: "matriXO",
    tagline: "The company I founded, and still build.",
    year: "2023 — now",
    role: "Founder & Product Engineer",
    featured: true,
    body: [
      "matriXO looks at what a student has actually covered in college, compares it against what job listings are asking for, and points them at whatever is missing. I started it in 2023 and I have built every part of it since: the product, the architecture, the code, the releases.",
      "It went from nobody to over 2,000 users and has held 99.9% uptime. Next.js 14 and React on the front, TypeScript in strict mode throughout, Firebase Auth, Firestore and Cloud Storage behind it.",
      "Running it means doing engineering, product, marketing and operations in the same week. That is where I learned that shipping is mostly a communication problem wearing a technical costume.",
    ],
    tech: ["Next.js 14", "React", "TypeScript", "Firebase Auth", "Firestore", "Cloud Storage", "Vercel"],
    highlights: [
      "Scaled 0 → 2,000+ users",
      "99.9% uptime held",
      "Runs DevAgentic 1.0, our agentic-AI workshop series",
      "Hosts workshops with speakers from Microsoft",
    ],
    links: [{ label: "matrixo.in", href: "https://matrixo.in" }],
  },
  {
    slug: "automapp",
    name: "automapp",
    tagline: "Describe an outcome. It compiles into a workflow that runs.",
    year: "2026",
    role: "Solo build",
    featured: true,
    body: [
      "You describe what you want in one plain sentence. An LLM planner compiles it into a validated workflow document, and a deterministic engine executes that document.",
      "One rule holds the whole thing up: the model proposes, it never executes. There is no path from model output to running code. The planner can only emit a workflow the Zod-validated DSL already allows.",
      "That constraint is what makes the rest of it defensible. Inbound email is treated as hostile. Message bodies never reach the planner, and the list of steps is frozen before any email is opened, so an instruction hidden in one has nothing left to widen.",
    ],
    tech: ["Next.js 16", "React 19", "TypeScript", "Drizzle ORM", "libSQL / Turso", "Zod", "AES-256-GCM"],
    highlights: [
      "60 offline tests, no network required",
      "SSRF defence: re-resolves DNS on every redirect hop and refuses private address space, including 169.254.169.254",
      "OAuth tokens encrypted at rest with AES-256-GCM",
      "Connectors for Gmail, Google Sheets, Telegram and generic HTTP",
    ],
    links: [{ label: "Source", href: "https://github.com/shivaganeshtalikota/automapp" }],
  },
  {
    slug: "pair",
    name: "pAIr",
    tagline: "Seven agents reading 310 government policy documents so an MSME doesn't have to.",
    year: "2026",
    role: "Team Lead · AI Systems Architect",
    featured: true,
    body: [
      "Small Indian businesses lose real money to compliance nobody has the time to decode. pAIr is the thing I wanted to exist for them: a navigator for government schemes and the rules attached to them.",
      "I led a team of five and designed the pipeline: seven stages, from ingestion through reasoning, planning, execution, verification and explanation to scoring. Each agent is its own Python module sitting behind an orchestrator.",
      "It searches 310 scraped policy documents with FAISS over 768-dimension Gemini embeddings, and answers in more than fifteen Indian languages, because the people who need it do not all read English.",
    ],
    tech: ["Python 3.11", "FastAPI", "Gemini 2.5 Flash", "FAISS", "Firebase", "React 18", "Vite"],
    highlights: [
      "Runner-Up — SAP Code Unnati Innovation Marathon 4.0",
      "7-stage multi-agent pipeline, one module per agent",
      "310-document policy corpus with FAISS retrieval",
      "Covers CGTMSE, PMEGP, MUDRA, Startup India and Udyam registration",
      "Results translated into 15+ Indian languages",
    ],
    links: [
      { label: "Source", href: "https://github.com/shivaganeshtalikota/pAIr-764" },
      { label: "Live demo", href: "https://pair-code-unnati-proj.vercel.app" },
    ],
  },
  {
    slug: "thk",
    name: "talikotaharikrishna.com",
    tagline: "A production site for a public figure, live on its own domain.",
    year: "2026",
    role: "Build & deploy",
    featured: true,
    body: [
      "A public-profile site in React and Vite, on its own domain. Real client work with a real audience watching, which is a different kind of pressure to a side project.",
      "I wrote most of the codebase and owned the build, the domain and the deploy pipeline all the way to production.",
    ],
    tech: ["React", "Vite", "JavaScript", "Vercel"],
    highlights: ["Live in production on its own domain", "Authored 49 of 52 commits"],
    links: [
      { label: "Visit", href: "https://talikotaharikrishna.com" },
      { label: "Source", href: "https://github.com/shivaganeshtalikota/THK-Website" },
    ],
  },
  {
    slug: "propchain",
    name: "PropChain",
    tagline: "Fractional ownership of land, tokenised on-chain.",
    year: "2025",
    role: "Builder",
    featured: false,
    archived: true,
    body: [
      "A platform for owning a fraction of a piece of land instead of all of it, using tokens. I wrote the ERC-1155 contracts in Solidity on Avalanche to handle ownership and transfers. It was a prototype and was never audited, so treat it as an experiment.",
    ],
    tech: ["Solidity", "ERC-1155", "Avalanche", "Web3"],
    highlights: ["ERC-1155 multi-token standard for fractional shares"],
    links: [],
  },
  {
    slug: "eduguardian",
    name: "EduGuardian",
    tagline: "Personalised learning content, generated automatically.",
    year: "2025",
    role: "Builder",
    featured: false,
    archived: true,
    body: [
      "Built for the Google Solution Challenge 2025. It generates learning material and tailors it to the person reading it, so that good teaching resources are less of a bottleneck.",
    ],
    tech: ["AI", "Content automation", "EdTech"],
    highlights: ["Participant — Google Solution Challenge 2025"],
    links: [],
  },
  {
    slug: "emotion-detection",
    name: "Multimodal Emotion Detection",
    tagline: "Reading emotional state from text and face together.",
    year: "2025",
    role: "Builder",
    featured: false,
    archived: true,
    body: [
      "Reads what someone wrote and what their face is doing at the same time, then makes a guess at how they feel. Combining the two signals turned out to be far better than either one alone.",
    ],
    tech: ["Deep learning", "NLP", "Computer vision"],
    highlights: ["Text and vision signals fused for a single prediction"],
    links: [],
  },
  {
    slug: "entity-extraction",
    name: "Entity Extraction from Product Images",
    tagline: "Pulling weight, volume and dimensions straight out of a photo.",
    year: "2024",
    role: "Builder",
    featured: false,
    archived: true,
    body: [
      "Built for the Amazon ML Challenge. It pulls weight, dimensions and volume straight out of a product photo using OCR and a bit of machine learning, so nobody has to type them in.",
    ],
    tech: ["Computer vision", "OCR", "Machine learning"],
    highlights: ["Participant — Amazon ML Challenge"],
    links: [],
  },
];

/* ── experience ────────────────────────────────────────────────── */

export type Role = {
  org: string;
  title: string;
  period: string;
  place: string;
  current?: boolean;
  points: string[];
  href?: string;
};

export const EXPERIENCE: Role[] = [
  {
    org: "matriXO",
    title: "Founder & Product Engineer",
    period: "2023 — Present",
    place: "Hyderabad, India",
    current: true,
    href: "https://matrixo.in",
    points: [
      "Founded the company and directed end-to-end development of the platform, scaling it from zero to 2,000+ users while holding 99.9% uptime.",
      "Built and shipped full-stack applications on Next.js 14, React and TypeScript in strict mode, with Firebase Auth, Cloud Firestore and Cloud Storage, deployed on Vercel.",
      "Run DevAgentic 1.0, our agentic-AI workshop series at DraperU India, hosting keynote speakers from Microsoft.",
      "Work across engineering, product, marketing and operations, translating requirements into maintainable systems and owning the release path.",
    ],
  },
  {
    org: "Dell Technologies India",
    title: "Tech & Media Team Ambassador",
    period: "Mar — Jun 2026",
    place: "Hyderabad · Hybrid",
    points: [
      "Represented Dell across two AI-focused technology events, running hands-on testing of their new AI laptops.",
      "Engaged 100+ attendees through community initiatives and social campaigns.",
    ],
  },
  {
    org: "Student Tribe",
    title: "Media & Marketing",
    period: "2025",
    place: "Hyderabad, India",
    points: [
      "Led media and marketing for a student-focused platform, building reach and running campaigns across channels.",
    ],
  },
  {
    org: "Intel® Unnati Industrial Training Program",
    title: "AI Intern Trainee",
    period: "Apr — Jul 2024",
    place: "Remote",
    points: [
      "Applied AI, machine learning and NLP through industry-focused projects and structured technical training.",
    ],
  },
  {
    org: "TurboHire",
    title: "Intern",
    period: "2024",
    place: "Hyderabad, India",
    points: [
      "Drove multiple strategic initiatives that increased operational efficiency by 20%.",
      "Applied Lean and Six Sigma methodology alongside data structures and algorithms work.",
    ],
  },
  {
    org: "Wission Talks",
    title: "Core Team",
    period: "2024",
    place: "Hyderabad, India",
    points: [
      "Held a core role on the team, contributing to programming, operations and community growth.",
    ],
  },
  {
    org: "OSSEB",
    title: "Technical Lead",
    period: "Oct 2023 — Mar 2024",
    place: "Hyderabad · Hybrid",
    points: [
      "Led the technical team on IoT and Arduino-based projects from planning through execution.",
      "Mentored peers on technical implementation and collaborative problem-solving.",
    ],
  },
];

export const EDUCATION = {
  school: "Kommuri Pratap Reddy Institute of Technology",
  degree: "B.Tech, Computer Science & Engineering (AI & ML)",
  period: "Nov 2022 — May 2026",
  place: "Hyderabad, India",
  coursework: [
    "Software Engineering",
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Database Management Systems",
    "Operating Systems",
    "Computer Networks",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Natural Language Processing",
    "Data Analytics",
    "Cloud Computing",
  ],
};

export const SKILLS = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "Swift", "C", "Solidity"] },
  {
    group: "Web & Software Engineering",
    items: ["React", "Next.js", "Node.js", "FastAPI", "REST APIs", "TypeScript strict", "GitHub Actions", "CI/CD", "Testing", "Auth & RBAC", "Agile"],
  },
  {
    group: "AI & Data",
    items: ["Generative AI", "Agentic AI", "Multi-agent systems", "Machine learning", "Deep learning", "NLP", "Computer vision", "Prompt engineering", "FAISS"],
  },
  {
    group: "Cloud & Data",
    items: ["Google Cloud", "Microsoft Azure", "AWS", "Firebase", "Firestore", "MongoDB", "MySQL", "Turso", "Vercel"],
  },
  { group: "Blockchain", items: ["Solidity", "Smart contracts", "ERC-1155", "Avalanche", "Algorand", "Web3"] },
  { group: "Practice", items: ["Lean & Six Sigma", "Strategic planning", "Product development", "Stakeholder management", "Public speaking"] },
] as const;

/* ── recognition ───────────────────────────────────────────────── */

export type Award = {
  title: string;
  org: string;
  year: string;
  kind: "award" | "record" | "role" | "cert";
  body: string;
  image?: string;
};

export const AWARDS: Award[] = [
  {
    title: "Guinness World Records participation certificate",
    org: "Agentathon 2025 · GDG Hyderabad",
    year: "2025",
    kind: "record",
    image: "/portrait/gwr-award.webp",
    body: "Agentathon 2025, organised by Google Developer Groups Hyderabad, set the Guinness World Records title for the most participants in an agentic AI hackathon, with 2,089 participants. I took part and hold a participation certificate for the record-setting event.",
  },
  {
    title: "Runner-Up",
    org: "SAP Code Unnati Innovation Marathon 4.0",
    year: "2026",
    kind: "award",
    body: "Runner-Up for pAIr, an AI compliance and government-scheme navigator for Indian MSMEs. I was Team Lead and AI systems architect on a five-person team.",
  },
  {
    title: "4× speaker at Microsoft",
    org: "Microsoft · Hyderabad",
    year: "2024 — 2026",
    kind: "role",
    body: "Four sessions on Microsoft campuses. Generative AI at the Generative AI Summit, and GitHub Copilot in Visual Studio Code at Copilot Dev Days Telangana, which crossed 1,100 registrations inside a day.",
  },
  {
    title: "Microsoft Learn Student Ambassador",
    org: "Microsoft",
    year: "2024 — 2025",
    kind: "role",
    body: "Selected into Microsoft's global student ambassador programme, running sessions and community initiatives around Microsoft's developer and AI technologies.",
  },
  {
    title: "Campus Mantri",
    org: "GeeksforGeeks",
    year: "2024 — 2025",
    kind: "role",
    body: "Represented GeeksforGeeks on campus, running technical sessions and connecting students to the wider developer community.",
  },
  {
    title: "Participant — Google Solution Challenge 2025",
    org: "Google · GDG on Campus",
    year: "2025",
    kind: "award",
    body: "Submitted EduGuardian, an AI platform automating and personalising the generation of learning content.",
  },
  {
    title: "Participant — Amazon ML Challenge",
    org: "Amazon",
    year: "2024",
    kind: "award",
    body: "Built an OCR and machine-learning system that reads weight, dimensions and volume straight out of a product photo.",
  },
  {
    title: "Community leadership",
    org: "GDSC WoW Hyderabad · Google Crowdsource · Google Cloud Arcade",
    year: "2023 — 2025",
    kind: "role",
    body: "Volunteered across two consecutive editions of Google Developer Student Clubs WoW Hyderabad, contributed to Google Crowdsource, and took part in the Google Cloud Arcade programme.",
  },
];

export const CERTIFICATIONS = [
  { name: "Lean & Six Sigma", org: "Certified", year: "2024" },
  { name: "Career Essentials in Generative AI", org: "Microsoft & LinkedIn", year: "2024" },
  { name: "Introduction to Generative AI", org: "Google Cloud · Coursera", year: "2024" },
  { name: "Introduction to MongoDB", org: "MongoDB University", year: "2024" },
] as const;

/* ── speaking ──────────────────────────────────────────────────── */

export type EventPhoto = { src: string; thumb: string; w: number; h: number };
export type SpeakingEvent = {
  slug: string;
  year: string;
  title: string;
  venue: string;
  role: string;
  blurb: string;
  photos: EventPhoto[];
};

export const EVENTS = media.events as SpeakingEvent[];
export const PORTRAITS = media.portraits as Record<string, { src: string; w: number; h: number }>;

/* Engagements without photography in the archive. */
export type Talk = {
  title: string;
  venue: string;
  year: string;
  role: string;
  note: string;
};

export const TALKS: Talk[] = [
  {
    title: "GitHub Copilot Dev Days — Telangana",
    venue: "Microsoft Hyderabad",
    year: "2026",
    role: "Speaker",
    note: "Spoke on GitHub Copilot in Visual Studio Code. The event crossed 1,100 registrations in under 24 hours.",
  },
  {
    title: "Agentic AI — The Next Frontier",
    venue: "Innovators Club Sphere · AVNIET",
    year: "2026",
    role: "Speaker",
    note: "Spoke to 350+ students on autonomous AI agents, alongside engineers from Deloitte, GE Digital and Runo.",
  },
  {
    title: "DevAgentic 1.0",
    venue: "DraperU India, Hyderabad",
    year: "2026",
    role: "Host & Organiser",
    note: "matriXO's own agentic-AI workshop series, from LLMs to autonomous agents, with keynote speakers from Microsoft.",
  },
  {
    title: "matriXO AI Workshop",
    venue: "Hyderabad",
    year: "2026",
    role: "Host",
    note: "Hosted engineers from Microsoft for a session on careers in tech, the impact of AI, and cracking interviews at top companies.",
  },
  {
    title: "Fireside Chat with Bob Metcalfe",
    venue: "T-Hub Phase 2, Hyderabad",
    year: "2024",
    role: "Asked a question on stage",
    note: "Asked the co-inventor of Ethernet what he was excited to build on it next. He talked about industrial automation, cloud computing, continuous health monitoring, and Ethernet getting to 400 Gbps.",
  },
  {
    title: "AWS Summit Mumbai 2026",
    venue: "Mumbai",
    year: "2026",
    role: "Attendee — Startup Zone",
    note: "Sessions on scaling agentic and generative AI architecture.",
  },
  {
    title: "Farcaster Builders India",
    venue: "Draper Startup House, Hyderabad",
    year: "2024",
    role: "Attendee",
    note: "Web3, Ethereum, Chainlink, and cryptographic truth in decentralised consensus.",
  },
];

/* ── navigation ────────────────────────────────────────────────── */

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/speaking", label: "Speaking" },
  { href: "/awards", label: "Recognition" },
  { href: "/now", label: "Now" },
  { href: "/contact", label: "Contact" },
] as const;

/* Reachable and in the sitemap, but kept out of the main nav so it
   doesn't crowd it. Linked from the speaking page and the footer. */
export const EXTRA_ROUTES = [{ href: "/speaking-kit", label: "Speaker kit" }] as const;

/* ── /now ──────────────────────────────────────────────────────── */

export const NOW = {
  updated: "September 2026",
  intro:
    "A /now page, in the spirit of nownownow.com. What I am actually doing at the moment, rather than everything I have ever done. I try to keep this honest and up to date.",
  sections: [
    {
      heading: "Building",
      items: [
        "automapp. Hardening the connector layer and writing the docs I keep wishing existed.",
        "matriXO. Recommendation quality is the thing I am chipping at right now.",
        "This site. It keeps growing features I did not plan.",
      ],
    },
    {
      heading: "Running",
      items: [
        "DevAgentic, our agentic-AI workshop series at DraperU India.",
        "1:1 sessions on Topmate, mostly with students trying to get a first role.",
      ],
    },
    {
      heading: "Learning",
      items: [
        "Writing WebGL by hand instead of reaching for a library. The hero on this site came out of that.",
        "Evaluation for agent systems, which is still mostly an unsolved mess.",
      ],
    },
    {
      heading: "Open to",
      items: [
        "Engineering roles, full time.",
        "Speaking invitations, particularly on agentic AI and on building things as a student.",
      ],
    },
  ],
} as const;

/* ── /speaking-kit ─────────────────────────────────────────────── */

export const KIT = {
  topics: [
    "Agentic AI and multi-agent systems, from the building side",
    "Generative AI in practice, and where it still falls over",
    "GitHub Copilot and AI-assisted development",
    "Building a company while still a student",
    "Turning an idea into something people actually use",
  ],
  bios: [
    {
      length: "One line",
      text: "Shiva Ganesh Talikota is the founder of matriXO and a product engineer in Hyderabad.",
    },
    {
      length: "Fifty words",
      text: "Shiva Ganesh Talikota is the founder of matriXO, an education-technology platform he started in 2023 and grew to over 2,000 users while still an undergraduate. He builds AI systems, has spoken four times at Microsoft, and took Runner-Up at the SAP Code Unnati Innovation Marathon 4.0.",
    },
    {
      length: "The full one",
      text: "Shiva Ganesh Talikota is a founder and product engineer based in Hyderabad. He started matriXO in 2023, during his second year of college, to close the gap between what students learn and what employers ask for; it now serves more than 2,000 users at 99.9% uptime. His engineering work includes automapp, a natural-language automation engine built so that the model can propose a plan but never execute one, and pAIr, a seven-agent compliance navigator over 310 Indian government policy documents that took Runner-Up at the SAP Code Unnati Innovation Marathon 4.0. He has spoken four times at Microsoft, including on GitHub Copilot at Copilot Dev Days Telangana, and to 350 students on agentic AI at AVNIET. He holds a Guinness World Records participation certificate from Agentathon 2025. He graduated in Computer Science with an AI and ML specialisation in May 2026.",
    },
  ],
  headshots: [
    { label: "Formal, square", src: "/portrait/hero.webp", note: "1400 × 1400" },
    { label: "Formal, wide", src: "/portrait/wide.webp", note: "2200 × 1467" },
    { label: "Candid, Microsoft Campus", src: "/portrait/microsoft.webp", note: "900 × 900" },
  ],
} as const;
