import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/data/site";

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/projects": 0.9,
  "/about": 0.9,
  "/speaking": 0.8,
  "/experience": 0.8,
  "/awards": 0.7,
  "/contact": 0.7,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return NAV.map((n) => ({
    url: `${SITE.url}${n.href === "/" ? "" : n.href}`,
    lastModified: now,
    changeFrequency: n.href === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: PRIORITY[n.href] ?? 0.6,
  }));
}
