import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Shiva Ganesh",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0c0b0a",
    theme_color: "#0c0b0a",
    icons: [
      { src: "/icon", sizes: "48x48", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
