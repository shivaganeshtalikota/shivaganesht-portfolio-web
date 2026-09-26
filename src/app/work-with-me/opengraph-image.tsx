import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Book me to speak, run a workshop, or build something together.";

export default function Image() {
  return ogCard({
    eyebrow: "Talks \u00b7 Workshops \u00b7 Brand collabs",
    title: "Book me to speak, run a workshop, or build something together.",
    note: "Agentic AI, generative AI in practice, GitHub Copilot. Four times at Microsoft.",
  });
}
