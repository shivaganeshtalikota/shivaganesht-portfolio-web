import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "I founded a company before I finished the degree.";

export default function Image() {
  return ogCard({
    eyebrow: "About",
    title: "I founded a company before I finished the degree.",
    note: "The longer version: matriXO, TurboHire, and the bit where I got to ask Bob Metcalfe a question.",
  });
}
