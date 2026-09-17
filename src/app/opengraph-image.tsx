import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "I build AI systems that actually ship.";

export default function Image() {
  return ogCard({
    eyebrow: "Open to engineering roles",
    title: "I build AI systems that actually ship.",
    note: "matriXO, automapp, pAIr. Hyderabad, India.",
  });
}
