"use client";

import { useEffect, useRef } from "react";
import { SITE } from "@/data/site";
import { field } from "@/lib/field";
import { Mark } from "./Mark";

/* The first thing whenever a page is opened: the S and my name assemble, a
   row of nodes connects, and then the S flies up into the logo and the name
   into the bar beside it. The bar folds the name away again a few seconds
   later on every page but home.

   The build-up is pure CSS so it starts on the very first paint, before any
   JavaScript has loaded. A script in <head> decides whether it runs: every
   full page load, never for reduced motion. Moving between pages inside the
   site doesn't reload, so it doesn't replay. If JavaScript never arrives, a
   CSS fallback fades the whole thing out anyway. */

// The build-up is CSS, timed from the first paint. The flight is timed from
// that same moment, not from when JavaScript got here, so a slow load never
// leaves a pause between the two.
const BUILD = 1600; // ms after first paint: the last node has just connected
const FLIGHT = 850;
const EASE_FLIGHT = "cubic-bezier(0.65, 0, 0.25, 1)";

export function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || (root.dataset.intro !== "on" && root.dataset.intro !== "run")) return;

    let flown = false;
    let finished = false;
    const timers: number[] = [];
    // JavaScript has arrived: from here it lands the intro itself, so the CSS
    // fallback that clears a stuck one stands down
    root.dataset.intro = "run";

    const finish = () => {
      if (finished) return;
      finished = true;
      root.dataset.intro = "done";
      // a ripple through the field where the S landed
      const logo = document.querySelector("[data-logo-mark]")?.getBoundingClientRect();
      if (logo) {
        field({
          type: "pulse",
          x: ((logo.left + logo.width / 2) / window.innerWidth) * 2 - 1,
          y: -(((logo.top + logo.height / 2) / window.innerHeight) * 2 - 1),
        });
      }
      window.dispatchEvent(new Event("intro-done"));
    };

    const fly = () => {
      if (flown) return;
      flown = true;
      const flewAt = performance.now();
      el.classList.add("intro-leaving");

      // FLIP: measure where each piece is and where its twin in the bar is,
      // then move it there with transforms only, so it stays on the GPU
      const mark = el.querySelector<HTMLElement>("[data-intro-mark]");
      const toMark = document.querySelector<HTMLElement>("[data-logo-mark]");
      if (mark && toMark) {
        const a = mark.getBoundingClientRect();
        const b = toMark.getBoundingClientRect();
        mark.animate(
          [
            { transform: "translate(0px, 0px) scale(1)" },
            {
              transform: `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${
                b.top + b.height / 2 - (a.top + a.height / 2)
              }px) scale(${b.width / a.width})`,
            },
          ],
          { duration: FLIGHT, easing: EASE_FLIGHT, fill: "forwards" }
        );
      }

      // The name goes into the bar (the bar holds it open while the intro
      // runs), or folds away if for some reason the bar isn't showing it. Scale by font size, not box height: the two lines have
      // different line-heights, and scaling by box height lands it ~20% big.
      const name = el.querySelector<HTMLElement>("[data-intro-name]");
      const toName = document.querySelector<HTMLElement>("[data-logo-name] > span");
      const showing = toName?.closest("[data-expanded='true']");
      if (name && toName && showing) {
        const a = name.getBoundingClientRect();
        const b = toName.getBoundingClientRect();
        const k = parseFloat(getComputedStyle(toName).fontSize) / parseFloat(getComputedStyle(name).fontSize);
        name.animate(
          [
            { transform: "translate(0px, 0px) scale(1)" },
            {
              transform: `translate(${b.left - a.left}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${k})`,
            },
          ],
          { duration: FLIGHT, easing: EASE_FLIGHT, fill: "forwards" }
        );
      } else if (name) {
        name.animate(
          [
            { opacity: 1, transform: "translateY(0px)" },
            { opacity: 0, transform: "translateY(-16px)" },
          ],
          { duration: 420, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" }
        );
      }

      // hand over on the frame the flight ends, not a timer that might drift from it
      const flights = el.getAnimations({ subtree: true }).filter((an) => an instanceof Animation && an.effect?.getComputedTiming().duration === FLIGHT);
      if (flights.length) {
        const land = () => {
          // Development only: record how exactly each piece lands on its twin
          // in the bar, and when, so the handover can be checked by numbers.
          if (process.env.NODE_ENV !== "production") {
            const r = (e: Element | null) => {
              const b = e?.getBoundingClientRect();
              return b ? [b.left, b.top, b.width, b.height].map((v) => +v.toFixed(2)) : null;
            };
            (window as unknown as { __intro?: unknown }).__intro = {
              paint: Math.round(firstPaint()),
              flewAt: Math.round(flewAt),
              landedAt: Math.round(performance.now()),
              mark: [r(mark), r(toMark)],
              name: showing ? [r(name), r(toName)] : null,
              firstLetter: showing ? [r(name?.querySelector(".intro-l") ?? null), r(toName?.querySelector(".logo-l") ?? null)] : null,
            };
          }
          finish();
        };
        Promise.all(flights.map((an) => an.finished)).then(land, finish);
      } else {
        timers.push(window.setTimeout(finish, FLIGHT));
      }
      timers.push(window.setTimeout(finish, FLIGHT + 400)); // belt and braces
    };

    // anything at all skips straight to the landing
    const skip = () => fly();
    const opts = { passive: true, once: true } as const;
    window.addEventListener("pointerdown", skip, opts);
    window.addEventListener("keydown", skip, opts);
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchmove", skip, opts);
    timers.push(window.setTimeout(fly, Math.max(40, firstPaint() + BUILD - performance.now())));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      // No finish() here: StrictMode runs this cleanup straight after the
      // first mount in development, and the layout never unmounts it for real.
      // The CSS fallback covers any other way of getting stuck.
    };
  }, []);

  return (
    <div id="intro" ref={ref} aria-hidden className="intro">
      <div className="intro-bg" />
      <div className="intro-stage">
        <span className="intro-mark" data-intro-mark="">
          <Mark size={84} />
        </span>
        <p className="intro-name font-display" data-intro-name="">
          {SITE.name.split("").map((ch, i) => (
            <span key={i} className="intro-l" style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
        <p className="intro-role">
          {SITE.role} · {SITE.location}
        </p>
        <div className="intro-net">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="intro-node" style={{ "--i": i } as React.CSSProperties} />
          ))}
          <span className="intro-wire" />
        </div>
      </div>
    </div>
  );
}

/* How long the page's own entrance should wait so it plays as the intro
   lifts, not behind it. Measured from the same first paint the intro is
   timed from, so the two stay in step however long the page took to load.
   Zero when the intro isn't playing. */
export function introDelay() {
  if (typeof document === "undefined") return 0;
  const state = document.documentElement.dataset.intro;
  if (state !== "on" && state !== "run") return 0;
  return Math.max(0, (firstPaint() + BUILD + 120 - performance.now()) / 1000);
}

function firstPaint() {
  return (
    performance.getEntriesByName("first-contentful-paint")[0]?.startTime ??
    performance.getEntriesByName("first-paint")[0]?.startTime ??
    performance.now()
  );
}
