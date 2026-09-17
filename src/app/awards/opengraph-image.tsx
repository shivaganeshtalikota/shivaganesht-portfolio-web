import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Awards, and what they actually mean.";

export default function Image() {
  return ogCard({
    eyebrow: "Recognition",
    title: "Awards, and what they actually mean.",
    note: "Guinness World Records participation at Agentathon 2025. Runner-Up at SAP Code Unnati 4.0.",
  });
}
