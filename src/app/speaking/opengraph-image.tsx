import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Talks, workshops, and a few very good rooms.";

export default function Image() {
  return ogCard({
    eyebrow: "Speaking & Events",
    title: "Talks, workshops, and a few very good rooms.",
    note: "Four times at Microsoft. ISB, T-Hub, DraperU, AVNIET. 31 photographs.",
  });
}
