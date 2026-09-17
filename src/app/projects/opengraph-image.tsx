import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "What I built, and how it works.";

export default function Image() {
  return ogCard({
    eyebrow: "Selected work",
    title: "What I built, and how it works.",
    note: "matriXO, automapp, pAIr, and a production client site.",
  });
}
