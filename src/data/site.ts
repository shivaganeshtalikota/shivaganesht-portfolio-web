import media from "./media.json";

/* ────────────────────────────────────────────────────────────────
   Single source of truth for every word on this site.
   Claims here are either self-attested by Shiva or independently
   verified. Wording of awards is deliberately precise.
   ──────────────────────────────────────────────────────────────── */

export const SITE = {
  name: "Shiva Ganesh Talikota",
  shortName: "Shiva Ganesh",
  url: "https://shivaganeshtalikota.vercel.app",
  role: "Founder & Product Engineer",
  company: "matriXO",
  companyUrl: "https://matrixo.in",
  location: "Hyderabad, India",
  email: "shivaganesht@icloud.com",
  resume: "/Shiva-Ganesh-Talikota-Resume.pdf",
  title: "Shiva Ganesh Talikota — Founder & Product Engineer",
  description:
    "Founder and product engineer in Hyderabad. I build AI systems that ship — matriXO, automapp, pAIr — and speak about them at Microsoft, ISB and T-Hub.",
  keywords: [
    "Shiva Ganesh Talikota",
    "matriXO",
    "founder",
    "product engineer",
    "AI engineer",
    "Next.js developer",
    "Hyderabad",
    "generative AI",
    "multi-agent systems",
    "full stack developer",
  ],
} as const;

export const SOCIALS = [
  { label: "GitHub", handle: "@shivaganeshtalikota", href: "https://github.com/shivaganeshtalikota" },
  { label: "LinkedIn", handle: "in/shivaganesht", href: "https://www.linkedin.com/in/shivaganesht" },
  { label: "Instagram", handle: "@shivaganesh.speaks", href: "https://instagram.com/shivaganesh.speaks" },
  { label: "Email", handle: SITE.email, href: `mailto:${SITE.email}` },
] as const;

/* ── hero copy ─────────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "Founder & Product Engineer · Hyderabad",
  headline: "I build AI systems\nthat actually ship.",
  sub: "Founder of matriXO. I turn hard problems into products people use — then I go on stage and explain how.",
  stats: [
    { value: "2,000+", label: "Users served", note: "matriXO, from zero" },
    { value: "2,089", label: "Agentathon 2025", note: "Guinness World Records title" },
    { value: "15+", label: "Tech events", note: "Speaker & organiser" },
    { value: "3,000+", label: "People reached", note: "Talks & workshops" },
  ],
} as const;

export const ABOUT_SHORT =
  "I'm a product engineer who founded a company before finishing the degree. matriXO started in 2023 as a way to fix something broken in how students find opportunities; it now serves thousands of them. Along the way I've built multi-agent AI systems, shipped production sites for real clients, and spoken about all of it at the Microsoft Campus, ISB and T-Hub.";

export const ABOUT_LONG = [
  "I started writing code because I wanted to build things, not because I wanted to study them. That instinct turned into matriXO in 2023 — a platform I founded and still engineer, built on Next.js, TypeScript and Firebase, that grew from zero to more than two thousand users while I was still an undergraduate.",
  "The engineering underneath is the part I care about most. With automapp I built a natural-language automation engine on a hard architectural rule: the model proposes, it never executes. With pAIr I led a five-person team building a seven-agent compliance pipeline over a 310-document corpus of Indian government policy — it took Runner-Up at the SAP Code Unnati Innovation Marathon 4.0.",
  "The other half of the work is telling people about it. I've spoken on Generative AI at the Microsoft Campus in Hyderabad, on creativity and innovation to a hall of a hundred students at JBIET, and pitched to investors at ISB. I was in the room at Agentathon 2025 when it set the Guinness World Records title for the most participants in an agentic AI hackathon.",
  "I graduated in Computer Science with a specialisation in AI & ML from Kommuri Pratap Reddy Institute of Technology in May 2026. I'm in Hyderabad, and I'm always interested in a good problem.",
] as const;

/* ── projects ──────────────────────────────────────────────────── */

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  year: string;
  role: string;
  featured: boolean;
  accent: string;
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
    year: "2023 — present",
    role: "Founder & Product Engineer",
    featured: true,
    accent: "#0071e3",
    body: [
      "matriXO is an education-technology platform I founded in 2023 and have engineered end to end ever since — product design, architecture, build and release.",
      "It grew from zero to over 2,000 users while maintaining 99.9% uptime, running on Next.js 14, React and TypeScript in strict mode, with Firebase Authentication, Cloud Firestore and Cloud Storage behind it and Vercel in front.",
      "Running it has meant working across engineering, product, marketing and operations at the same time — which is where I learned that shipping is a communication problem as much as a technical one.",
    ],
    tech: ["Next.js 14", "React", "TypeScript", "Firebase Auth", "Cloud Firestore", "Cloud Storage", "Vercel"],
    highlights: [
      "Scaled 0 → 2,000+ users",
      "99.9% uptime maintained",
      "TypeScript strict mode throughout",
      "Founded 2023, still shipping",
    ],
    links: [{ label: "Visit matrixo.in", href: "https://matrixo.in" }],
  },
  {
    slug: "automapp",
    name: "automapp",
    tagline: "Describe an outcome. It compiles into a workflow that runs.",
    year: "2026",
    role: "Solo build",
    featured: true,
    accent: "#5856d6",
    body: [
      "You describe what you want in one plain sentence. An LLM planner compiles it into a validated workflow document, and a deterministic engine executes that document.",
      "The whole architecture rests on one rule: the model proposes, it never executes. There is no code path from model output to code execution — the planner can only emit a workflow that the Zod-validated DSL already permits.",
      "That constraint is what makes the rest defensible. Inbound email is treated as hostile: message bodies never reach the planner, and the executable step list is frozen before any email is read, so a prompt-injected instruction has nothing to widen.",
    ],
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Drizzle ORM",
      "libSQL / Turso",
      "Zod",
      "AES-256-GCM",
    ],
    highlights: [
      "60 offline tests, no network required",
      "SSRF defence: re-resolves DNS on every redirect hop and refuses private address space, including 169.254.169.254",
      "OAuth tokens encrypted at rest with AES-256-GCM",
      "Connectors for Gmail, Google Sheets, Telegram and generic HTTP",
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/shivaganeshtalikota/automapp" }],
  },
  {
    slug: "pair",
    name: "pAIr — Policy AI Regulator",
    tagline: "Seven agents reading 310 government policy documents so an MSME doesn't have to.",
    year: "2026",
    role: "Team Lead · AI Systems & Product Architect",
    featured: true,
    accent: "#af52de",
    body: [
      "Indian micro, small and medium enterprises lose real money to compliance they can't navigate. pAIr is an AI compliance and government-scheme navigator built to close that gap.",
      "I led a five-person team and architected a seven-stage multi-agent pipeline — ingestion, reasoning, planning, execution, verification, explanation and scoring — with each agent as its own Python module behind an orchestrator.",
      "It runs retrieval over a committed corpus of 310 scraped government policy documents using FAISS and 768-dimension Gemini embeddings, and returns answers in more than fifteen Indian languages.",
    ],
    tech: [
      "Python 3.11",
      "FastAPI",
      "Gemini 2.5 Flash",
      "FAISS",
      "text-embedding-004",
      "Firebase Auth",
      "Cloud Firestore",
      "React 18",
      "Vite",
      "Tailwind CSS",
    ],
    highlights: [
      "Runner-Up — SAP Code Unnati Innovation Marathon 4.0",
      "7-stage multi-agent pipeline, one module per agent",
      "310-document government policy corpus with FAISS retrieval",
      "Covers CGTMSE, PMEGP, MUDRA, Startup India and Udyam registration",
      "Results translated into 15+ Indian languages",
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/shivaganeshtalikota/pAIr-764" },
      { label: "Live demo", href: "https://pair-code-unnati-proj.vercel.app" },
    ],
  },
  {
    slug: "thk",
    name: "talikotaharikrishna.com",
    tagline: "A production site for a public figure, shipped and live.",
    year: "2026",
    role: "Build & deploy",
    featured: true,
    accent: "#34c759",
    body: [
      "A public-profile website built in React and Vite and deployed to a custom domain — real client work with a real audience, rather than a side project.",
      "I wrote the large majority of the codebase and handled the build, the domain and the deployment pipeline through to production.",
    ],
    tech: ["React", "Vite", "JavaScript", "Vercel", "Custom domain"],
    highlights: ["Live in production on its own domain", "Authored 49 of 52 commits"],
    links: [
      { label: "Visit the site", href: "https://talikotaharikrishna.com" },
      { label: "Source on GitHub", href: "https://github.com/shivaganeshtalikota/THK-Website" },
    ],
  },
  {
    slug: "propchain",
    name: "PropChain",
    tagline: "Fractional ownership of land, tokenised on-chain.",
    year: "2025",
    role: "Builder",
    featured: false,
    accent: "#ff9500",
    archived: true,
    body: [
      "A decentralised real-estate platform enabling fractional ownership of land assets through tokenisation.",
      "I implemented ERC-1155 smart contracts in Solidity on the Avalanche blockchain to handle asset ownership and transfers. It was built as a prototype and was never audited for production use.",
    ],
    tech: ["Solidity", "ERC-1155", "Avalanche", "Web3", "Smart contracts"],
    highlights: ["ERC-1155 multi-token standard for fractional shares", "Prototype — not audited for production"],
    links: [],
  },
  {
    slug: "eduguardian",
    name: "EduGuardian",
    tagline: "Personalised learning content, generated automatically.",
    year: "2025",
    role: "Builder",
    featured: false,
    accent: "#ff2d55",
    archived: true,
    body: [
      "An AI-powered education platform built for the Google Solution Challenge 2025 that automates and personalises the generation of learning content, aimed at making educational resources more accessible and easier to scale.",
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
    accent: "#5ac8fa",
    archived: true,
    body: [
      "An emotion-recognition system combining natural language processing with computer vision, analysing written input alongside facial expression to predict emotional state and shape a response.",
    ],
    tech: ["Deep learning", "NLP", "Computer vision", "Python"],
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
    accent: "#00c7be",
    archived: true,
    body: [
      "Built for the Amazon ML Challenge: an entity-extraction system that reads product attributes — weight, dimensions, volume — directly from product images using OCR and machine learning, generating structured metadata without manual entry.",
    ],
    tech: ["Computer vision", "OCR", "Machine learning", "Python"],
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
      "Founded the company and directed end-to-end development of the platform, scaling it from zero to 2,000+ users while maintaining 99.9% uptime.",
      "Built and shipped full-stack applications on Next.js 14, React and TypeScript in strict mode, with Firebase Auth, Cloud Firestore and Cloud Storage, deployed on Vercel.",
      "Worked across engineering, product, marketing and operations, translating product requirements into maintainable systems and owning the release path.",
    ],
  },
  {
    org: "Dell Technologies India",
    title: "Tech & Media Team Ambassador",
    period: "Mar — Jun 2026",
    place: "Hyderabad, India · Hybrid",
    points: [
      "Represented Dell across two AI-focused technology events, running hands-on testing sessions of their new AI laptops.",
      "Engaged 100+ attendees through community initiatives and social campaigns, sharpening technical advocacy and public speaking.",
    ],
  },
  {
    org: "Intel® Unnati Industrial Training Program",
    title: "AI Intern Trainee",
    period: "Apr — Jul 2024",
    place: "Remote",
    points: [
      "Applied AI, machine learning and NLP through industry-focused projects and structured technical training.",
      "Built practical understanding of how real-world AI systems are specified, built and evaluated.",
    ],
  },
  {
    org: "OSSEB",
    title: "Technical Lead",
    period: "Oct 2023 — Mar 2024",
    place: "Hyderabad, India · Hybrid",
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

/* ── skills ────────────────────────────────────────────────────── */

export const SKILLS = [
  {
    group: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "Swift", "C", "Solidity"],
  },
  {
    group: "Web & Software Engineering",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "FastAPI",
      "REST APIs",
      "TypeScript strict mode",
      "Git & GitHub Actions",
      "CI/CD",
      "Testing & debugging",
      "Authentication & RBAC",
      "Agile / Scrum",
    ],
  },
  {
    group: "AI & Data",
    items: [
      "Generative AI",
      "Multi-agent systems",
      "Machine learning",
      "Deep learning",
      "NLP",
      "Computer vision",
      "Prompt engineering",
      "FAISS & vector search",
      "Predictive modelling",
    ],
  },
  {
    group: "Cloud & Data Stores",
    items: [
      "Google Cloud Platform",
      "Microsoft Azure",
      "Firebase",
      "Cloud Firestore",
      "MongoDB",
      "MySQL",
      "libSQL / Turso",
      "Vercel",
    ],
  },
  {
    group: "Blockchain",
    items: ["Solidity", "Smart contracts", "ERC-1155", "Avalanche", "Algorand", "Web3"],
  },
  {
    group: "Tools",
    items: [
      "VS Code",
      "GitHub Copilot",
      "Claude",
      "Gemini CLI",
      "Postman",
      "Android Studio",
      "n8n",
      "Power BI",
    ],
  },
] as const;

/* ── awards & recognition ──────────────────────────────────────── */

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
    title: "Guest speaker — four sessions",
    org: "Microsoft Learn",
    year: "2024 — 2025",
    kind: "role",
    body: "Delivered four guest sessions on emerging AI technologies, including a talk on Generative AI at the Generative AI Summit held at the Microsoft Campus in Hyderabad.",
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
    body: "Represented GeeksforGeeks on campus under the Campus Mantri programme, running technical sessions and connecting students to the wider developer community.",
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
    body: "Built an OCR and machine-learning system extracting product attributes — weight, dimensions, volume — directly from product images.",
  },
  {
    title: "Community leadership",
    org: "Google DSC WoW Hyderabad · Google Crowdsource · Google Cloud Arcade",
    year: "2023 — 2025",
    kind: "role",
    body: "Volunteered across two consecutive editions of Google Developer Student Clubs WoW Hyderabad, contributed to Google Crowdsource, and took part in the Google Cloud Arcade programme.",
  },
];

export const CERTIFICATIONS = [
  { name: "Career Essentials in Generative AI", org: "Microsoft & LinkedIn", year: "2024" },
  { name: "Introduction to Generative AI", org: "Google Cloud · Coursera", year: "2024" },
  { name: "Introduction to MongoDB", org: "MongoDB University", year: "2024" },
] as const;

/* ── speaking & events (from the real photo archive) ───────────── */

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

export const SPEAKING_ROLES = ["Speaker", "Guest Speaker", "Director — Sponsorship Relations"];

/* ── navigation ────────────────────────────────────────────────── */

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/speaking", label: "Speaking" },
  { href: "/awards", label: "Awards" },
  { href: "/contact", label: "Contact" },
] as const;
