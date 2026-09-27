"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { useTheme } from "next-themes";
import { centreOf, switchTheme } from "@/lib/theme-switch";

/* The light/dark switch, as Liquid Glass: a small glass track with the sun
   and the moon in it, and a clear round lens over whichever one is on. The
   icon under the lens is seen through the glass: a little bigger and
   brighter, drawn as real vector icons so it stays sharp. Click to switch,
   or hold the lens and drag it across; it follows the finger exactly, swells
   a few pixels, and on the way narrows and grows taller like a drop. The new
   theme spreads out from the switch in a circle (see switchTheme). */

const TRACK_W = 62;
const TRACK_H = 30;
const LENS = 34; // a touch taller than the track, as in the reference
const GROW = 2; // px it swells on each side while held
const GIVE = 3; // px it can be pulled past either end
const LEFT = TRACK_H / 2 - LENS / 2; // centred over the sun
const RIGHT = TRACK_W - TRACK_H / 2 - LENS / 2; // centred over the moon
const MAG_REST = 1.12;
const MAG_HELD = 1.26;

function Sun({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </svg>
  );
}
function Moon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8z" />
    </svg>
  );
}

// the two icons, each centred on its end of the track
function Icons({ bright }: { bright: boolean }) {
  const cls = bright ? "text-[var(--ink)]" : "text-[var(--ink-4)]";
  return (
    <>
      <span className="absolute grid place-items-center" style={{ left: 0, top: 0, width: TRACK_H, height: TRACK_H }}>
        <Sun className={cls} />
      </span>
      <span className="absolute grid place-items-center" style={{ left: TRACK_W - TRACK_H, top: 0, width: TRACK_H, height: TRACK_H }}>
        <Moon className={cls} />
      </span>
    </>
  );
}

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [held, setHeld] = useState(false);
  const dark = mounted && resolvedTheme === "dark";
  const self = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(LEFT); // the lens' left edge at rest size
  const grow = useMotionValue(0);
  const mag = useMotionValue(MAG_REST);
  const vx = useVelocity(x);
  const stretch = useTransform(vx, (v) => Math.min(1, Math.abs(v) / 700));

  // the lens as drawn: swollen and stretched about its centre
  const lw = useTransform([grow, stretch], ([G, S]: number[]) => (LENS + 2 * GROW * G) * (1 - 0.1 * S));
  const lh = useTransform([grow, stretch], ([G, S]: number[]) => (LENS + 2 * GROW * G) * (1 + 0.1 * S));
  const lx = useTransform([x, lw], ([X, W]: number[]) => X + LENS / 2 - W / 2);
  const ly = useTransform(lh, (H) => TRACK_H / 2 - H / 2);

  // the icons inside: aligned with the real ones, magnified about the lens' centre
  const innerX = useTransform(lx, (v) => -v);
  const innerY = useTransform(ly, (v) => -v);
  const origin = useTransform(x, (X) => `${X + LENS / 2}px ${TRACK_H / 2}px`);

  // a round hole in the track's icons where the lens is, so none shows twice
  const hole = useTransform([lx, ly, lw, lh], ([X, Y, W, H]: number[]) => {
    const rx = W / 2;
    const ry = H / 2;
    const cy = Y + ry;
    return `path(evenodd, "M-40 -40H200V100H-40Z M${X} ${cy}A${rx} ${ry} 0 1 0 ${X + W} ${cy}A${rx} ${ry} 0 1 0 ${X} ${cy}Z")`;
  });

  const drag = useRef<{ id: number; grab: number; start: number; moved: boolean; at: number } | null>(null);
  const placed = useRef(false);

  useEffect(() => setMounted(true), []);

  // follow the theme, wherever it was changed from (this switch, the terminal, the OS)
  useEffect(() => {
    if (!mounted) return;
    const to = dark ? RIGHT : LEFT;
    if (!placed.current || reduce) {
      x.jump(to);
      placed.current = true;
      return;
    }
    animate(x, to, { type: "spring", stiffness: 380, damping: 26, mass: 0.9 });
  }, [dark, mounted, reduce, x]);

  useEffect(() => {
    if (reduce) return;
    const spring = { type: "spring", stiffness: 520, damping: held ? 22 : 30 } as const;
    animate(grow, held ? 1 : 0, spring);
    animate(mag, held ? MAG_HELD : MAG_REST, spring);
  }, [held, reduce, grow, mag]);

  const switchTo = (next: "dark" | "light") => {
    if (next === (dark ? "dark" : "light")) {
      animate(x, dark ? RIGHT : LEFT, { type: "spring", stiffness: 380, damping: 26 });
      return;
    }
    switchTheme(next, setTheme, centreOf(self.current));
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* drag without capture */
    }
    drag.current = { id: e.pointerId, grab: e.clientX - x.get(), start: e.clientX, moved: false, at: x.get() };
    setHeld(true);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.abs(e.clientX - d.start) > 3) d.moved = true;
    let v = e.clientX - d.grab;
    // past either end it gives a few pixels and stops
    if (v < LEFT) v = LEFT - GIVE * Math.tanh((LEFT - v) / (GIVE * 4));
    if (v > RIGHT) v = RIGHT + GIVE * Math.tanh((v - RIGHT) / (GIVE * 4));
    d.at = v;
    x.set(v); // right under the finger
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setHeld(false);
    // a press without a drag is a click: flip it
    if (!d.moved) return switchTo(dark ? "light" : "dark");
    switchTo(d.at > (LEFT + RIGHT) / 2 ? "dark" : "light");
  };

  return (
    <button
      ref={self}
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Dark mode is on. Switch to light" : "Light mode is on. Switch to dark"}
      onClick={() => switchTo(dark ? "light" : "dark")}
      className="glass-surface glass-focus relative shrink-0 rounded-full outline-none"
      style={{ width: TRACK_W, height: TRACK_H }}
    >
      <motion.span className="absolute inset-0" style={{ clipPath: hole, WebkitClipPath: hole }}>
        <Icons bright={false} />
      </motion.span>
      <motion.div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={(e) => e.stopPropagation()}
        data-held={held}
        className="glass-lens absolute left-0 top-0 z-10 cursor-grab touch-none overflow-hidden rounded-full backdrop-blur-[3px] backdrop-saturate-150 active:cursor-grabbing"
        style={{ x: lx, y: ly, width: lw, height: lh }}
      >
        {/* the icons as seen through the glass: bigger, brighter, aligned */}
        <motion.span
          className="pointer-events-none absolute left-0 top-0 z-[2]"
          style={{ x: innerX, y: innerY, scale: mag, transformOrigin: origin, width: TRACK_W, height: TRACK_H }}
        >
          <Icons bright />
        </motion.span>
      </motion.div>
    </button>
  );
}
