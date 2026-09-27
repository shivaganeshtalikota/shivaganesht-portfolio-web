"use client";

import { useEffect, useMemo, useState } from "react";

/* Real glass for a lens, drawn from what's actually behind it. An SVG filter
   used as a backdrop-filter:
   - bends: a displacement map that grows evenly from the centre, so the
     lens magnifies like a real one, and fades out just past the rim, so the
     edges of anything half under it bend;
   - inks: text seen through it changes colour, and gets heavier. A mask is
     made from brightness: anything clearly brighter (on dark) or darker (on
     light) than the page is ink, the page itself is not. The ramp is short,
     so the soft anti-aliased edges of letters count as ink too; that is
     what makes the strokes read bolder without smearing them together. The
     page under the glass keeps its own colour, so the glass stays clear.
   Only Chromium renders SVG filters in backdrop-filter; elsewhere the lens
   falls back to its frosted look (see canRefract). */

function lensMap(w: number, h: number, pad: number) {
  const W = w + pad * 2;
  const H = h + pad * 2;
  const r = Math.min(h, w) / 2;
  // narrow the x range on a wide lens so it magnifies equally in x and y
  const kx = Math.min(1, h / w);
  const lo = Math.round(128 * (1 - kx));
  const hi = Math.round(128 * (1 + kx)) - 1;
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>` +
      `<linearGradient id="x" gradientUnits="userSpaceOnUse" x1="${pad}" y1="0" x2="${pad + w}" y2="0"><stop offset="0" stop-color="rgb(${lo},0,0)"/><stop offset="1" stop-color="rgb(${hi},0,0)"/></linearGradient>` +
      `<linearGradient id="y" gradientUnits="userSpaceOnUse" x1="0" y1="${pad}" x2="0" y2="${pad + h}"><stop offset="0" stop-color="rgb(0,0,0)"/><stop offset="1" stop-color="rgb(0,0,255)"/></linearGradient>` +
      `<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>` +
      `<mask id="m"><rect x="${pad}" y="${pad}" width="${w}" height="${h}" rx="${r}" fill="#fff" filter="url(#s)"/></mask></defs>` +
      `<rect width="${W}" height="${H}" fill="rgb(128,0,128)"/>` +
      `<g mask="url(#m)"><rect width="${W}" height="${H}" fill="url(#x)"/><rect width="${W}" height="${H}" fill="url(#y)" style="mix-blend-mode:screen"/></g>` +
      `</svg>`
  )}`;
}

/* Where the ink applies: the lens' inside, fading out a few px short of the
   rim. Whatever bends in from beyond the edge (the bar's own bright rim,
   say) stays uncoloured, and the tint thins toward the edge like glass. */
function innerMask(w: number, h: number, pad: number, inset: number) {
  const W = w + pad * 2;
  const H = h + pad * 2;
  const iw = Math.max(1, w - inset * 2);
  const ih = Math.max(1, h - inset * 2);
  const r = Math.min(iw, ih) / 2;
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${inset / 2}"/></filter>` +
      `<rect x="${pad + inset}" y="${pad + inset}" width="${iw}" height="${ih}" rx="${r}" fill="#fff" filter="url(#s)"/>` +
      `</svg>`
  )}`;
}

const LUMA = [0.2126, 0.7152, 0.0722];

/* The ink layer: every pixel becomes the target colour, with an alpha that
   ramps with brightness from 0 at `from` to 1 at `to`. Laid over the bent
   backdrop, the page (outside the ramp) shows through untouched and the
   text (past it) takes the colour. `from` sits just clear of the page and
   the glass rim, so neither picks up a tint. */
function inkMatrix(from: number, to: number, target: [number, number, number]) {
  const k = 1 / (to - from);
  return [
    0, 0, 0, 0, target[0],
    0, 0, 0, 0, target[1],
    0, 0, 0, 0, target[2],
    LUMA[0] * k, LUMA[1] * k, LUMA[2] * k, 0, -from * k,
  ].map((v) => +v.toFixed(4)).join(" ");
}

export type GlassTint = "accent" | "bright" | "none";

function matrixFor(theme: "dark" | "light", tint: GlassTint) {
  if (tint === "none") return null;
  if (tint === "accent") {
    // the bar's text (--ink-2) goes to the accent
    return theme === "dark" ? inkMatrix(0.22, 0.5, [1, 0.36, 0.15]) : inkMatrix(0.86, 0.6, [0.79, 0.22, 0]);
  }
  // "bright": a dim icon lights up, the track stays put
  return theme === "dark" ? inkMatrix(0.2, 0.4, [0.97, 0.96, 0.94]) : inkMatrix(0.88, 0.68, [0.1, 0.09, 0.08]);
}

let chromium: boolean | null = null;
/** Whether this browser renders SVG filters in backdrop-filter (Chromium only). */
export function canRefract() {
  if (chromium !== null) return chromium;
  if (typeof navigator === "undefined") return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  chromium = brands
    ? brands.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand))
    : /Chrome\//.test(navigator.userAgent) && !/Firefox\//.test(navigator.userAgent);
  return chromium;
}

type Props = {
  id: string;
  width: number;
  height: number;
  theme: "dark" | "light";
  scale?: number; // how strongly it magnifies (more negative = more)
  bold?: number; // extra stroke weight under the glass, in px (the ink ramp already adds some)
  tint?: GlassTint;
};

export function Refraction({ id, width, height, theme, scale = -12, bold = 0, tint = "accent" }: Props) {
  const [on, setOn] = useState(false);
  // on a 1x screen the bent pixels step visibly; a hair of blur smooths them
  const [smooth, setSmooth] = useState(0);
  useEffect(() => {
    setOn(canRefract());
    setSmooth(window.devicePixelRatio < 1.5 ? 0.45 : 0);
  }, []);
  const pad = 24;
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const href = useMemo(() => lensMap(w, h, pad), [w, h]);
  const inner = useMemo(() => innerMask(w, h, pad, Math.min(5, h / 6)), [w, h]);
  const matrix = matrixFor(theme, tint);
  if (!on) return null;

  const W = w + pad * 2;
  const H = h + pad * 2;
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }}>
      <filter
        id={id}
        x={-pad}
        y={-pad}
        width={W}
        height={H}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feImage href={href} x={-pad} y={-pad} width={W} height={H} preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="B" result={smooth ? "raw" : "bent"} />
        {smooth > 0 && <feGaussianBlur in="raw" stdDeviation={smooth} result="bent" />}
        {bold > 0 && (
          <feMorphology in="bent" operator={theme === "dark" ? "dilate" : "erode"} radius={bold} result="heavy" />
        )}
        {matrix && (
          <>
            <feColorMatrix in={bold > 0 ? "heavy" : "bent"} type="matrix" values={matrix} result="ink" />
            <feImage href={inner} x={-pad} y={-pad} width={W} height={H} preserveAspectRatio="none" result="inner" />
            <feComposite in="ink" in2="inner" operator="in" result="inked" />
            <feComposite in="inked" in2={bold > 0 ? "heavy" : "bent"} operator="over" />
          </>
        )}
      </filter>
    </svg>
  );
}

/** The backdrop-filter value for a lens: the glass where supported, with a
    little extra saturation. Without refraction, a frosted blur. */
export function lensBackdrop(id: string, enabled: boolean) {
  // no blur with refraction: the glass is clear, and blur would soften the words under it
  return enabled ? `url(#${id}) saturate(150%)` : "blur(10px) saturate(180%)";
}
