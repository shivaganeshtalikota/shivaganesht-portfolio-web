import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Seven jobs, one degree, same three years.";

export default function Image() {
  return ogCard({
    eyebrow: "Experience",
    title: "Seven jobs, one degree, same three years.",
    note: "matriXO, Dell Technologies, Intel Unnati, Student Tribe, TurboHire, Wission Talks, OSSEB.",
  });
}
