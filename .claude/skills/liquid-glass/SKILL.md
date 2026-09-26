---
name: liquid-glass
description: Build Apple-style Liquid Glass UI on the web (React + motion + Tailwind, or plain CSS): frosted glass bars and pills with edge-lit rims, and a clear, draggable glass lens that shows what's under it, swells when held, squashes as it moves, and springs onto the nearest option. Use for segmented controls, tab bars, topic pickers, light/dark switches, search pills and round glass buttons.
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
4. **What's under the lens is seen once, through it.** The label or icon under
   the lens shows through the glass, tinted and brighter, never doubled.
5. **Liquid motion.** It squashes while it moves, overshoots slightly when it
   lands, swells when you press it (big enough to spill past its track), and
   can be grabbed and dragged.

---

## 2. The material (CSS)

### Tokens

```css
:root {
  --gs-fill: rgba(255, 255, 255, 0.5);
  --gs-edge-hi: rgba(255, 255, 255, 1);
  --gs-edge-lo: rgba(20, 19, 15, 0.07);
  --gs-drop: 0 10px 28px rgba(20, 19, 15, 0.1), 0 2px 6px rgba(20, 19, 15, 0.06);
  --lens-top: rgba(255, 255, 255, 0.62);
  --lens-mid: rgba(255, 255, 255, 0.2);
  --lens-edge: rgba(255, 255, 255, 1);
  --lens-shade: rgba(20, 19, 15, 0.12);
  --lens-drop: 0 10px 24px rgba(20, 19, 15, 0.14), 0 2px 6px rgba(20, 19, 15, 0.08);
}
:root[data-theme="dark"] {
  --gs-fill: rgba(255, 255, 255, 0.045);
  --gs-edge-hi: rgba(255, 255, 255, 0.42);
  --gs-edge-lo: rgba(255, 255, 255, 0.05);
  --gs-drop: 0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3);
  --lens-top: rgba(255, 255, 255, 0.09);
  --lens-mid: rgba(255, 255, 255, 0.015);
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

/* the clear lens that moves */
.glass-lens {
  background: radial-gradient(130% 100% at 50% -10%, var(--lens-top), var(--lens-mid) 58%, var(--lens-mid));
  box-shadow:
    inset 0 -12px 18px -14px var(--lens-shade),      /* darker just inside the bottom rim */
    inset 0 10px 14px -14px rgba(255, 255, 255, 0.45), /* light caught along the top */
    var(--lens-drop);
}
.glass-lens::after {
  background: linear-gradient(150deg, var(--lens-edge), rgba(255, 255, 255, 0.05) 34%, rgba(255, 255, 255, 0.03) 66%, var(--lens-edge));
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

## 3. The lens technique: the word shows once

The naive approach (a translucent pill over the labels) shows the label twice
the moment anything is scaled or offset, and with no blur the original label
is crisp behind a copy. The fix is two parts:

1. **Cut a hole in the labels layer where the lens is**, with a two-layer mask
   and `mask-composite: exclude`. The hole's size and position are motion
   values, so it tracks the lens every frame:

   ```ts
   const holeSize = useTransform([w, h, swell], ([W, H, S]) =>
     `100% 100%, ${W * S - 10}px ${H * S - 8}px`);
   const holePos = useTransform([x, y, w, h, swell], ([X, Y, W, H, S]) =>
     `0 0, ${X + W / 2 - (W * S - 10) / 2}px ${Y + H / 2 - (H * S - 8) / 2}px`);
   // on the labels layer:
   style={{
     maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
     maskRepeat: "no-repeat", maskComposite: "exclude", WebkitMaskComposite: "xor",
     maskSize: holeSize, maskPosition: holePos,
     // and the same four with the Webkit prefix
   }}
   ```

2. **Put a copy of every label inside the lens**, positioned exactly where the
   real ones are, and counter-translate it by the lens position (`x: -lensX`,
   `y: -lensY`), with `overflow: hidden` on the lens. At rest the copy sits
   precisely on the hidden original (test: 0px difference). The copy can be
   tinted (accent colour, brighter icon) to show "this one is on".

Do **not** magnify the copy at rest. Siblings are then visibly different sizes
and it looks broken. Magnification comes for free from scaling the whole lens
when it is held.

---

## 4. Motion

All values are for `motion`'s spring (`{ type: "spring", stiffness, damping, mass }`).

| Moment | What happens | Values that worked |
|---|---|---|
| Move to a new option | position **and size** on one spring, so the lens is the new word's size the moment it lands, with a small overshoot | stiffness 420, damping 30, mass 0.9 |
| In motion | narrows and grows taller (the reference lens becomes a vertical capsule mid-travel) | `scaleX = useTransform(vx, [-2400,0,2400], [0.86,1,0.86])`, `scaleY` 1.14 |
| Pressed / held | swells, big enough to spill past its track, and magnifies what's under it | scale 1.4 on a bar, 1.38 on a switch knob; spring stiffness 420, damping 15 (press) / 22 (release) |
| Dragging | follows the pointer closely with a hint of lag | stiffness 1300, damping 60, mass 0.45 |
| Past the ends | resists (rubber band) | `v < lo ? lo - (lo - v) * 0.25 : …` |
| Let go | springs onto the option **nearest to where the pointer let go** | see pitfalls |
| Theme switch | the page crossfades while the knob travels | add `html.theme-fade` for ~500ms: transition background-color, color, border-color, fill, stroke 0.45s |

Motion values to keep: `x, y, w, h` (lens rect in the container's coordinates),
`swell`, and derived `vx = useVelocity(x)` for the squash.

---

## 5. Layout rules

- Options use **`flex-auto`, never `flex-1`**. `flex-1` gives every option an
  equal share regardless of label length, so long labels ("Something else")
  overflow their slot and get clipped even when the bar has plenty of room.
- **No horizontal scrolling, no edge fades.** On narrow screens let the options
  wrap (`flex-wrap`) onto two rows and move the lens in 2D. The track becomes a
  rounded rectangle (`rounded-[26px]`), the lens stays a pill.
- The track must not clip (`overflow: visible`), or the held lens can't spill out.
- Measure slots with `offsetLeft/offsetTop/offsetWidth/offsetHeight` relative to
  a `position: relative` wrapper that also contains the lens, and re-measure on
  resize (fonts load, rows reflow).

---

## 6. Drop-in component: segmented control

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";

type Option<K extends string> = { key: K; label: string };
type Slot<K extends string> = { key: K; x: number; y: number; w: number; h: number };

export function LiquidSegmented<K extends string>({
  options, value, onChange, label,
}: { options: readonly Option<K>[]; value: K; onChange: (k: K) => void; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [slots, setSlots] = useState<Slot<K>[]>([]);
  const [held, setHeld] = useState(false);

  const x = useMotionValue(0), y = useMotionValue(0), w = useMotionValue(0), h = useMotionValue(0);
  const swell = useMotionValue(1);
  const vx = useVelocity(x);
  const squashX = useTransform(vx, [-2400, 0, 2400], [0.86, 1, 0.86]);
  const squashY = useTransform(vx, [-2400, 0, 2400], [1.14, 1, 1.14]);
  const innerX = useTransform(x, (v) => -v);
  const innerY = useTransform(y, (v) => -v);
  const holeSize = useTransform([w, h, swell], ([W, H, S]: number[]) => `100% 100%, ${Math.max(0, W * S - 10)}px ${Math.max(0, H * S - 8)}px`);
  const holePos = useTransform([x, y, w, h, swell], ([X, Y, W, H, S]: number[]) =>
    `0 0, ${X + W / 2 - (W * S - 10) / 2}px ${Y + H / 2 - (H * S - 8) / 2}px`);

  const valueRef = useRef(value); valueRef.current = value;
  const placed = useRef(false);
  const drag = useRef<{ id: number; gx: number; gy: number; ax: number; ay: number } | null>(null);

  useEffect(() => {
    animate(swell, held && !reduce ? 1.4 : 1, { type: "spring", stiffness: 420, damping: held ? 15 : 22 });
  }, [held, reduce, swell]);

  const measure = useCallback((): Slot<K>[] => {
    const el = wrap.current; if (!el) return [];
    return [...el.querySelectorAll<HTMLElement>("[data-key]")].map((b) => ({
      key: b.dataset.key as K, x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight,
    }));
  }, []);

  const moveTo = useCallback((s: Slot<K>, instant = false) => {
    if (instant || !placed.current || reduce) {
      x.jump(s.x); y.jump(s.y); w.jump(s.w); h.jump(s.h); placed.current = true; return;
    }
    const spring = { type: "spring", stiffness: 420, damping: 30, mass: 0.9 } as const;
    animate(x, s.x, spring); animate(y, s.y, spring); animate(w, s.w, spring); animate(h, s.h, spring);
  }, [x, y, w, h, reduce]);

  const home = useCallback((instant: boolean) => {
    const all = measure(); setSlots(all);
    const s = all.find((t) => t.key === valueRef.current);
    if (s) moveTo(s, instant);
  }, [measure, moveTo]);

  useEffect(() => home(false), [value, home]);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    let first = true; // a new observer reports at once; skip it or the lens snaps
    const ro = new ResizeObserver(() => { if (first) { first = false; return; } home(true); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [home]);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* unknown pointer */ }
    const r = wrap.current!.getBoundingClientRect();
    const cx = x.get() + w.get() / 2, cy = y.get() + h.get() / 2;
    drag.current = { id: e.pointerId, gx: e.clientX - r.left - cx, gy: e.clientY - r.top - cy, ax: cx, ay: cy };
    setHeld(true);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current, el = wrap.current;
    if (!d || d.id !== e.pointerId || !el) return;
    const r = el.getBoundingClientRect();
    const band = (v: number, lo: number, hi: number) => (v < lo ? lo - (lo - v) * 0.25 : v > hi ? hi + (v - hi) * 0.25 : v);
    const cx = band(e.clientX - r.left - d.gx, w.get() / 2, r.width - w.get() / 2);
    const cy = band(e.clientY - r.top - d.gy, h.get() / 2, r.height - h.get() / 2);
    d.ax = cx; d.ay = cy;
    const follow = { type: "spring", stiffness: 1300, damping: 60, mass: 0.45 } as const;
    animate(x, cx - w.get() / 2, follow); animate(y, cy - h.get() / 2, follow);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    drag.current = null; setHeld(false);
    const all = measure(); if (!all.length) return;
    const dist = (s: Slot<K>) => Math.hypot(s.x + s.w / 2 - d.ax, (s.y + s.h / 2 - d.ay) * 1.4);
    const best = all.reduce((a, b) => (dist(b) < dist(a) ? b : a));
    if (best.key !== valueRef.current) onChange(best.key); else moveTo(best);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = ["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.key === value);
    const next = options[(i + step + options.length) % options.length].key;
    onChange(next);
    wrap.current?.querySelector<HTMLElement>(`[data-key="${next}"]`)?.focus();
  };

  const labelCls = "whitespace-nowrap px-3.5 py-2 text-[13.5px]";
  const mask = "linear-gradient(#000 0 0), linear-gradient(#000 0 0)";

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKey}
      className="glass-surface glass-focus rounded-[26px] p-1 backdrop-blur-xl backdrop-saturate-150">
      <div ref={wrap} className="relative">
        <motion.div className="flex flex-wrap gap-y-1" style={{
          maskImage: mask, WebkitMaskImage: mask, maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
          maskComposite: "exclude", WebkitMaskComposite: "xor",
          maskSize: holeSize, WebkitMaskSize: holeSize, maskPosition: holePos, WebkitMaskPosition: holePos,
        }}>
          {options.map((o) => (
            <button key={o.key} data-key={o.key} type="button" role="radio" aria-checked={o.key === value}
              tabIndex={o.key === value ? 0 : -1} onClick={() => onChange(o.key)}
              className={`flex-auto rounded-full opacity-70 outline-none transition-opacity hover:opacity-100 ${labelCls}`}>
              {o.label}
            </button>
          ))}
        </motion.div>
        <motion.div aria-hidden onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className="glass-lens absolute left-0 top-0 z-10 cursor-grab touch-none overflow-hidden rounded-full backdrop-blur-[2px] backdrop-saturate-200 active:cursor-grabbing"
          style={{ x, y, width: w, height: h, scale: swell, scaleX: squashX, scaleY: squashY }}>
          <motion.div className="pointer-events-none absolute left-0 top-0" style={{ x: innerX, y: innerY }}>
            {slots.map((s) => (
              <span key={s.key} className={`absolute flex items-center justify-center font-medium ${labelCls}`}
                style={{ left: s.x, top: s.y, width: s.w, height: s.h }}>
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
a 30px square at either end; a 36px lens (taller than the track, so it sticks
out 3px top and bottom, as in the reference) sits over the active icon and
carries a brighter, aligned copy of both icons (`x: -lensX`).

- Click anywhere toggles; a press without movement on the lens also toggles.
- Drag the lens; on release, pick the end nearer the release point.
- `role="switch"`, `aria-checked`, label that says the current state and the action.
- Follow the theme wherever it changes (OS, another control): animate the lens
  in an effect keyed on the resolved theme. Jump, don't animate, on first mount.
- Crossfade: add `theme-fade` to `<html>` for about 500ms around `setTheme`.

---

## 8. Pitfalls (each one happened)

- **Pale diagonal band across the glass.** A gradient rim painted as a
  `border-box` background layer under a translucent `padding-box` fill shows
  through the whole surface. Draw the rim as a masked `::after` ring instead.
- **Blur missing.** `backdrop-filter` in stylesheet rules can be dropped by the
  CSS toolchain. Use utilities or inline styles and verify with `getComputedStyle`.
- **Doubled text.** A translucent lens over crisp labels plus a scaled copy: cut
  the hole (section 3), keep the copy unscaled at rest.
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

## 9. How to check it (numbers, not screenshots)

Run in the page after it settles:

```js
const lens = document.querySelector('.glass-lens');
const on = document.querySelector('[role=radio][aria-checked=true]');
const a = lens.getBoundingClientRect(), b = on.getBoundingClientRect();
[a.left - b.left, a.width - b.width];            // expect [0, 0]
const t = lens.closest('[role=radiogroup]');
[t.scrollWidth, t.clientWidth];                  // equal: nothing overflows
getComputedStyle(lens).backdropFilter;           // not "none"
[...document.querySelectorAll('[role=radio]')]
  .filter(b => b.scrollWidth > b.clientWidth);   // empty: no clipped labels
```

Then press and hold (dispatch `pointerdown`): the lens should grow about 1.4×
and extend a few pixels past the top and bottom of the bar; drag by `pointermove`
steps and release, and the new option should be selected with the lens at [0, 0]
again. Check both themes, a phone width (two rows), and keyboard arrows.
