"use client";

import { useEffect, useState } from "react";
import { foundSecrets } from "@/lib/secrets";

/* The one place the secrets show up for good: how many you've found, and
   the clues for the rest. Nothing floats over the page; a short toast
   announces each find, and this keeps the count. */
export function FooterSecrets({ total }: { total: number }) {
  const [found, setFound] = useState(0);

  useEffect(() => {
    setFound(foundSecrets().length);
    const onSecret = (e: Event) => setFound((e as CustomEvent<{ count: number }>).detail.count);
    window.addEventListener("secret", onSecret);
    return () => window.removeEventListener("secret", onSecret);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-secrets"))}
      className="mono-sm group inline-flex items-baseline gap-2 text-left text-[var(--ink-3)] transition-colors hover:text-[var(--accent)]"
    >
      <span className="text-[var(--accent)] transition-transform duration-500 group-hover:rotate-180" aria-hidden>
        ✦
      </span>
      {found > 0 ? (
        <span>
          <span className="tabular-nums text-[var(--ink-2)]">
            {found} of {total}
          </span>{" "}
          secrets found. See the clues.
        </span>
      ) : (
        <span>{total} secrets are hidden on this site. Here are the clues.</span>
      )}
    </button>
  );
}
