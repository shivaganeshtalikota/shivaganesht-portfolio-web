import { SITE } from "@/data/site";

export const dynamic = "force-static";

export function GET() {
  const body = `/* TEAM */
Built by: ${SITE.name}
Role: ${SITE.role}
Where: ${SITE.location}
Contact: ${SITE.email}
GitHub: github.com/shivaganeshtalikota
LinkedIn: linkedin.com/in/shivaganesht

/* THANKS */
Everyone who ever let me on a stage.
The people I mentor on Topmate, who ask better questions than I do.
Chai.

/* SITE */
Standards: HTML, CSS, TypeScript
Components: Next.js 16, React 19, Tailwind CSS 4, motion
Type: Instrument Serif, Instrument Sans, JetBrains Mono
3D: a hand-written WebGL particle field. No three.js.
Secrets: 17. The terminal will tell you how many you have found.
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
