"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Next's App Router scrolls to the top on navigation, but it fires that
   before the new page has finished rendering. With smooth scrolling on
   <html> the browser animates the jump, the animation gets interrupted
   mid-render, and you land partway down the new page instead of at its
   start. Smooth scrolling is now opt-in per interaction, and this forces
   the reset instantly on every route change.

   Hash links are left alone so /speaking#some-event still lands on the
   right section. */

export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
