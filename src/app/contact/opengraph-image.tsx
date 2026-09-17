import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Let's talk.";

export default function Image() {
  return ogCard({
    eyebrow: "Contact",
    title: "Let's talk.",
    note: "Open to engineering roles, collaborations and speaking invitations.",
  });
}
