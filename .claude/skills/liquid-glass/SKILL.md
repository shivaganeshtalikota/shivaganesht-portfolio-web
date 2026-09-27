---
name: liquid-glass
description: Build Apple-style Liquid Glass UI on the web (React + motion + Tailwind, or plain CSS): frosted glass bars, pills and floating panels with edge-lit rims, and a clear, draggable glass lens that magnifies what's under it (sharp, bolder, coloured), swells a few pixels and warms when held, follows the finger exactly, squashes as it moves, and springs onto the nearest option; plus a circular View Transition for switching themes and a lite mode for low-end devices. Use for segmented controls, tab bars, topic pickers, light/dark switches, menus, command palettes, dialogs, search pills and round glass buttons.
---

# Liquid Glass for the web

This skill reproduces the "Liquid Glass" look and feel (Apple, iOS 26 era) in a
browser: glass surfaces that look like curved panes, and a glass **lens** that
moves between options like a drop of liquid. It was built and tuned against
frame-by-frame study of a reference switch video and tested numerically
(positions measured to the pixel), so the recipes below are the ones that
survived, and the pitfalls are the ones that actually bit.

Stack assumed: React 18/19, `motion` (Framer Motion, `motion/react`), Tailwind v4.
Everything also works in plain CSS + any spring library.

---

## 1. What makes it read as glass

Study of the reference shows five properties. Miss any one and it looks like a
grey pill instead of glass.

1. **Translucent, blurred pane.** The surface is mostly see-through: a faint
   fill (about 4–5% white on dark, 50% white on light) over a backdrop blur
   with extra saturation.
2. **Edge-lit rim, not an outline.** A 1px rim that is bright where light hits
   (top-left and bottom-right corners) and fades to almost nothing along the
   sides. A flat white border instantly reads as "plastic".
3. **A clear lens with depth.** The moving element is nearly transparent in the
   middle, a little brighter near the top (where it catches light), shaded just
   inside the bottom rim (a curved lens darkens at its edge), with a soft drop
   shadow.
4. **What's under the lens is seen once, through it, and changed by it.**
   Magnified about the lens' centre, heavier and in the accent, and **sharp**.
   A word half under the rim shows its magnified part inside and its plain
   part outside, with the break at the rim, as with a real lens. See section 3.
5. **Liquid motion.** It squashes while it moves, overshoots slightly when it
   lands, swells **a few pixels** when you press it (not a big scale: a lens
   that balloons past its bar looks broken), and follows the finger exactly
   when dragged.

---

## 2. The material (CSS)

### Tokens

```css
:root {
  --gs-fill: rgba(255, 255, 255, 0.5);
  --gs-edge-hi: rgba(255, 255, 255, 1);
  --gs-edge-lo: rgba(20, 19, 15, 0.07);
  --gs-drop: 0 10px 28px rgba(20, 19, 15, 0.1), 0 2px 6px rgba(20, 19, 15, 0.06);
  --gp-fill: rgba(255, 254, 251, 0.8);          /* floating panels */
  --lens-top: rgba(255, 255, 255, 0.14);        /* clear: the refraction is the point */
  --lens-mid: rgba(255, 255, 255, 0.02);
  --lens-sheen: rgba(255, 255, 255, 0.85);
  --lens-caustic: rgba(255, 255, 255, 0.6);
  --lens-blend: soft-light;
  --lens-edge: rgba(255, 255, 255, 1);
  --lens-shade: rgba(20, 19, 15, 0.12);
  --lens-drop: 0 10px 24px rgba(20, 19, 15, 0.14), 0 2px 6px rgba(20, 19, 15, 0.08);
}
:root[data-theme="dark"] {
  --gs-fill: rgba(255, 255, 255, 0.045);
  --gs-edge-hi: rgba(255, 255, 255, 0.42);
  --gs-edge-lo: rgba(255, 255, 255, 0.05);
  --gs-drop: 0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3);
  --gp-fill: rgba(24, 23, 19, 0.8);
  --lens-top: rgba(255, 255, 255, 0.09);
  --lens-mid: rgba(255, 255, 255, 0.015);
  --lens-sheen: rgba(255, 255, 255, 0.5);
  --lens-caustic: rgba(255, 255, 255, 0.26);
  --lens-blend: screen;
  --lens-edge: rgba(255, 255, 255, 0.6);
  --lens-shade: rgba(0, 0, 0, 0.38);
  --lens-drop: 0 12px 28px rgba(0, 0, 0, 0.42), 0 2px 6px rgba(0, 0, 0, 0.3);
}
```

Mirror the dark block inside `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` if you support the OS setting.

### Surfaces and the lens

```css
/* the pane: bars, pills, round buttons */
.glass-surface {
  position: relative;
  background: var(--gs-fill);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), var(--gs-drop);
}

/* the rim is its own 1px ring, drawn over the edge only */
.glass-surface::after,
.glass-lens::after {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  pointer-events: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.glass-surface::after {
  background: linear-gradient(135deg, var(--gs-edge-hi), var(--gs-edge-lo) 30%, var(--gs-edge-lo) 70%, var(--gs-edge-hi));
}

/* floating panels (menus, palette, dialogs, terminal): the same glass, denser,
   so text on it never fights what's behind. No position of its own, so fixed
   panels stay fixed; static ones add "relative" for the rim. */
.glass-panel {
  background: var(--gp-fill);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), var(--shadow-lg);
}
.glass-panel::after { /* same masked ring as .glass-surface::after */ }
/* on the element: class="glass-panel backdrop-blur-2xl backdrop-saturate-150" */

/* the colour the lens takes on from inside while held; registered so it fades */
@property --lens-warm {
  syntax: "<color>";
  inherits: false;
  initial-value: rgba(0, 0, 0, 0);
}

/* the clear lens that moves */
.glass-lens {
  background:
    radial-gradient(95% 85% at 50% 112%, var(--lens-warm), rgba(0, 0, 0, 0) 72%),
    radial-gradient(130% 100% at 50% -10%, var(--lens-top), var(--lens-mid) 58%, var(--lens-mid));
  transition: --lens-warm 0.35s ease;
  box-shadow:
    inset 0 -12px 18px -14px var(--lens-shade),      /* darker just inside the bottom rim */
    inset 0 10px 14px -14px rgba(255, 255, 255, 0.45), /* light caught along the top */
    var(--lens-drop);
}
.glass-lens::after {
  background: linear-gradient(150deg, var(--lens-edge), rgba(255, 255, 255, 0.05) 34%, rgba(255, 255, 255, 0.03) 66%, var(--lens-edge));
}
/* the lens' own light, BLENDED into what's behind rather than laid on top:
   a sheen on the upper curve and a caustic along the bottom */
.glass-lens::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(120% 80% at 30% -15%, var(--lens-sheen), rgba(255, 255, 255, 0) 58%),
    radial-gradient(90% 60% at 50% 125%, var(--lens-caustic), rgba(255, 255, 255, 0) 70%);
  mix-blend-mode: var(--lens-blend);
  opacity: 0.85;
  transition: opacity 0.35s ease;
}
/* held: brighter light, the accent rising inside, a glow of it outside */
.glass-lens[data-held="true"]::before { opacity: 1; }
.glass-lens[data-held="true"] {
  --lens-warm: var(--accent-wash);
  box-shadow:
    inset 0 -12px 18px -14px var(--lens-shade),
    inset 0 10px 14px -14px rgba(255, 255, 255, 0.45),
    var(--lens-drop),
    0 0 28px var(--accent-wash);
}

/* keyboard focus: ring the whole control, not one word inside it */
.glass-focus:has(:focus-visible) {
  outline: 2px solid color-mix(in srgb, currentColor 25%, transparent);
  outline-offset: 3px;
}
```

### The blur: put it on the element, not in the stylesheet

```html
<div class="glass-surface backdrop-blur-xl backdrop-saturate-150">…</div>
<div class="glass-lens backdrop-blur-[2px] backdrop-saturate-200">…</div>
```

In a Tailwind v4 / Lightning CSS pipeline, `backdrop-filter` written in plain
CSS rules was silently dropped for some rules and kept for others. Tailwind's
`backdrop-*` utilities (or an inline `style={{ backdropFilter: … }}`) always
survive. **Check the computed style** (`getComputedStyle(el).backdropFilter`)
rather than trusting the source.

---

## 3. The lens: real text, magnified, with a pill-shaped hole

Two layers, both real DOM text, so it is sharp at any pixel density, works in
every browser, and costs almost nothing per frame:

1. **The row of words, with a hole where the lens is.** A `clip-path` built
   each frame from the lens rect: a big rectangle plus the lens' pill shape,
   with the `evenodd` rule, so the pill is cut out. (A rectangular
   `mask-size` hole cuts words at the pill's rounded ends; a path doesn't.)

   ```ts
   const hole = useTransform([lx, ly, lw, lh], ([X, Y, W, H]: number[]) =>
     `path(evenodd, "M-400 -400H4000V4000H-400Z${pillPath(X, Y, W, H)}")`);
   // <motion.div style={{ clipPath: hole, WebkitClipPath: hole }}>…words…</motion.div>
   ```

2. **Inside the lens (`overflow: hidden`), the same words**, positioned at
   their real places, counter-translated by the lens position, and scaled
   about the lens' centre. With CSS `transform-origin` at that centre (in the
   words' own coordinates), `translate(-lens) scale(m)` maps each word to
   `centre − lens + m·(p − centre)`: exactly a magnifier.

   ```ts
   const innerX = useTransform(lx, (v) => -v);
   const innerY = useTransform(ly, (v) => -v);
   const origin = useTransform([x, y, w, h], ([X, Y, W, H]: number[]) => `${X + W / 2}px ${Y + H / 2}px`);
   // <motion.div style={{ x: innerX, y: innerY, scale: mag, transformOrigin: origin }}>
   //   words in font-semibold text-[var(--accent)]
   ```

   Magnification 1.05 at rest (the chosen word reads a touch bigger and
   heavier), 1.15 while held; 1.12 / 1.26 for a switch icon. Bold via a real
   weight (a variable font), never via filters.

3. **Swell and squash change the lens' size, not its transform.** Draw the
   lens at `w + 2·grow`, `h + 2·grow` (grow 0 → 5px held on a bar, 2px on a
   switch knob), times a velocity stretch (about 0.93 wide / 1.08 tall at full
   speed), centred on the slot. The hole uses the same numbers, so it always
   matches; the words inside are never distorted.

### 3b. Tried and dropped: an SVG filter as the lens' backdrop-filter

Chromium accepts `backdrop-filter: url(#filter)`, so a displacement map can
bend the live page behind the lens, and a colour matrix can tint and thicken
the text under it. It looked like refraction in screenshots and was rejected
on real screens:

- **Blurry.** `feDisplacementMap` samples nearest-neighbour, so text under it
  steps on 1× screens; smoothing it makes it soft. Thickening with
  `feMorphology` or a short brightness ramp fuses letters at 13px.
- **Squeezed text on wide lenses.** A fixed `scale` magnifies by
  `1/(1 − |scale|/size)` per axis, so a 250×40 lens stretches text 1.4× tall
  and not at all wide. (Uniform magnification needs `scale ∝ the long side`
  and a narrowed ramp on the short one.)
- **Colour artefacts.** A linear colour matrix turns small background
  brightness differences into a brown cast; the bar's bright rim bent in at
  the edge turns into an orange arc.
- **Cost and reach.** The filter re-runs every frame while the lens moves,
  which lags on slow phones, and Safari and Firefox (all of iOS) ignore it.

If it is ever revisited: `userSpaceOnUse` units, no blur on any ancestor
(an ancestor with a backdrop-filter becomes the lens' *backdrop root*, and the
original words ghost through), and an inner mask to keep the tint off the rim.

---

## 4. Motion

All values are for `motion`'s spring (`{ type: "spring", stiffness, damping, mass }`).

| Moment | What happens | Values that worked |
|---|---|---|
| Move to a new option | position **and size** on one spring, so the lens is the new word's size the moment it lands, with a small overshoot | stiffness 420, damping 30, mass 0.9 |
| In motion | narrows and grows taller, in its **size** (see 3.3) | stretch = `min(1, |vx| / 1800)` (700 on a switch); width × (1 − 0.07·s), height × (1 + 0.08·s) |
| Pressed / held | swells a few pixels, magnifies more, warms | grow 0 → 1 (5px a side on a bar, 2px on a knob), mag 1.05 → 1.15; spring stiffness 520, damping 22 (press) / 30 (release) |
| Dragging | **exactly under the finger**, no spring | `x.set(…)` in `pointermove` |
| Past the ends | gives a few pixels and stops | `lo − 4·tanh((lo − v) / 16)` |
| Let go | springs onto the option **nearest to where the pointer let go** | see pitfalls |
| Theme switch | the new theme spreads out in a circle from the switch | View Transition, section 7 |

Motion values to keep: `x, y, w, h` (the slot the lens is on, in the
container's coordinates), `grow`, `mag`, and `vx = useVelocity(x)`; derive the
drawn rect `lx, ly, lw, lh` from them.

---

## 5. Layout rules

- Options use **`flex-auto`, never `flex-1`**. `flex-1` gives every option an
  equal share regardless of label length, so long labels ("Something else")
  overflow their slot and get clipped even when the bar has plenty of room.
- **No horizontal scrolling, no edge fades.** On narrow screens let the options
  wrap (`flex-wrap`) onto two rows and move the lens in 2D. The track becomes a
  rounded rectangle (`rounded-[26px]`), the lens stays a pill. Measure the
  label widths and size the padding so it's **two** rows down to 375px (six
  topics: `px-2 text-[13px]` on phones, `sm:px-3.5 sm:text-[13.5px]`, and keep
  the surrounding card's side padding at 20px there).
- The track must not clip (`overflow: visible`); the held lens reaches a
  pixel or two past it, no more.
- Measure slots with `offsetLeft/offsetTop/offsetWidth/offsetHeight` relative to
  a `position: relative` wrapper that also contains the lens, and re-measure on
  resize (fonts load, rows reflow).

---

## 6. Drop-in component: segmented control

Uses the CSS in section 2. The same component runs the topic picker on the
contact page.

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";

type Option<K extends string> = { key: K; label: string };
type Slot<K extends string> = { key: K; x: number; y: number; w: number; h: number };

// how far the lens swells when held, in px on each side
const GROW_X = 5;
const GROW_Y = 5;
// magnification of what's seen through it
const MAG_REST = 1.05;
const MAG_HELD = 1.15;
// how far past the options it can be dragged before it stops, in px
const GIVE = 4;

function pillPath(x: number, y: number, w: number, h: number) {
  const r = Math.max(0, Math.min(w, h) / 2);
  return (
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}` +
    `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  );
}

export function LiquidSegmented<K extends string>({
  options, value, onChange, label: name,
}: { options: readonly Option<K>[]; value: K; onChange: (k: K) => void; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [slots, setSlots] = useState<Slot<K>[]>([]);
  const [held, setHeld] = useState(false);

  // the option the lens is on: position and size, in the wrapper's coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const w = useMotionValue(0);
  const h = useMotionValue(0);
  const grow = useMotionValue(0); // 0 at rest, 1 held
  const mag = useMotionValue(MAG_REST);

  // in motion it narrows and grows taller, like a drop
  const vx = useVelocity(x);
  const stretch = useTransform(vx, (v) => Math.min(1, Math.abs(v) / 1800));

  // the lens as drawn: the option's box, swollen and stretched about its centre
  const lw = useTransform([w, grow, stretch], ([W, G, S]: number[]) => (W + 2 * GROW_X * G) * (1 - 0.07 * S));
  const lh = useTransform([h, grow, stretch], ([H, G, S]: number[]) => (H + 2 * GROW_Y * G) * (1 + 0.08 * S));
  const lx = useTransform([x, w, lw], ([X, W, LW]: number[]) => X + W / 2 - LW / 2);
  const ly = useTransform([y, h, lh], ([Y, H, LH]: number[]) => Y + H / 2 - LH / 2);

  // the words inside: aligned with the real ones, magnified about the lens' centre
  const innerX = useTransform(lx, (v) => -v);
  const innerY = useTransform(ly, (v) => -v);
  const origin = useTransform([x, y, w, h], ([X, Y, W, H]: number[]) => `${X + W / 2}px ${Y + H / 2}px`);

  // a pill-shaped hole in the row of words, exactly where the lens is
  const hole = useTransform([lx, ly, lw, lh], ([X, Y, W, H]: number[]) =>
    `path(evenodd, "M-400 -400H4000V4000H-400Z${pillPath(X, Y, W, H)}")`
  );

  const valueRef = useRef(value);
  valueRef.current = value;
  const placed = useRef(false);
  const drag = useRef<{ id: number; gx: number; gy: number; ax: number; ay: number } | null>(null);

  useEffect(() => {
    const spring = { type: "spring", stiffness: 520, damping: held ? 22 : 30 } as const;
    if (reduce) {
      grow.jump(0);
      mag.jump(MAG_REST);
      return;
    }
    animate(grow, held ? 1 : 0, spring);
    animate(mag, held ? MAG_HELD : MAG_REST, spring);
  }, [held, reduce, grow, mag]);

  const measure = useCallback((): Slot<K>[] => {
    const el = wrap.current;
    if (!el) return [];
    return [...el.querySelectorAll<HTMLElement>("[data-key]")].map((b) => ({
      key: b.dataset.key as K,
      x: b.offsetLeft,
      y: b.offsetTop,
      w: b.offsetWidth,
      h: b.offsetHeight,
    }));
  }, []);

  const moveTo = useCallback(
    (s: Slot<K>, instant = false) => {
      if (instant || !placed.current || reduce) {
        x.jump(s.x);
        y.jump(s.y);
        w.jump(s.w);
        h.jump(s.h);
        placed.current = true;
        return;
      }
      // one spring for position and size alike, so the lens is the new word's
      // size the moment it arrives, with a small overshoot
      const spring = { type: "spring", stiffness: 420, damping: 30, mass: 0.9 } as const;
      animate(x, s.x, spring);
      animate(y, s.y, spring);
      animate(w, s.w, spring);
      animate(h, s.h, spring);
    },
    [x, y, w, h, reduce]
  );

  const home = useCallback(
    (instant: boolean) => {
      const all = measure();
      setSlots(all);
      const s = all.find((t) => t.key === valueRef.current);
      if (s) moveTo(s, instant);
    },
    [measure, moveTo]
  );

  useEffect(() => home(false), [value, home]);

  // the options reflow as fonts load or the window changes width (one row or
  // two), so follow them; one observer for good, since a new one reports at
  // once and would snap the lens mid-glide
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      home(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [home]);

  /* ── holding and dragging, by mouse or finger ── */
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a pointer the browser doesn't know: drag without capture */
    }
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    const cx = x.get() + w.get() / 2;
    const cy = y.get() + h.get() / 2;
    drag.current = { id: e.pointerId, gx: e.clientX - r.left - cx, gy: e.clientY - r.top - cy, ax: cx, ay: cy };
    setHeld(true);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = wrap.current;
    if (!d || d.id !== e.pointerId || !el) return;
    const r = el.getBoundingClientRect();
    // past the options it gives a few pixels and stops, like glass against its frame
    const stop = (v: number, lo: number, hi: number) =>
      v < lo ? lo - GIVE * Math.tanh((lo - v) / (GIVE * 4)) : v > hi ? hi + GIVE * Math.tanh((v - hi) / (GIVE * 4)) : v;
    const cx = stop(e.clientX - r.left - d.gx, w.get() / 2, r.width - w.get() / 2);
    const cy = stop(e.clientY - r.top - d.gy, h.get() / 2, r.height - h.get() / 2);
    d.ax = cx;
    d.ay = cy;
    // right under the finger, no lag
    x.set(cx - w.get() / 2);
    y.set(cy - h.get() / 2);
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setHeld(false);
    // settle on the option nearest to where it was let go
    const all = measure();
    if (!all.length) return;
    const dist = (s: Slot<K>) => Math.hypot(s.x + s.w / 2 - d.ax, (s.y + s.h / 2 - d.ay) * 1.4);
    const best = all.reduce((a, b) => (dist(b) < dist(a) ? b : a));
    if (best.key !== valueRef.current) onChange(best.key);
    else moveTo(best);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = options.findIndex((t) => t.key === value);
    const n = options.length;
    const next = options[(i + step + n) % n].key;
    onChange(next);
    wrap.current?.querySelector<HTMLElement>(`[data-key="${next}"]`)?.focus();
  };

  // tighter on phones, so the six topics sit in two rows down to 375px
  const label = "whitespace-nowrap px-2 py-2 text-[13px] sm:px-3.5 sm:text-[13.5px]";

  return (
    <div
      role="radiogroup"
      aria-label={name}
      onKeyDown={onKey}
      className="glass-surface glass-focus rounded-[26px] p-1"
    >
      <div ref={wrap} className="relative">
        {/* the words, with a hole where the lens is */}
        <motion.div className="flex flex-wrap gap-y-1" style={{ clipPath: hole, WebkitClipPath: hole }}>
          {options.map((t) => {
            const on = t.key === value;
            return (
              <button
                key={t.key}
                data-key={t.key}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => onChange(t.key)}
                className={`flex-auto rounded-full text-[var(--ink-2)] outline-none transition-colors duration-300 hover:text-[var(--ink)] ${label}`}
              >
                {t.label}
              </button>
            );
          })}
        </motion.div>

        {/* the lens */}
        <motion.div
          aria-hidden
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          data-held={held}
          className="glass-lens absolute backdrop-blur-[3px] backdrop-saturate-150 left-0 top-0 z-10 cursor-grab touch-none overflow-hidden rounded-full active:cursor-grabbing"
          style={{ x: lx, y: ly, width: lw, height: lh }}
        >
          {/* the same words, as seen through the glass */}
          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-[2]"
            style={{ x: innerX, y: innerY, scale: mag, transformOrigin: origin }}
          >
            {slots.map((s) => (
              <span
                key={s.key}
                className={`absolute flex items-center justify-center font-semibold text-[var(--accent)] ${label}`}
                style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
              >
                {options.find((o) => o.key === s.key)?.label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
```

## 7. Drop-in component: light/dark switch

Same ingredients on one axis. Track 62×30 with a sun and a moon each centred in
a 30px square at either end; a 34px lens (2px taller than the track each side,
as in the reference; 36px held) sits over the active icon. The track's icons
get a round `clip-path` hole where the lens is, and the lens carries both icons
bright, aligned and magnified about its centre (1.12, 1.26 held).

- Click anywhere toggles; a press without movement on the lens also toggles.
- Drag the lens; on release, pick the end nearer the release point.
- `role="switch"`, `aria-checked`, label that says the current state and the action.
- Follow the theme wherever it changes (OS, another control): animate the lens
  in an effect keyed on the resolved theme. Jump, don't animate, on first mount.
- **Switch themes with a View Transition, not colour transitions.** Fading
  every element's colours at once (`html.theme-fade * { transition: … }`) lags
  on slow phones. Instead the browser snapshots the page once and animates one
  layer: a circle growing from the switch.

  ```ts
  const vt = document.startViewTransition(() => {
    root.setAttribute("data-theme", next);   // the new snapshot must already
    root.style.colorScheme = next;           // show the new theme
    flushSync(() => setTheme(next));
  });
  vt.ready.then(() => root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
    { duration: 620, easing: "cubic-bezier(0.32, 0, 0.18, 1)", pseudoElement: "::view-transition-new(root)" }));
  ```
  ```css
  html.theme-vt::view-transition-old(root),
  html.theme-vt::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
  ```
  `r` = distance from (x, y) to the farthest corner. Without
  `startViewTransition`, or with reduced motion, switch at once. Route every
  theme toggle (palette, terminal, typed commands) through the same function.

## 7b. A logo or app icon made of glass (SVG)

To turn a flat mark into a glass app icon, stack these layers in one SVG
(100×100 viewBox, `rx="22.5"` plate). The letter is a path, so trace it from
the font first (fontTools + HarfBuzz) and no font is needed to view it.

1. **Plate**: a diagonal three-stop gradient (`#2a2925 → #131210 → #070706` dark,
   `#fbfaf7 → #ebe8e1 → #d9d5cc` light), then a radial "ambient" light from the
   top left (`cx 0.28 cy 0.16`, white 11% fading out by 65%).
2. **Sheen**: a vertical gradient from 7% white to nothing by half height, over
   the whole plate. Never a shape with an edge: that reads as a line.
3. **Shadow**: the letter, black, offset 2.4 down, Gaussian blur 1.4, 60% opacity
   (35% of a warm grey on light), so the glass sits above the plate.
4. **Glass letter**: the letter filled with a vertical translucent white gradient
   (36% → 10% → 20% on dark).
5. **Light caught inside**: clipped to the letter, a blurred white ellipse near
   the top and a blurred 2.6-wide white stroke of the letter's own outline (an
   inner glow along its edge).
6. **Rim**: the letter stroked 0.6 wide with a diagonal gradient, bright top left,
   faint middle, bright-ish bottom right.
7. **A glossy bead** (for a dot or accent): a soft coloured glow under it (blur
   2.6, 32%), a radial gradient from a pale highlight at (0.36, 0.3) through the
   colour to a dark edge, a small blurred white specular ellipse up and left,
   and a hairline white ring.
8. **Plate rim**: the plate outline stroked 0.7 wide with the same edge-lit
   diagonal gradient as `.glass-surface`.

librsvg (and so `sharp`) renders all of it, so PNG and JPG versions can be
generated from the same file. For a version without the plate, trim the
viewBox with room for the glow (at least 2.6× the bead's radius past it), or the
glow gets cut off in a square.

---

## 8. Pitfalls (each one happened)

- **Pale diagonal band across the glass.** A gradient rim painted as a
  `border-box` background layer under a translucent `padding-box` fill shows
  through the whole surface. Draw the rim as a masked `::after` ring instead.
- **Blur missing.** `backdrop-filter` in stylesheet rules can be dropped by the
  CSS toolchain. Use utilities or inline styles and verify with `getComputedStyle`.
- **Doubled text.** A translucent lens over crisp labels plus a scaled copy:
  cut the pill-shaped hole (section 3).
- **Clipped last label.** `flex-1` on options. Use `flex-auto`.
- **Lens snaps instead of gliding.** A `ResizeObserver` re-created on every
  change fires immediately. Create it once and skip its first callback.
- **Wrong option after a drag.** Choosing by the animated lens position picks
  the option it's still lagging over. Store the pointer's aim and choose by that.
- **Drag doesn't start in tests.** `setPointerCapture` throws for synthetic
  pointers; wrap it in try/catch so the drag still works.
- **Page scrolls instead of dragging on phones.** Put `touch-action: none` on the
  lens (Tailwind `touch-none`), not on the whole bar.
- **Fade masks at the edges and sideways scrolling.** They read as broken, not
  as glass. Wrap onto rows instead.
- **Glint "line".** A radial highlight that ends in a visible band reads as a
  scratch across the glass. Keep highlights as soft inset shadows.
- **Focus ring on one word.** Hide the per-option outline; ring the whole
  control with `:has(:focus-visible)`.
- **Reduced motion.** Jump instead of spring, and don't swell.
- **Content vanished for reduced-motion users.** Swapping a `motion.div` for a
  plain `div` (or `initial={reduce ? false : …}`) when motion is reduced makes
  the server HTML (opacity 0) disagree with the client, and it stays hidden.
  Render the same markup always and wrap the app in
  `<MotionConfig reducedMotion="user">`.
- **Blurry, squeezed or smeared text under the lens.** The SVG-filter
  approach (3b). Draw real text instead.
- **The lens balloons out of its bar.** A scale swell (1.4) on a wide lens is
  huge. Grow by pixels.
- **The lens lags behind the finger.** A follow spring while dragging. Set the
  position directly.
- **Orange ring around a text box.** A global `:focus-visible { outline }` rule
  outside any `@layer` beats Tailwind's `outline-none` (utilities are layered,
  and unlayered CSS wins regardless of specificity). Put the global ring in
  `@layer base`.
- **`backdrop-filter: none` did nothing.** With both `backdrop-filter` and
  `-webkit-backdrop-filter` in one rule, the dev CSS pipeline kept only the
  prefixed one, which Chrome ignores. Put them in two rules with different
  selectors (`html.lite …` and `:root.lite …`).
- **Laggy on slow phones.** Live backdrop blur over an animated background is
  redrawn every frame. Flag low-end devices before first paint
  (`deviceMemory <= 4`, `hardwareConcurrency <= 2` or Save-Data → `html.lite`)
  and there drop the blur (denser fills instead) and draw fewer particles.
- **Screenshots lie.** Headless captures often run before events or reveals
  fire. Drive a real browser over the DevTools protocol and send real mouse
  events (`Input.dispatchMouseEvent`) to press, drag and hold the lens.

## 9. How to check it (numbers, not screenshots)

Run in the page after it settles:

```js
const lens = document.querySelector('.glass-lens');
const on = document.querySelector('[role=radio][aria-checked=true]');
const a = lens.getBoundingClientRect(), b = on.getBoundingClientRect();
[a.left - b.left, a.width - b.width];            // expect [0, 0]
const t = lens.closest('[role=radiogroup]');
[t.scrollWidth, t.clientWidth];                  // equal: nothing overflows
getComputedStyle(lens).backdropFilter;           // a light blur ("none" in lite mode)
[...document.querySelectorAll('[role=radio]')]
  .filter(b => b.scrollWidth > b.clientWidth);   // empty: no clipped labels
```

Then press and hold (real mouse events): the lens should grow a few pixels,
stay within about 2px of the bar, warm from inside, and the word under it
should be larger, semibold, accent and sharp. Drag it halfway between two
words: the part of each inside the lens is magnified, the rest plain. Release, and the new option should be selected with the lens at
[0, 0] again. Check both themes, 1× and 2× pixel density, a phone width (two
rows, drag across rows), and keyboard arrows.
