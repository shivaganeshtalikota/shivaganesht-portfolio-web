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
    "Founder of matriXO. I build AI systems that ship — automapp, pAIr — and speak about them at Microsoft, ISB and T-Hub. Hyderabad, India.",
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
  sub: "Founder of matriXO, where we map what students actually learn against what roles actually ask for. I turn hard problems into products people use — then I go on stage and explain how.",
  stats: [
    { value: "2,000+", label: "Users served", note: "matriXO, from zero" },
    { value: "2,089", label: "Agentathon 2025", note: "Guinness-record hackathon" },
    { value: "20+", label: "Stages", note: "Microsoft, ISB, T-Hub" },
    { value: "4,800+", label: "Following", note: "LinkedIn" },
  ],
} as const;

export const ABOUT_SHORT =
  "I founded a company before I finished the degree. matriXO started in 2023 to fix something broken in how students find opportunities — it maps what they actually learn against what roles actually ask for. It now serves thousands of them. Along the way I've built multi-agent AI systems, shipped production sites for real clients, and spoken about all of it at the Microsoft Campus, ISB and T-Hub.";

export const ABOUT_LONG = [
  "I started writing code because I wanted to build things, not because I wanted to study them. That instinct turned into matriXO in 2023 — a platform I founded and still engineer, built on Next.js, TypeScript and Firebase, which grew from zero to more than two thousand users while I was still an undergraduate.",
  "The engineering underneath is the part I care about most. With automapp I built a natural-language automation engine on a hard architectural rule: the model proposes, it never executes. With pAIr I led a five-person team building a seven-agent compliance pipeline over a 310-document corpus of Indian government policy — it took Runner-Up at the SAP Code Unnati Innovation Marathon 4.0.",
  "Before matriXO I worked at TurboHire, where I drove strategic initiatives that lifted operational efficiency by 20%, and held a core role at Wission Talks. I've also led media and marketing for Student Tribe. Each of those taught me something the degree didn't.",
  "The other half of the work is telling people about it. I've spoken four times at Microsoft — most recently at GitHub Copilot Dev Days Telangana, an event that crossed 1,100 registrations in under 24 hours — on Generative AI at the Microsoft Campus, to 350+ students on agentic AI at AVNIET, and to a hall of a hundred at JBIET on turning ideas into startups. Through matriXO I run DevAgentic 1.0, our own agentic-AI workshop series at DraperU India.",
  "My favourite moment wasn't on a stage though. It was in the audience at T-Hub, getting to ask Bob Metcalfe — the man who co-invented Ethernet and wrote Metcalfe's Law — what he was excited to build next. He talked about industrial automation and continuous health monitoring, and about Ethernet reaching 400 Gbps. I think about that answer a lot.",
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
      "matriXO maps what students actually learn in college against what roles actually ask for, then closes the gap with targeted recommendations. I founded it in 2023 and have engineered it end to end since — product design, architecture, build and release.",
      "It grew from zero to over 2,000 users while holding 99.9% uptime, running on Next.js 14, React and TypeScript in strict mode, with Firebase Authentication, Cloud Firestore and Cloud Storage behind it.",
      "Running it means working across engineering, product, marketing and operations at once — which is where I learned that shipping is a communication problem as much as a technical one.",
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
      "The whole architecture rests on one rule: the model proposes, it never executes. There is no code path from model output to code execution — the planner can only emit a workflow the Zod-validated DSL already permits.",
      "That constraint is what makes the rest defensible. Inbound email is treated as hostile: message bodies never reach the planner, and the executable step list is frozen before any email is read, so a prompt-injected instruction has nothing to widen.",
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
      "Indian micro, small and medium enterprises lose real money to compliance they can't navigate. pAIr is an AI compliance and government-scheme navigator built to close that gap.",
      "I led a five-person team and architected a seven-stage multi-agent pipeline — ingestion, reasoning, planning, execution, verification, explanation and scoring — each agent its own Python module behind an orchestrator.",
      "It runs retrieval over a committed corpus of 310 scraped government policy documents using FAISS and 768-dimension Gemini embeddings, and answers in more than fifteen Indian languages.",
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
      "A public-profile website built in React and Vite and deployed to a custom domain — real client work with a real audience, not a side project.",
      "I wrote the large majority of the codebase and owned the build, the domain and the deployment pipeline through to production.",
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
      "A decentralised real-estate platform enabling fractional ownership of land assets through tokenisation. I implemented ERC-1155 smart contracts in Solidity on Avalanche for asset ownership and transfers. Built as a prototype; never audited for production.",
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
      "An AI platform built for the Google Solution Challenge 2025 that automates and personalises the generation of learning content, aimed at making educational resources more accessible and easier to scale.",
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
      "An emotion-recognition system combining NLP with computer vision, analysing written input alongside facial expression to predict emotional state and shape a response.",
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
      "Built for the Amazon ML Challenge: an entity-extraction system reading product attributes — weight, dimensions, volume — directly from images using OCR and machine learning.",
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
    body: "Four sessions on Microsoft campuses, including Generative AI at the Generative AI Summit and GitHub Copilot in Visual Studio Code at GitHub Copilot Dev Days Telangana — an event that crossed 1,100 registrations in under 24 hours.",
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
    body: "Built an OCR and machine-learning system extracting product attributes — weight, dimensions, volume — directly from product images.",
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
    note: "Asked the co-inventor of Ethernet what new applications he was excited to build on it. He talked about industrial automation, cloud computing and continuous health monitoring — and Ethernet reaching 400 Gbps.",
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
  { href: "/contact", label: "Contact" },
] as const;
