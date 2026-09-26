import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "What I'm doing at the moment.";

export default function Image() {
  return ogCard({
    eyebrow: "Now",
    title: "What I'm doing at the moment.",
    note: "Building automapp and matriXO, running DevAgentic, learning WebGL by hand.",
  });
}
