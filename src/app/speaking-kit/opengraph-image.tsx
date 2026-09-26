import { ogCard, OG_SIZE, OG_TYPE } from "@/app/_og/card";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Everything you need to put me on a bill.";

export default function Image() {
  return ogCard({
    eyebrow: "Speaker kit",
    title: "Everything you need to put me on a bill.",
    note: "Bio at three lengths, headshots, topics and every talk so far.",
  });
}
