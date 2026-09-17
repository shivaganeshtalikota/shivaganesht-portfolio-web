"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard blocked (insecure context, or permission denied) — fall back
      // to a selection the visitor can copy themselves
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else to try */
      }
      ta.remove();
    }
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="mono-sm shrink-0 rounded-full border border-[var(--rule)] px-3 py-1 text-[11px] text-[var(--ink-3)] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
      aria-live="polite"
    >
      {done ? "copied" : "copy"}
    </button>
  );
}
