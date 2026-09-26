"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* The page's sections as a little network down the left edge: one node per
   section, wired together, and the wire fills in as you read. Hover a node
   for its name, click it to go there. On phones it becomes a thin progress
   line under the bar.

   Sections are found from the numbered labels the design already uses
   ("02 · Earlier work", "03 — Speaking"), or from an explicit data-rail. */

// `anchor` is the heading line a click should land on; null means the very top
type Item = { label: string; anchor: HTMLElement | null };

/* Where an element sits in the document, from layout alone. getBoundingClientRect
   would include transforms, and headings that haven't scrolled into view yet
   are still shifted down by their reveal animation, which made clicks land low. */
function docTop(el: HTMLElement) {
  let y = 0;
  let e: HTMLElement | null = el;
  while (e) {
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return y;
}

// how far below the top a heading should sit once we've scrolled to it
function landing() {
  const bar = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 60;
  return bar + 22;
}

function tidy(s: string) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function discover(): Item[] {
  const main = document.getElementById("main");
  if (!main) return [];
  const out: Item[] = [];
  const seen = new Set<Element>();

  main.querySelectorAll<HTMLElement>("[data-rail], .label").forEach((n) => {
    let label: string | null = null;
    const host = (n.dataset.rail ? n : n.closest("section, header")) as HTMLElement | null;
    if (!host || seen.has(host)) return;

    if (n.dataset.rail) {
      label = n.dataset.rail;
    } else {
      const text = n.textContent?.trim() ?? "";
      const inline = text.match(/^\d{2}\s*[—–-]\s*(.+)$/); // "03 — Speaking"
      if (inline) label = inline[1];
      else if (/^\d{2}$/.test(text)) {
        const next = n.nextElementSibling as HTMLElement | null;
        const nextText = next?.textContent?.trim() ?? "";
        // "02" + "Earlier work", or "01" + an <h2>; never "01" + "2024", which is a list of events
        if (next && (next.classList.contains("label") || next.tagName === "H2") && !/^\d{4}/.test(nextText)) {
          label = nextText;
        }
      }
    }
    if (!label) return;
    seen.add(host);
    // land on the heading row itself, not the section's padded outer edge
    const row = (n.dataset.rail ? n : (n.parentElement?.closest("div") ?? n)) as HTMLElement;
    out.push({ label: tidy(label), anchor: row });
  });

  // the top of the page gets a node too, if the first section isn't already it
  const first = out[0]?.anchor ? docTop(out[0].anchor) : 0;
  if (!out.length || first > 400) {
    out.unshift({ label: "Top", anchor: null });
  }
  return out.length > 24 ? out.slice(0, 24) : out;
}

export function ScrollRail() {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const [fill, setFill] = useState(0); // 0..1 along the rail
  const [page, setPage] = useState(0); // 0..1 down the page
  const tops = useRef<number[]>([]);

  // find the sections once the new page has rendered
  useEffect(() => {
    setItems([]);
    const t = window.setTimeout(() => setItems(discover()), 450);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (items.length < 3) return;
    let raf = 0;

    const measure = () => {
      tops.current = items.map((it) => (it.anchor ? docTop(it.anchor) : 0));
    };

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      // a section counts as current once its heading reaches the spot a
      // click would land it, so clicking a node always lights that node
      const line = y + landing() + 60;
      const T = tops.current;
      const atEnd = y + vh >= docH - 4;

      let i = 0;
      for (let k = 0; k < T.length; k++) if (T[k] <= line) i = k;
      if (atEnd) i = T.length - 1;
      const next = T[i + 1];
      const frac = atEnd || next === undefined ? 0 : Math.min(1, Math.max(0, (line - T[i]) / (next - T[i])));

      setActive(i);
      setFill(T.length > 1 ? (i + frac) / (T.length - 1) : 0);
      setPage(Math.min(1, y / Math.max(1, docH - vh)));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    // images and fonts settling move sections down after the first measure
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [items]);

  const go = (i: number) => {
    const anchor = items[i]?.anchor ?? null;
    const target = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return anchor ? Math.min(max, Math.max(0, docTop(anchor) - landing())) : 0;
    };
    window.scrollTo({ top: target(), behavior: "smooth" });

    // Images and fonts can still move things while we travel, so check where
    // we stopped and settle onto the exact line. If the reader scrolls
    // themselves on the way, they've changed their mind: leave them be.
    let timer = 0;
    let taken = false;
    const takeOver = () => (taken = true);
    const cleanup = () => {
      window.removeEventListener("scrollend", settle);
      window.removeEventListener("wheel", takeOver);
      window.removeEventListener("touchstart", takeOver);
      window.removeEventListener("keydown", takeOver);
      window.clearTimeout(timer);
    };
    const settle = () => {
      cleanup();
      if (taken) return;
      const t = target();
      if (Math.abs(window.scrollY - t) > 1) window.scrollTo({ top: t, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("scrollend", settle);
    window.addEventListener("wheel", takeOver, { passive: true });
    window.addEventListener("touchstart", takeOver, { passive: true });
    window.addEventListener("keydown", takeOver);
    timer = window.setTimeout(settle, 1400); // browsers without scrollend
  };

  if (items.length < 3) return null;
  const n = items.length;
  const H = Math.min(n * 30, 420);

  return (
    <>
      <nav aria-label="Sections on this page" className="rail no-print">
        <div className="rail-track" style={{ height: H }}>
          <span className="rail-wire" aria-hidden />
          <span className="rail-wire rail-wire-on" aria-hidden style={{ transform: `scaleY(${fill})` }} />
          {items.map((it, i) => (
            <button
              key={it.label + i}
              type="button"
              onClick={() => go(i)}
              className="rail-item"
              style={{ top: `${(i / (n - 1)) * 100}%` }}
              aria-label={`Go to ${it.label}`}
              aria-current={i === active ? "location" : undefined}
              data-state={i < active ? "past" : i === active ? "on" : "next"}
            >
              <span className="rail-node" aria-hidden />
              <span className="rail-label">{it.label}</span>
            </button>
          ))}
        </div>
        <span className="rail-pct" aria-hidden>
          {String(Math.round(page * 100)).padStart(2, "0")}
        </span>
      </nav>
      {/* phones: the same progress, as a hairline under the bar */}
      <span
        aria-hidden
        className="rail-line no-print"
        style={{ transform: `scaleX(${page})`, opacity: page > 0.005 ? 1 : 0 }}
      />
    </>
  );
}
