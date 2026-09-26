"use client";

import { useEffect } from "react";
import { unlock } from "@/lib/secrets";
import { SITE } from "@/data/site";

export function LostSecret() {
  useEffect(() => {
    // not-found.tsx can't export metadata, so the tab would otherwise
    // carry the home page's title
    document.title = `Page not found — ${SITE.name}`;
    unlock("lost");
  }, []);
  return null;
}
