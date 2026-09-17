import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return NAV.map((n) => ({
    url: `${SITE.url}${n.href === "/" ? "" : n.href}`,
    lastModified: now,
    changeFrequency: n.href === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: n.href === "/" ? 1 : 0.8,
  }));
}
