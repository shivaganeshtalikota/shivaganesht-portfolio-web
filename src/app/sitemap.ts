import type { MetadataRoute } from "next";
import { EVENTS, EXTRA_ROUTES, NAV, SITE } from "@/data/site";

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/work-with-me": 0.95,
  "/projects": 0.9,
  "/about": 0.9,
  "/speaking": 0.85,
  "/speaking-kit": 0.8,
  "/experience": 0.8,
  "/awards": 0.7,
  "/contact": 0.7,
  "/now": 0.6,
};

/* Image entries let the event photographs show up in image search for
   things like "Shiva Ganesh Talikota Microsoft". */
const IMAGES: Record<string, string[]> = {
  "/": ["/portrait/hero.webp", "/portrait/microsoft.webp"],
  "/about": ["/portrait/wide.webp"],
  "/awards": ["/portrait/gwr-award.webp"],
  "/speaking": EVENTS.flatMap((e) => e.photos.map((p) => p.src)),
  "/speaking-kit": ["/portrait/hero.webp", "/portrait/wide.webp", "/portrait/microsoft.webp"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [...NAV, ...EXTRA_ROUTES].map((n) => ({
    url: `${SITE.url}${n.href === "/" ? "" : n.href}`,
    lastModified: now,
    changeFrequency: n.href === "/" || n.href === "/now" ? ("weekly" as const) : ("monthly" as const),
    priority: PRIORITY[n.href] ?? 0.6,
    ...(IMAGES[n.href] ? { images: IMAGES[n.href].map((src) => `${SITE.url}${src}`) } : {}),
  }));
}
