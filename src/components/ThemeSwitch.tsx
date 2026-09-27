"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { useTheme } from "next-themes";
import { Refraction, canRefract, lensBackdrop } from "./Refraction";

/* The light/dark switch, as Liquid Glass, after the reference video: a small
   glass track with the sun and the moon in it, and a clear lens, taller than
   the track, sitting over whichever one is on. The lens carries a bright,
   aligned copy of the icon under it, so the icon glows through the glass.
   Click to switch, or hold the lens and drag it across. On the way it narrows
   and grows taller like a drop in motion, overshoots a touch, and the whole
   page fades from one theme to the other as it travels. */

const TRACK_W = 62;
const TRACK_H = 30;
const LENS = 36;
const LEFT = TRACK_H / 2 - LENS / 2; // centred over the sun
const RIGHT = TRACK_W - TRACK_H / 2 - LENS / 2; // centred over the moon

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
  const cls = bright ? "text-[var(--ink)] drop-shadow-[0_0_6px_rgba(255,255,255,0.55)]" : "text-[var(--ink-4)]";
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

  const x = useMotionValue(LEFT);
  const swell = useMotionValue(1);
  const vx = useVelocity(x);
  const squashX = useTransform(vx, [-900, 0, 900], [0.84, 1, 0.84]);
  const squashY = useTransform(vx, [-900, 0, 900], [1.16, 1, 1.16]);
  const innerX = useTransform(x, (v) => -v);
  const drag = useRef<{ id: number; grab: number; start: number; moved: boolean; at: number } | null>(null);
  const placed = useRef(false);
  // the lens bends the track and icons behind its rim (Chromium)
  const lensId = "knob-" + useId().replace(/[^a-z0-9]/gi, "");
  const [refract, setRefract] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRefract(canRefract());
  }, []);

  // follow the theme, wherever it was changed from (this switch, the terminal, the OS)
  useEffect(() => {
    if (!mounted) return;
    const to = dark ? RIGHT : LEFT;
    if (!placed.current || reduce) {
      x.jump(to);
      placed.current = true;
      return;
    }
    animate(x, to, { type: "spring", stiffness: 380, damping: 24, mass: 0.9 });
  }, [dark, mounted, reduce, x]);

  useEffect(() => {
    animate(swell, held && !reduce ? 1.38 : 1, { type: "spring", stiffness: 420, damping: held ? 14 : 22 });
  }, [held, reduce, swell]);

  const switchTo = (next: "dark" | "light") => {
    if (next === (dark ? "dark" : "light")) {
      animate(x, dark ? RIGHT : LEFT, { type: "spring", stiffness: 380, damping: 24 });
      return;
    }
    // fade the page across while the lens travels
    const html = document.documentElement;
    html.classList.add("theme-fade");
    window.setTimeout(() => html.classList.remove("theme-fade"), 520);
    setTheme(next);
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
    // past either end it resists
    if (v < LEFT) v = LEFT - (LEFT - v) * 0.25;
    if (v > RIGHT) v = RIGHT + (v - RIGHT) * 0.25;
    d.at = v;
    animate(x, v, { type: "spring", stiffness: 1300, damping: 60, mass: 0.45 });
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
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Dark mode is on. Switch to light" : "Light mode is on. Switch to dark"}
      onClick={() => switchTo(dark ? "light" : "dark")}
      className="glass-surface glass-focus relative shrink-0 rounded-full outline-none"
      style={{ width: TRACK_W, height: TRACK_H }}
    >
      <Icons bright={false} />
      <Refraction id={lensId} width={LENS} height={LENS} theme={dark ? "dark" : "light"} scale={held ? -16 : -11} tint="bright" />
      <motion.div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={(e) => e.stopPropagation()}
        data-held={held}
        className="glass-lens absolute z-10 cursor-grab touch-none overflow-hidden rounded-full active:cursor-grabbing"
        style={{
          left: 0,
          top: (TRACK_H - LENS) / 2,
          width: LENS,
          height: LENS,
          x,
          scale: swell,
          scaleX: squashX,
          scaleY: squashY,
          backdropFilter: lensBackdrop(lensId, refract),
          WebkitBackdropFilter: lensBackdrop(lensId, false),
        }}
      >
        {/* without refraction, the icons as seen through the glass: brighter,
            and aligned with the ones below (with it, the glass does this itself) */}
        {!refract && (
        <motion.div className="pointer-events-none absolute" style={{ left: 0, top: (LENS - TRACK_H) / 2, x: innerX, width: TRACK_W, height: TRACK_H }}>
          <Icons bright />
        </motion.div>
        )}
      </motion.div>
    </button>
  );
}
