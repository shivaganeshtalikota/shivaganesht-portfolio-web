---
name: liquid-glass
description: Build Apple-style Liquid Glass UI on the web (React + motion + Tailwind, or plain CSS): frosted glass bars, pills and floating panels with edge-lit rims, and a clear, draggable glass lens that really refracts what's under it (magnifies, bends at the rim, turns the text under it bolder and coloured), swells and warms when held, squashes as it moves, and springs onto the nearest option. Use for segmented controls, tab bars, topic pickers, light/dark switches, menus, command palettes, dialogs, search pills and round glass buttons.
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
4. **What's under the lens is seen once, through it, and changed by it.** The
   label or icon under the lens is the real one, bent by the glass: magnified,
   bending at the rim where it's half under, heavier and coloured. Never a
   second copy laid on top (it reads as "another element"). See section 3.
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

## 3. Real refraction: an SVG filter as the lens' backdrop-filter

This is what makes it *actual* glass rather than a pill with a copy of the word
inside. Chromium accepts `backdrop-filter: url(#filter)`, and the filter's
`SourceGraphic` is then **the live page behind the lens**. So the lens can bend,
thicken and recolour the real text under it, wherever it's dragged, and the
words half under its rim bend with it. (Safari and Firefox ignore SVG filters
in `backdrop-filter`; they get section 3b.)

The filter, in order:

1. **`feImage` displacement map.** A generated SVG data-URL the lens' size plus
   a pad on every side. Red ramps left to right across the lens, blue top to
   bottom, both inside a slightly blurred rounded-rect mask; outside it the map
   is neutral `rgb(128, 0, 128)`, so nothing moves. On a wide lens narrow the red
   ramp (`kx = min(1, h / w)`, from `128·(1−kx)` to `128·(1+kx)−1`) so it
   magnifies equally in x and y. The blur on the mask is what makes text at the
   rim *bend* instead of being cut.
2. **`feDisplacementMap`** with `scale` **negative** (magnifies; positive
   shrinks). About −12 at rest, −18 held (the swell adds more on top), −11/−16
   for a round switch knob. `xChannelSelector="R" yChannelSelector="B"`.
3. **Optional smoothing:** on `devicePixelRatio < 1.5`, `feGaussianBlur` 0.45
   after the displacement. Chrome samples displacement nearest-neighbour, and
   the steps are visible on 1× screens. Skip it at 2×+.
4. **The ink layer (colour + weight):** an `feColorMatrix` that makes every
   pixel the target colour, with **alpha ramped from brightness**:
   `A = (L − from) / (to − from)`, clamped by the filter. Then keep it only
   inside the lens with an **inner mask** (`feImage` of a rounded rect inset
   ~5px and blurred, `feComposite operator="in"`), and lay it **over** the bent
   backdrop (`feComposite operator="over"`).
   - The page's own brightness is outside the ramp, so the glass stays clear
     and neutral. The text is past it, so it takes the colour.
   - A **short** ramp counts the anti-aliased edge pixels of letters as ink,
     so strokes read **bolder** without any morphology.
   - The inner mask keeps whatever bends in from outside (the bar's bright
     rim) from being coloured; the tint thins toward the edge like glass.

```ts
const LUMA = [0.2126, 0.7152, 0.0722];
function inkMatrix(from: number, to: number, [r, g, b]: [number, number, number]) {
  const k = 1 / (to - from); // to < from works too: dark text on a light page
  return [0,0,0,0,r, 0,0,0,0,g, 0,0,0,0,b, LUMA[0]*k, LUMA[1]*k, LUMA[2]*k, 0, -from*k].join(" ");
}
// accent text: dark page inkMatrix(0.22, 0.5, accent), light page inkMatrix(0.86, 0.6, accent)
// icons that light up: dark inkMatrix(0.2, 0.4, nearWhite), light inkMatrix(0.88, 0.68, nearBlack)
```

```tsx
<svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
  <filter id={id} x={-pad} y={-pad} width={W} height={H}
    filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
    <feImage href={lensMap} x={-pad} y={-pad} width={W} height={H} preserveAspectRatio="none" result="map" />
    <feDisplacementMap in="SourceGraphic" in2="map" scale={held ? -18 : -12}
      xChannelSelector="R" yChannelSelector="B" result="raw" />
    <feGaussianBlur in="raw" stdDeviation={dpr < 1.5 ? 0.45 : 0} result="bent" />
    <feColorMatrix in="bent" type="matrix" values={inkMatrix(...)} result="ink" />
    <feImage href={innerMask} x={-pad} y={-pad} width={W} height={H} preserveAspectRatio="none" result="inner" />
    <feComposite in="ink" in2="inner" operator="in" result="inked" />
    <feComposite in="inked" in2="bent" operator="over" />
  </filter>
</svg>
// on the lens:
style={{ backdropFilter: `url(#${id}) saturate(150%)`, WebkitBackdropFilter: "blur(10px) saturate(180%)" }}
```

Rules that matter:

- **Units.** `filterUnits` and `primitiveUnits` = `userSpaceOnUse`, region and
  `feImage` at `(-pad, -pad, w + 2·pad, h + 2·pad)`. Percentages broke the map.
- **No blur with refraction.** Blur softens the very words you're bending.
- **Nothing above the lens may have a backdrop-filter.** An ancestor with one
  becomes a *backdrop root*: the lens then only sees that ancestor's
  half-transparent contents, and the original words ghost through the bent
  ones. Give the bar a fill but no backdrop blur.
- **Re-generate the maps when the lens' size changes** (`useMemo` on rounded
  w, h). The swell and squash are transforms, so the filter scales with them.
- **Detect support** (Chromium brands via `navigator.userAgentData`, else a UA
  test) *after mount*, so server and client render the same markup.

### 3b. Fallback: the word shows once (Safari, Firefox)

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

Render the hole and the copy **only when refraction is off**; with it on, the
labels layer is left whole and the filter does the work.

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
  rounded rectangle (`rounded-[26px]`), the lens stays a pill. Measure the
  label widths and size the padding so it's **two** rows down to 375px (six
  topics: `px-2 text-[13px]` on phones, `sm:px-3.5 sm:text-[13.5px]`, and keep
  the surrounding card's side padding at 20px there).
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
    // no backdrop blur on the bar when the lens refracts (see "backdrop root")
    <div role="radiogroup" aria-label={label} onKeyDown={onKey}
      className="glass-surface glass-focus rounded-[26px] p-1">
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
- **Content vanished for reduced-motion users.** Swapping a `motion.div` for a
  plain `div` (or `initial={reduce ? false : …}`) when motion is reduced makes
  the server HTML (opacity 0) disagree with the client, and it stays hidden.
  Render the same markup always and wrap the app in
  `<MotionConfig reducedMotion="user">`.
- **Text under the lens smeared together.** `feMorphology` dilate/erode with
  radius 0.5 rounds to a whole pixel and fuses letters at 13px. Get weight from
  the short ink ramp instead.
- **The lens turned muddy brown.** A linear colour matrix that maps page
  brightness to itself and text brightness to the accent also stretches every
  small brightness difference in the background into colour. Use the
  alpha-ramped ink layer over the untouched backdrop.
- **Pink letter edges on light.** A ramp that ends at the text's own
  brightness leaves anti-aliased edges half-tinted. End it well before
  (0.6 for 0.35 text).
- **An orange arc at the lens edge.** The bar's bright rim bent into the lens
  and got inked. The inner mask stops it.
- **Ghost text behind the bent text.** A backdrop-filter on an ancestor
  (backdrop root). Remove it.
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
getComputedStyle(lens).backdropFilter;           // not "none"
[...document.querySelectorAll('[role=radio]')]
  .filter(b => b.scrollWidth > b.clientWidth);   // empty: no clipped labels
```

Then press and hold (real mouse events): the lens should grow about 1.4×,
extend past the bar, warm from inside, and the word under it should be larger,
heavier and in the accent. Drag it halfway between two words: both should bend
at its rim. Release, and the new option should be selected with the lens at
[0, 0] again. Check both themes, 1× and 2× pixel density, a phone width (two
rows, drag across rows), and keyboard arrows.
