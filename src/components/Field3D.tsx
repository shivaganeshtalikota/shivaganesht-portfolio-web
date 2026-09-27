"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FieldCommand } from "@/lib/field";
import { unlock } from "@/lib/secrets";

/* ─────────────────────────────────────────────────────────────────
   One particle field behind the whole site.

   Every page has its own shape, and each one is a thing you can name at a
   glance: a network on the home page, DNA on About, a laptop with code on
   Work, a staircase for Experience, a microphone for Speaking, a trophy for
   Recognition, a clock at the hour I was born for Now, a paper plane for Contact, a rocket for
   Work with me, and one at full burn for the links page. When you navigate, each particle travels from where it is
   to its place in the next shape, staggered so it feels organic.

   It also takes commands (src/lib/field.ts): form a word or an emoji,
   rain like the Matrix, pulse to a beat, or send a shockwave out from
   wherever you clicked. Raw WebGL, hand-written matrices, no three.js.
   ───────────────────────────────────────────────────────────────── */

const FOV = Math.PI / 4.2;
const R = 1.35;
const MORPH_SECONDS = 1.55;

type Shape =
  | "sphere"
  | "dna"
  | "laptop"
  | "stairs"
  | "mic"
  | "trophy"
  | "clock"
  | "plane"
  | "rocket"
  | "mark"
  | "launch"
  | "scatter";

const ROUTE_SHAPE: Record<string, Shape> = {
  "/": "sphere",
  "/about": "dna",
  "/projects": "laptop",
  "/experience": "stairs",
  "/speaking": "mic",
  "/speaking-kit": "mic",
  "/awards": "trophy",
  "/now": "clock",
  "/contact": "plane",
  "/work-with-me": "rocket",
  "/brand": "mark",
  "/links": "launch",
};

// how far each shape reaches from its centre, so the sideways shift on
// inner pages never pushes it off the edge of a narrow window
const REACH: Partial<Record<Shape, number>> = { plane: 1.8, launch: 1.3, rocket: 1.5, stairs: 1.45 };

// a fixed lean towards the camera, so flat things are seen a little from above
const LEAN: Partial<Record<Shape, number>> = { stairs: 0.22, plane: 0.42, laptop: 0.3, mic: 0.15, trophy: 0.12, rocket: 0.08 };

// a fixed sideways tilt: the rocket takes off at an angle, the mic is held
const TILT: Partial<Record<Shape, number>> = { rocket: -0.42, launch: -0.3, mic: 0.22, plane: 0.28 };

// Shapes that only read from the front sway around it instead of spinning
// all the way round: base is the angle they face, amp how far they rock.
const SWAY: Partial<Record<Shape, { base: number; amp: number }>> = {
  clock: { base: 0, amp: 0.4 },
  laptop: { base: 0, amp: 0.5 },
  plane: { base: -0.62, amp: 0.3 },
  stairs: { base: -0.25, amp: 0.3 },
  mark: { base: 0, amp: 0.45 },
};

// Some shapes are built big for detail and drawn a bit smaller
const SIZE: Partial<Record<Shape, number>> = { plane: 0.74, stairs: 0.8, trophy: 0.86, launch: 0.8 };

// how far right a shape sits on wide screens, as a share of the half-width:
// the links page has a centred column, so its rocket goes further out
const SHIFT: Partial<Record<Shape, number>> = { launch: 0.62 };

// How much of each shape is drawn in the accent: the trophy is mostly
// vermilion, everything else keeps the usual sprinkle.
const ACCENT_SHARE: Partial<Record<Shape, number>> = { trophy: 0.72, mark: 0.08 };

// A region of the shape that is always accent: the rocket's flame, the
// mark's full stop. [xmin, ymin, xmax, ymax] in the shape's own space.
const ACCENT_BOX: Partial<Record<Shape, [number, number, number, number]>> = {
  rocket: [-9, -9, 9, -0.62],
  mark: [0.42, -1.45, 1.2, -0.7],
  // the flame, the inner plume and the sparks; the smoke below stays grey
  launch: [-0.62, -1.22, 0.62, -0.02],
};

const CAPTION: Record<Shape, string> = {
  sphere: "background: a network of people and agents. move the mouse through it, or click an empty spot",
  dna: "background: a strand of DNA, because this page is about who I am",
  laptop: "background: a laptop with code on the screen. this page is the work",
  stairs: "background: a staircase, one step for each role, and a flag at the top",
  mic: "background: a microphone. this page is the talking part",
  trophy: "background: a trophy, for the recognition on this page",
  clock: "background: a clock at 2 a.m., the hour I was born. this page is what I'm up to now",
  plane: "background: a paper plane. that's your message, on its way to me",
  rocket: "background: a rocket. let's launch something together",
  mark: "background: the S from the logo, in particles",
  launch: "background: a rocket at full burn. every link here is a way to start something",
  scatter: "background: scattered, a bit like whatever link got you here",
};

/* ── deterministic randomness, so shapes are identical every visit ── */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── building blocks for the shapes ─────────────────────────────────
   A shape is a list of parts, each a way of picking one random point on
   some surface or line, and a weight: how many particles it gets. */

type V3 = [number, number, number];
type Rand = () => number;
type Part = { w: number; at: (r: Rand) => V3 };

const TAU = Math.PI * 2;
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const jit = (r: Rand, s = 0.03) => (r() - 0.5) * s;

// a uniform point inside a triangle
const tri = (a: V3, b: V3, c: V3) => (r: Rand): V3 => {
  let u = r();
  let v = r();
  if (u + v > 1) {
    u = 1 - u;
    v = 1 - v;
  }
  return [
    a[0] + (b[0] - a[0]) * u + (c[0] - a[0]) * v,
    a[1] + (b[1] - a[1]) * u + (c[1] - a[1]) * v,
    a[2] + (b[2] - a[2]) * u + (c[2] - a[2]) * v,
  ];
};

// a point on one of a list of line segments, longer ones getting more
const lines = (segs: [V3, V3][], j = 0.012) => {
  const len = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  const total = len.reduce((s, l) => s + l, 0);
  return (r: Rand): V3 => {
    let x = r() * total;
    let k = 0;
    while (k < segs.length - 1 && x > len[k]) x -= len[k++];
    const p = lerp3(segs[k][0], segs[k][1], r());
    return [p[0] + jit(r, j), p[1] + jit(r, j), p[2] + jit(r, j)];
  };
};

// a point on the surface of an axis-aligned box, faces weighted by area
const box = (hw: number, y0: number, y1: number, hd: number) => (r: Rand): V3 => {
  const h = y1 - y0;
  const areas = [4 * hw * hd, 2 * hw * h, 2 * hw * h, 2 * hd * h, 2 * hd * h];
  let x = r() * areas.reduce((s, a) => s + a, 0);
  let f = 0;
  while (f < areas.length - 1 && x > areas[f]) x -= areas[f++];
  const u = r() * 2 - 1;
  const v = r();
  if (f === 0) return [u * hw, y1, (r() * 2 - 1) * hd];
  if (f === 1) return [u * hw, y0 + v * h, hd];
  if (f === 2) return [u * hw, y0 + v * h, -hd];
  if (f === 3) return [hw, y0 + v * h, u * hd];
  return [-hw, y0 + v * h, u * hd];
};

function compose(parts: Part[], n: number, r: Rand, out: Float32Array, off: V3 = [0, 0, 0]) {
  const total = parts.reduce((s, p) => s + p.w, 0);
  let i = 0;
  parts.forEach((p, k) => {
    const count = k === parts.length - 1 ? n - i : Math.round((p.w / total) * n);
    for (let j = 0; j < count && i < n; j++, i++) {
      const [x, y, z] = p.at(r);
      out[i * 3] = x + off[0];
      out[i * 3 + 1] = y + off[1];
      out[i * 3 + 2] = z + off[2];
    }
  });
}

/* ── the shapes ────────────────────────────────────────────────────── */

// lines of "code" on the laptop screen: [indent, length, row]
const CODE: [number, number, number][] = [
  [0, 5, 0], [1, 7, 1], [2, 4, 2], [2, 9, 3], [1, 3, 4], [1, 6, 5], [2, 8, 6], [3, 5, 7], [1, 2, 8], [0, 2, 9],
];

function buildShape(shape: Shape, n: number): Float32Array {
  const out = buildRaw(shape, n);
  const size = SIZE[shape];
  if (size) for (let i = 0; i < out.length; i++) out[i] *= size;
  return out;
}

function buildRaw(shape: Shape, n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const r = rng(shape.length * 7919 + n);
  const set = (i: number, x: number, y: number, z: number) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  };

  switch (shape) {
    case "sphere": {
      const g = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;
        const rr = Math.sqrt(Math.max(0, 1 - y * y));
        set(i, Math.cos(g * i) * rr * R, y * R, Math.sin(g * i) * rr * R);
      }
      break;
    }

    case "dna": {
      // two strands winding round each other, with the base pairs as rungs
      const H = 1.45;
      const rad = 0.55;
      const ang = (y: number) => (y / H) * Math.PI * 2.2;
      const strand = (s: number): Part => ({
        w: 34,
        at: (r) => {
          const y = (r() * 2 - 1) * H;
          const a = ang(y) + s * Math.PI;
          return [Math.cos(a) * rad + jit(r), y + jit(r), Math.sin(a) * rad + jit(r)];
        },
      });
      const rungs = 22;
      const rung: Part = {
        w: 32,
        at: (r) => {
          const y = -H + ((Math.floor(r() * rungs) + 0.5) * 2 * H) / rungs;
          const a = ang(y);
          const t = r() * 2 - 1;
          return [Math.cos(a) * rad * t, y + jit(r, 0.02), Math.sin(a) * rad * t];
        },
      };
      compose([strand(0), strand(1), rung], n, r, out);
      break;
    }

    case "laptop": {
      // an open laptop: keyboard deck, trackpad, and a screen full of code
      const yb = -0.7;
      const W = 1.2;
      const D = 0.85;
      const Hs = 1.42;
      const th = 0.26; // screen tilted back
      const base = (x: number, z: number): V3 => [x, yb, z - 0.15];
      const scr = (x: number, h: number): V3 => [x, yb + h * Math.cos(th), -h * Math.sin(th) - 0.15];
      const rect = (a: V3, b: V3, c: V3, d: V3): [V3, V3][] => [[a, b], [b, c], [c, d], [d, a]];
      const units = CODE.reduce((s, c) => s + c[1], 0);
      compose(
        [
          { w: 10, at: lines(rect(base(-W, 0), base(W, 0), base(W, D), base(-W, D))) },
          {
            w: 22,
            at: (r) => {
              const row = Math.floor(r() * 4);
              const col = Math.floor(r() * 13);
              return base(-1.02 + col * 0.17 + jit(r, 0.1), 0.1 + row * 0.13 + jit(r, 0.06));
            },
          },
          { w: 5, at: lines(rect(base(-0.3, 0.64), base(0.3, 0.64), base(0.3, 0.8), base(-0.3, 0.8))) },
          { w: 16, at: lines(rect(scr(-W, 0), scr(W, 0), scr(W, Hs), scr(-W, Hs))) },
          {
            w: 47,
            at: (r) => {
              // longer lines get proportionally more particles
              let x = r() * units;
              let k = 0;
              while (k < CODE.length - 1 && x > CODE[k][1]) x -= CODE[k++][1];
              const [indent, len, row] = CODE[k];
              return scr(-1.0 + indent * 0.16 + r() * len * 0.16, 1.26 - row * 0.12 + jit(r, 0.025));
            },
          },
        ],
        n,
        r,
        out
      );
      break;
    }

    case "stairs": {
      // seven steps up, one per role, and a flag on the top one
      const steps = 7;
      const sw = 0.36;
      const rise = 0.27;
      const x0 = -1.36;
      const y0 = -1.25;
      const dz = 0.42;
      const topX = x0 + 6.5 * sw;
      const topY = y0 + steps * rise;
      compose(
        [
          { w: 48, at: (r) => { const i = Math.floor(r() * steps); return [x0 + (i + r()) * sw, y0 + (i + 1) * rise, (r() * 2 - 1) * dz]; } },
          { w: 28, at: (r) => { const i = Math.floor(r() * steps); return [x0 + i * sw, y0 + (i + r()) * rise, (r() * 2 - 1) * dz]; } },
          { w: 12, at: (r) => { const i = Math.floor(r() * steps); return [x0 + (i + r()) * sw, y0 + (i + 1) * rise, r() < 0.5 ? -dz : dz]; } },
          { w: 4, at: lines([[[topX, topY, 0], [topX, topY + 0.62, 0]]]) },
          { w: 8, at: tri([topX, topY + 0.62, 0], [topX, topY + 0.34, 0], [topX + 0.4, topY + 0.48, 0]) },
        ],
        n,
        r,
        out
      );
      break;
    }

    case "mic": {
      // a stage microphone: a mesh head, a collar, a tapering handle, and sound
      const hc = 0.78;
      const hr = 0.44;
      const onHead = (phi: number, a: number): V3 => [
        Math.cos(phi) * Math.cos(a) * hr,
        hc + Math.sin(phi) * hr,
        Math.cos(phi) * Math.sin(a) * hr,
      ];
      compose(
        [
          { w: 26, at: (r) => onHead(-Math.PI / 2 + (Math.floor(r() * 8) + 0.5) * (Math.PI / 8), r() * TAU) },
          { w: 20, at: (r) => onHead(-Math.PI / 2 + r() * Math.PI, Math.floor(r() * 12) * (TAU / 12)) },
          { w: 6, at: (r) => { const a = r() * TAU; return [Math.cos(a) * 0.3, hc - hr * 0.92 + jit(r, 0.06), Math.sin(a) * 0.3]; } },
          {
            w: 34,
            at: (r) => {
              const t = r();
              const a = r() * TAU;
              const rr = 0.27 - t * 0.1;
              return [Math.cos(a) * rr, hc - hr - 0.02 - t * 1.55, Math.sin(a) * rr];
            },
          },
          { w: 4, at: (r) => { const a = r() * TAU; const rr = Math.sqrt(r()) * 0.17; return [Math.cos(a) * rr, hc - hr - 1.57, Math.sin(a) * rr]; } },
          {
            w: 10,
            at: (r) => {
              const rad = 0.66 + Math.floor(r() * 3) * 0.22;
              const a = (r() - 0.5) * 1.1;
              const side = r() < 0.5 ? 1 : -1;
              return [side * Math.cos(a) * rad, hc + Math.sin(a) * rad, 0];
            },
          },
        ],
        n,
        r,
        out
      );
      break;
    }

    case "trophy": {
      // a cup with two handles on a stem, on a two-step base
      const cupTop = 1.1;
      const cupBot = 0;
      const cupR = (y: number) => 0.1 + 0.75 * Math.pow((y - cupBot) / (cupTop - cupBot), 0.55);
      compose(
        [
          { w: 36, at: (r) => { const y = cupBot + r() * (cupTop - cupBot); const a = r() * TAU; const rr = cupR(y); return [Math.cos(a) * rr, y, Math.sin(a) * rr]; } },
          { w: 7, at: (r) => { const a = r() * TAU; return [Math.cos(a) * 0.85, cupTop, Math.sin(a) * 0.85]; } },
          {
            w: 12,
            at: (r) => {
              const side = r() < 0.5 ? 1 : -1;
              const a = -Math.PI / 2 + r() * Math.PI;
              return [side * (0.66 + Math.cos(a) * 0.3), 0.66 + Math.sin(a) * 0.3, jit(r, 0.05)];
            },
          },
          { w: 6, at: (r) => { const a = r() * TAU; return [Math.cos(a) * 0.09, -0.57 + r() * 0.6, Math.sin(a) * 0.09]; } },
          {
            w: 4,
            at: (r) => {
              const u = r() * 2 - 1;
              const a = r() * TAU;
              const s = Math.sqrt(1 - u * u);
              return [s * Math.cos(a) * 0.16, -0.27 + u * 0.12, s * Math.sin(a) * 0.16];
            },
          },
          { w: 12, at: box(0.42, -0.75, -0.57, 0.42) },
          { w: 18, at: box(0.62, -1.1, -0.75, 0.62) },
        ],
        n,
        r,
        out
      );
      break;
    }

    case "clock": {
      // a wall clock stopped at two in the morning: the time I was born
      const hours = 2;
      const mins = 0;
      const ang = (turns: number) => Math.PI / 2 - turns * TAU; // 12 at the top, clockwise
      const R0 = 1.25;
      const hand = (turns: number, len: number, width: number, z: number) => (r: Rand): V3 => {
        const a = ang(turns);
        const t = r() * len;
        const s = jit(r, width);
        return [Math.cos(a) * t - Math.sin(a) * s, Math.sin(a) * t + Math.cos(a) * s, z];
      };
      compose(
        [
          { w: 34, at: (r) => { const a = r() * TAU; const rr = R0 + jit(r, 0.07); return [Math.cos(a) * rr, Math.sin(a) * rr, jit(r, 0.12)]; } },
          {
            w: 12,
            at: (r) => {
              const k = Math.floor(r() * 60);
              const a = ang(k / 60);
              const rr = R0 - 0.08 - r() * (k % 5 === 0 ? 0.2 : 0.06);
              return [Math.cos(a) * rr, Math.sin(a) * rr, 0];
            },
          },
          { w: 16, at: hand(hours / 12, 0.62, 0.06, 0.05) },
          { w: 22, at: hand(mins / 60, 0.98, 0.03, 0.08) },
          { w: 4, at: (r) => { const a = r() * TAU; const rr = Math.sqrt(r()) * 0.07; return [Math.cos(a) * rr, Math.sin(a) * rr, 0.1]; } },
        ],
        n,
        r,
        out
      );
      break;
    }

    case "plane": {
      // a paper plane heading up and to the right, with a dotted trail
      const N: V3 = [1.3, 0.3, 0];
      // the wings rise from the centre fold in a shallow V, like a real one
      const TL: V3 = [-1.0, 0.14, -0.72];
      const TR: V3 = [-1.0, 0.14, 0.72];
      const TC: V3 = [-1.0, -0.08, 0];
      const K: V3 = [-1.0, -0.42, 0];
      const P0: V3 = [-1.15, -0.15, 0];
      const P1: V3 = [-1.7, 0.1, 0];
      const P2: V3 = [-2.0, -0.85, 0.25];
      const trail = (t: number): V3 => {
        const u = 1 - t;
        return [0, 1, 2].map((d) => u * u * P0[d] + 2 * u * t * P1[d] + t * t * P2[d]) as V3;
      };
      compose(
        [
          { w: 15, at: tri(N, TL, TC) },
          { w: 15, at: tri(N, TR, TC) },
          { w: 8, at: tri(N, TC, K) },
          // the edges and the centre fold carry the shape
          { w: 42, at: lines([[N, TL], [N, TR], [TL, TC], [TR, TC], [N, K], [TC, K], [N, TC]], 0.008) },
          {
            w: 14,
            at: (r) => {
              const p = trail((Math.floor(r() * 6) + r() * 0.5) / 6); // six dashes
              return [p[0] + jit(r, 0.02), p[1] + jit(r, 0.02), p[2]];
            },
          },
        ],
        n,
        r,
        out,
        [0.32, 0.25, 0]
      );
      break;
    }

    case "rocket": {
      // body, nose cone, porthole, three fins, and a flame that flickers
      const fin = tri([0.33, -0.15, 0], [0.33, -0.6, 0], [0.74, -0.8, 0]);
      compose(
        [
          { w: 28, at: (r) => { const a = r() * TAU; return [Math.cos(a) * 0.33, -0.55 + r() * 1.1, Math.sin(a) * 0.33]; } },
          { w: 14, at: (r) => { const t = r(); const a = r() * TAU; const rr = 0.33 * Math.sqrt(1 - t * t); return [Math.cos(a) * rr, 0.55 + t * 0.75, Math.sin(a) * rr]; } },
          { w: 5, at: (r) => { const a = r() * TAU; const rr = r() < 0.5 ? 0.12 : 0.08; return [Math.cos(a) * rr, 0.22 + Math.sin(a) * rr, 0.345]; } },
          {
            w: 14,
            at: (r) => {
              const phi = Math.floor(r() * 3) * (TAU / 3) + Math.PI / 2;
              const p = fin(r);
              return [Math.cos(phi) * p[0], p[1], Math.sin(phi) * p[0]];
            },
          },
          { w: 5, at: (r) => { const t = r(); const a = r() * TAU; const rr = 0.2 + t * 0.08; return [Math.cos(a) * rr, -0.55 - t * 0.18, Math.sin(a) * rr]; } },
          {
            w: 26,
            at: (r) => {
              const t = Math.pow(r(), 0.7);
              const a = r() * TAU;
              const rr = (0.24 * (1 - t) + 0.02) * Math.sqrt(r());
              return [Math.cos(a) * rr, -0.78 - t * 0.8, Math.sin(a) * rr];
            },
          },
        ],
        n,
        r,
        out,
        [0, 0.14, 0]
      );
      break;
    }

    case "launch": {
      // a rocket at full burn: slimmer than the Work with me one, with a long
      // flickering flame, sparks thrown off it, exhaust billowing at the base
      // and a few stars around the nose
      const R0 = 0.26;
      const fin = tri([R0, 0.4, 0], [R0, 0.08, 0], [0.56, -0.04, 0]);
      const puffs: [number, number, number, number][] = [
        [-0.95, -1.38, 0.1, 0.26], [-0.55, -1.44, -0.08, 0.32], [-0.18, -1.36, 0.12, 0.3], [0.2, -1.46, -0.1, 0.34],
        [0.58, -1.38, 0.08, 0.3], [0.95, -1.44, -0.06, 0.25], [0, -1.28, 0, 0.24],
      ];
      compose(
        [
          // body, nose, porthole, fins, nozzle
          { w: 15, at: (r) => { const a = r() * TAU; return [Math.cos(a) * R0, 0.08 + r() * 0.9, Math.sin(a) * R0]; } },
          { w: 8, at: (r) => { const t = r(); const a = r() * TAU; const rr = R0 * Math.sqrt(1 - t * t); return [Math.cos(a) * rr, 0.98 + t * 0.5, Math.sin(a) * rr]; } },
          { w: 3, at: (r) => { const a = r() * TAU; const rr = r() < 0.5 ? 0.09 : 0.06; return [Math.cos(a) * rr, 0.66 + Math.sin(a) * rr, R0 + 0.01]; } },
          {
            w: 8,
            at: (r) => {
              const phi = Math.floor(r() * 3) * (TAU / 3) + Math.PI / 2;
              const p = fin(r);
              return [Math.cos(phi) * p[0], p[1], Math.sin(phi) * p[0]];
            },
          },
          { w: 3, at: (r) => { const t = r(); const a = r() * TAU; const rr = 0.15 + t * 0.07; return [Math.cos(a) * rr, 0.08 - t * 0.1, Math.sin(a) * rr]; } },
          // the flame's hot core: long and dense, narrowing to a point
          {
            w: 27,
            at: (r) => {
              const t = Math.pow(r(), 0.8);
              const a = r() * TAU;
              const rr = (0.19 * (1 - t) + 0.015) * Math.sqrt(r());
              return [Math.cos(a) * rr, -0.04 - t * 1.12, Math.sin(a) * rr];
            },
          },
          // the outer plume: wider, flaring and ragged
          {
            w: 19,
            at: (r) => {
              const t = r();
              const a = r() * TAU;
              const rr = (0.14 + 0.3 * Math.sin(t * Math.PI * 0.85)) * (0.75 + r() * 0.35);
              return [Math.cos(a) * rr, -0.06 - t * 1.1, Math.sin(a) * rr * 0.9];
            },
          },
          // sparks and embers thrown off the flame
          {
            w: 9,
            at: (r) => {
              const t = r();
              const side = r() < 0.5 ? -1 : 1;
              return [side * (0.12 + r() * 0.48) * (0.3 + t), -0.15 - t * 1.02, (r() - 0.5) * 0.5];
            },
          },
          // exhaust billowing out at the base
          {
            w: 12,
            at: (r) => {
              const [px, py, pz, pr] = puffs[Math.floor(r() * puffs.length)];
              const u = r() * 2 - 1;
              const a = r() * TAU;
              const k = Math.cbrt(r()) * pr;
              const q = Math.sqrt(1 - u * u);
              return [px + q * Math.cos(a) * k, py + u * k * 0.7, pz + q * Math.sin(a) * k];
            },
          },
          // stars around the nose
          {
            w: 5,
            at: (r) => {
              for (;;) {
                const x = (r() * 2 - 1) * 1.55;
                const y = 0.05 + r() * 1.5;
                if (Math.hypot(x, y - 0.8) > 0.55) return [x, y, (r() - 0.5) * 0.8];
              }
            },
          },
        ],
        n,
        r,
        out,
        [0, 0.02, 0]
      );
      break;
    }

    case "mark":
      return buildMark(n, r);

    case "scatter":
    default: {
      for (let i = 0; i < n; i++) set(i, (r() - 0.5) * 4.2, (r() - 0.5) * 3, (r() - 0.5) * 2.4);
    }
  }
  return out;
}

// the site's serif, by whatever name next/font gave it
function serifFamily() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-instrument-serif").trim();
  return v ? `${v}, Georgia, serif` : '"Instrument Serif", Georgia, serif';
}

/* The logo as a slab of particles: the S traced from the site's serif, and
   the full stop placed exactly where the mark puts it (Mark.tsx). In mark
   units the S spans x 36.7 to 64.2 and y 16 to 76.6; the dot sits at 74.5, 72.5. */
function buildMark(n: number, r: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const W = 300;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = W;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return out;
  ctx.font = `260px ${serifFamily()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", W / 2, W / 2);
  const data = ctx.getImageData(0, 0, W, W).data;
  const pts: number[] = [];
  let x0 = W;
  let x1 = 0;
  let y0 = W;
  let y1 = 0;
  for (let y = 0; y < W; y += 2)
    for (let x = 0; x < W; x += 2)
      if (data[(y * W + x) * 4 + 3] > 120) {
        pts.push(x, y);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
  const k = 2.5 / 60.6; // mark units to world: the S is 2.5 tall
  const toWorld = (u: number, v: number): [number, number] => [(u - 55.5) * k, -(v - 47.5) * k];
  const count = pts.length / 2;
  const dotN = Math.round(n * 0.12);
  for (let i = 0; i < n; i++) {
    let wx: number;
    let wy: number;
    if (i < dotN || !count) {
      const a = r() * TAU;
      const rr = Math.sqrt(r()) * 6.5;
      [wx, wy] = toWorld(74.5 + Math.cos(a) * rr, 72.5 + Math.sin(a) * rr);
    } else {
      const p = Math.floor(r() * count);
      const u = 36.7 + ((pts[p * 2] - x0) / Math.max(1, x1 - x0)) * (64.2 - 36.7);
      const v = 16 + ((pts[p * 2 + 1] - y0) / Math.max(1, y1 - y0)) * (76.6 - 16);
      [wx, wy] = toWorld(u + jit(r, 0.6), v + jit(r, 0.6));
    }
    out[i * 3] = wx;
    out[i * 3 + 1] = wy;
    out[i * 3 + 2] = jit(r, 0.3); // a slab, not a sheet
  }
  return out;
}

/* Rasterise a word or an emoji, then hand every particle a pixel. */
function buildText(text: string, n: number, emoji: boolean, halfW: number): Float32Array {
  const W = 760;
  const H = 280;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const out = new Float32Array(n * 3);
  if (!ctx) return out;

  const family = emoji
    ? '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
    : `${serifFamily().replace(/, Georgia, serif$/, "")},"Nirmala UI","Noto Sans Telugu","Telugu Sangam MN","Noto Sans Devanagari","Kohinoor Devanagari",Georgia,serif`;
  let size = emoji ? 220 : 190;
  ctx.font = `${size}px ${family}`;
  const w = ctx.measureText(text).width;
  if (w > W * 0.9) {
    size = Math.floor(size * ((W * 0.9) / w));
    ctx.font = `${size}px ${family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(text, W / 2, H / 2 + (emoji ? 8 : 12));

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  const step = 3;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 120) pts.push(x, y);
    }
  }
  if (pts.length === 0) return buildShape("scatter", n);

  const count = pts.length / 2;
  const r = rng(text.length * 31 + count);
  const scale = halfW / (W / 2);
  for (let i = 0; i < n; i++) {
    // spread particles evenly over the glyphs, reusing pixels if there are fewer
    const k = Math.floor(((i * 0.61803398875) % 1) * count);
    const px = pts[k * 2] + (r() - 0.5) * step;
    const py = pts[k * 2 + 1] + (r() - 0.5) * step;
    out[i * 3] = (px - W / 2) * scale;
    out[i * 3 + 1] = -(py - H / 2) * scale;
    out[i * 3 + 2] = (r() - 0.5) * 0.12;
  }
  return out;
}

/* Edges between near neighbours on the sphere, drawn with the same
   vertex buffers so they travel with the particles during a morph. */
function sphereEdges(pos: Float32Array, n: number, max: number, thresh: number) {
  const idx: number[] = [];
  const t2 = thresh * thresh;
  outer: for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < Math.min(n, i + 90); j++) {
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < t2) {
        idx.push(i, j);
        if (idx.length / 2 >= max) break outer;
      }
    }
  }
  return new Uint16Array(idx);
}

/* ── matrices (column-major, as WebGL expects) ─────────────────────── */

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function mul(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}
function rotY(t: number) {
  const c = Math.cos(t), s = Math.sin(t);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}
function rotX(t: number) {
  const c = Math.cos(t), s = Math.sin(t);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}
function translate(x: number, y: number, z: number) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}
function rotZ(t: number) {
  const c = Math.cos(t), s = Math.sin(t);
  return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
function scale(k: number) {
  return new Float32Array([k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, 0, 0, 0, 1]);
}

function hexToRgb(v: string): [number, number, number] {
  const s = v.trim().replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  const n = parseInt(f, 16);
  if (Number.isNaN(n)) return [0.5, 0.5, 0.5];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ── shaders ───────────────────────────────────────────────────────── */

const VERT = `
attribute vec3 a_from;
attribute vec3 a_to;
attribute vec3 a_seed;
uniform mat4 u_vp;
uniform mat4 u_model;
uniform float u_t, u_time, u_dpr, u_mouseOn, u_matrix, u_beat, u_wave, u_aspect, u_dist, u_halfW, u_halfH, u_size;
uniform vec2 u_mouse;
uniform vec3 u_pulse;
uniform vec4 u_accentBox;
uniform float u_accentCut, u_flame;
varying float v_depth;
varying float v_seed;
varying float v_glow;
varying float v_matrix;
varying float v_pulse;
varying float v_acc;

void main(){
  float t = clamp(u_t * 1.35 - a_seed.x * 0.35, 0.0, 1.0);
  float e = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(a_from, a_to, e);

  // particles headed for the shape's accent region (the rocket's flame, the
  // logo's full stop) are always accent, and the flame ones flicker
  float inBox = step(u_accentBox.x, a_to.x) * step(a_to.x, u_accentBox.z)
              * step(u_accentBox.y, a_to.y) * step(a_to.y, u_accentBox.w);
  float fl = inBox * u_flame;
  p.xz *= 1.0 + fl * 0.22 * sin(u_time * 11.0 + a_seed.x * 40.0);
  p.y += fl * 0.07 * sin(u_time * 17.0 + a_seed.z * 30.0);

  p += 0.018 * vec3(
    sin(u_time * 0.6 + a_seed.y * 40.0),
    cos(u_time * 0.5 + a_seed.z * 30.0),
    sin(u_time * 0.7 + a_seed.x * 20.0));

  p.y += u_wave * 0.17 * sin(p.x * 2.6 - u_time * 2.2) * cos(p.z * 1.9 + u_time * 1.3);
  p *= 1.0 + u_beat * 0.07;

  vec4 world = u_model * vec4(p, 1.0);

  // matrix rain lives in world space, so it fills the screen whatever the rotation
  float col = floor(a_seed.y * 56.0);
  float cx = (col / 55.0 * 2.0 - 1.0) * u_halfW * 0.96;
  float fall = fract(a_seed.z - u_time * (0.16 + 0.22 * a_seed.x));
  float cy = (1.0 - fall * 2.0) * u_halfH * 1.05;
  world.xyz = mix(world.xyz, vec3(cx, cy, (a_seed.x - 0.5) * 0.4), u_matrix);

  vec4 clip = u_vp * world;
  vec2 ndc = clip.xy / clip.w;
  vec2 asp = vec2(u_aspect, 1.0);

  vec2 dm = (ndc - u_mouse) * asp;
  float dml = length(dm);
  ndc += (dm / max(dml, 0.0001)) / asp * exp(-dml * dml * 20.0) * 0.065 * u_mouseOn;

  float glow = 0.0;
  if (u_pulse.z >= 0.0) {
    vec2 dp = (ndc - u_pulse.xy) * asp;
    float dpl = length(dp);
    float ring = u_pulse.z * 1.9;
    float dr = (dpl - ring) * 7.0;
    float band = exp(-dr * dr) * max(0.0, 1.0 - u_pulse.z / 1.5);
    ndc += (dp / max(dpl, 0.0001)) / asp * band * 0.09;
    glow = band;
  }
  clip.xy = ndc * clip.w;
  gl_Position = clip;

  v_depth = mix(clamp((u_dist + 1.4 - clip.w) / 2.8, 0.0, 1.0), 0.8, u_matrix);
  v_seed = a_seed.y;
  // fire burns: flame particles glow, flickering, which brightens and enlarges them
  float burn = fl * (0.35 + 0.25 * sin(u_time * 13.0 + a_seed.y * 50.0));
  v_glow = glow + u_beat * 0.6 + burn;
  v_matrix = u_matrix;
  // computed here, not in the fragment shader: WebGL 1 refuses to link two
  // shaders that declare u_time at different precisions (highp vs mediump)
  v_pulse = 0.5 + 0.5 * sin(u_time * 1.7 + a_seed.y * 62.83);
  v_acc = max(step(u_accentCut, a_seed.y), inBox * e);
  gl_PointSize = (1.4 + 3.2 * v_depth + glow * 3.0 + u_beat * 1.6 + burn * 2.4) * u_dpr * u_size;
}
`;

const FRAG_POINT = `
precision mediump float;
uniform vec3 u_ink;
uniform vec3 u_accent;
uniform float u_alpha;
uniform float u_textMask;
uniform float u_light;
uniform vec2 u_res;
varying float v_depth;
varying float v_glow;
varying float v_matrix;
varying float v_pulse;
varying float v_acc;

// quieter on the left, where the text column is, so it never fights the words
float textMask() {
  float xn = gl_FragCoord.x / u_res.x;
  return mix(1.0 - 0.6 * u_textMask, 1.0, smoothstep(0.3, 0.64, xn));
}

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float disc = 1.0 - smoothstep(0.22, 0.5, d);
  float isAcc = v_acc;
  float pulse = v_pulse;
  vec3 col = mix(u_ink, u_accent, clamp(isAcc + v_glow, 0.0, 1.0));
  col = mix(col, vec3(0.3, 1.0, 0.45), v_matrix);
  float a = disc * (0.12 + 0.58 * v_depth) * mix(1.0, 0.55 + 0.8 * pulse, isAcc);
  a = min(1.0, a + v_glow * 0.5) * u_alpha;
  a *= textMask() * mix(1.0, 0.85, u_light);
  gl_FragColor = vec4(col * a, a);
}
`;

const FRAG_LINE = `
precision mediump float;
uniform vec3 u_ink;
uniform float u_alpha;
uniform float u_lineAlpha;
uniform float u_textMask;
uniform float u_light;
uniform vec2 u_res;
varying float v_depth;
void main(){
  float xn = gl_FragCoord.x / u_res.x;
  float mask = mix(1.0 - 0.6 * u_textMask, 1.0, smoothstep(0.3, 0.64, xn));
  float a = (0.03 + 0.16 * v_depth) * u_alpha * u_lineAlpha * mask * mix(1.0, 0.65, u_light);
  gl_FragColor = vec4(u_ink * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}
function program(gl: WebGLRenderingContext, vs: WebGLShader, fsSrc: string) {
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!fs) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

/* ── component ─────────────────────────────────────────────────────── */

export function Field3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const routeShape: Shape = ROUTE_SHAPE[pathname] ?? "scatter";
  const setShapeRef = useRef<((s: Shape) => void) | null>(null);
  // draw() lives in a mount-time closure, so it reads the route through a ref
  const homeRef = useRef(pathname === "/");
  const [fallback, setFallback] = useState(false);
  const [caption, setCaption] = useState("");
  const [showCaption, setShowCaption] = useState(false);

  // route → shape, and a caption that explains it for a few seconds
  useEffect(() => {
    homeRef.current = pathname === "/";
  }, [pathname]);

  useEffect(() => {
    setShapeRef.current?.(routeShape);
    // the text stays put while it fades, so it fades out instead of vanishing
    setCaption(CAPTION[routeShape]);
    setShowCaption(true);
    const t = setTimeout(() => setShowCaption(false), 5200);
    return () => clearTimeout(t);
  }, [routeShape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const maybeGl = (canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
    }) || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!maybeGl) {
      setFallback(true);
      return;
    }
    // a non-null binding, so the hoisted draw() below is typed correctly too
    const gl: WebGLRenderingContext = maybeGl;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const pPoint = vs && program(gl, vs, FRAG_POINT);
    const pLine = vs && program(gl, vs, FRAG_LINE);
    if (!vs || !pPoint || !pLine) {
      setFallback(true);
      return;
    }

    const small = window.innerWidth < 768;
    const N = small ? 900 : 1700;

    // per-particle seeds
    const seeds = new Float32Array(N * 3);
    const sr = rng(20260926);
    for (let i = 0; i < seeds.length; i++) seeds[i] = sr();

    const from = new Float32Array(N * 3);
    const to = buildShape(routeShape, N);
    from.set(to);

    const sphere = buildShape("sphere", N);
    const edges = sphereEdges(sphere, N, small ? 700 : 1500, small ? 0.2 : 0.155);

    const mkBuf = (data: Float32Array) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      return b;
    };
    const bFrom = mkBuf(from);
    const bTo = mkBuf(to);
    const bSeed = mkBuf(seeds);
    const bIdx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    /* ── state ─────────────────────────────────────────────────── */
    let t = 1; // morph progress, 0 → 1
    let current: Shape | "text" = routeShape;
    let base: Shape = routeShape;
    let overlayUntil = 0;
    let faceOn = 0;
    let faceTarget = 0;
    let lineAlpha = routeShape === "sphere" ? 1 : 0;
    let matrix = 0;
    let matrixUntil = 0;
    let beat = 0;
    const wave = 0; // the old sound-wave shape is gone; the shader hook stays for text eggs to reuse
    let pulseStart = -1;
    let pulseX = 0;
    let pulseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseOn = 0;
    let wantMouse = 0;
    let shift = -1; // eased sideways offset; -1 until the first frame sets it
    let lift = 0; // eased: inner pages raise the shape beside the page title
    let fit = -1; // eased scale for shapes wider than the screen; same -1 rule
    let spinAngle = SWAY[routeShape]?.base ?? 0;
    let lean = LEAN[routeShape] ?? 0;
    let tiltZ = TILT[routeShape] ?? 0;
    let accentCut = 1 - (ACCENT_SHARE[routeShape] ?? 0.12);
    let accentBox: [number, number, number, number] = ACCENT_BOX[routeShape] ?? [0, 0, -1, -1];
    let flame = routeShape === "rocket" || routeShape === "launch" ? 1 : 0;
    let textMask = 0;
    let light = false;

    let ink: [number, number, number] = [0.9, 0.9, 0.9];
    let accent: [number, number, number] = [1, 0.36, 0.15];
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      const bg = hexToRgb(cs.getPropertyValue("--bg"));
      const rawInk = hexToRgb(cs.getPropertyValue("--ink"));
      light = bg[0] + bg[1] + bg[2] > 1.5;
      // On paper, full-strength ink dots read as grit rather than light, so
      // in light mode the field is drawn in a softer graphite.
      ink = light ? [0, 1, 2].map((k) => rawInk[k] + (bg[k] - rawInk[k]) * 0.35) as [number, number, number] : rawInk;
      accent = hexToRgb(cs.getPropertyValue("--accent"));
    };
    readTheme();

    const tanH = Math.tan(FOV / 2);
    let dpr = 1;
    let aspect = 1;
    let dist = 4.2;
    const halfW = () => tanH * aspect * dist;
    const halfH = () => tanH * dist;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
      const w = window.innerWidth;
      const h = window.innerHeight || document.documentElement.clientHeight || 800;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      aspect = w / h;
      dist = Math.min(Math.max((R * 1.3) / (tanH * Math.min(aspect, 1)), 3.6), 8.5);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // where every particle is right now — mirrors the vertex shader's easing
    const currentPositions = () => {
      const out = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const ti = Math.min(1, Math.max(0, t * 1.35 - seeds[i * 3] * 0.35));
        const e = ti * ti * (3 - 2 * ti);
        for (let k = 0; k < 3; k++) out[i * 3 + k] = from[i * 3 + k] + (to[i * 3 + k] - from[i * 3 + k]) * e;
      }
      return out;
    };

    const morphTo = (target: Float32Array, label: Shape | "text") => {
      const cur = currentPositions();
      from.set(cur);
      to.set(target);
      gl.bindBuffer(gl.ARRAY_BUFFER, bFrom);
      gl.bufferData(gl.ARRAY_BUFFER, from, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, bTo);
      gl.bufferData(gl.ARRAY_BUFFER, to, gl.DYNAMIC_DRAW);
      t = reduce ? 1 : 0;
      current = label;
      faceTarget = label === "text" ? 1 : 0;
      accentBox = label === "text" ? [0, 0, -1, -1] : (ACCENT_BOX[label] ?? [0, 0, -1, -1]);
      if (reduce) draw(performance.now());
    };

    setShapeRef.current = (s: Shape) => {
      base = s;
      if (performance.now() < overlayUntil) return; // let a word finish first
      if (s === current) return;
      morphTo(s === "sphere" ? sphere : buildShape(s, N), s);
    };

    /* ── commands from the rest of the site ────────────────────── */
    const onField = (e: Event) => {
      const cmd = (e as CustomEvent<FieldCommand>).detail;
      const now = performance.now();
      if (cmd.type === "text") {
        const w = Math.min(2.4, halfW() * 0.82);
        morphTo(buildText(cmd.text, N, !!cmd.emoji, w), "text");
        overlayUntil = now + (cmd.hold ?? 4600);
      } else if (cmd.type === "shape") {
        morphTo(buildShape(cmd.shape as Shape, N), cmd.shape as Shape);
        overlayUntil = now + (cmd.hold ?? 4600);
      } else if (cmd.type === "matrix") {
        matrixUntil = now + (cmd.ms ?? 6500);
      } else if (cmd.type === "beat") {
        beat = Math.min(1.4, beat + (cmd.strength ?? 1));
      } else if (cmd.type === "pulse") {
        pulseX = cmd.x ?? 0;
        pulseY = cmd.y ?? 0;
        pulseStart = now;
      }
    };
    window.addEventListener("field", onField);

    /* ── pointer ───────────────────────────────────────────────── */
    const onMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
      wantMouse = 1;
    };
    const onLeave = () => (wantMouse = 0);
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest("a,button,input,textarea,select,label,summary,[role=button],[role=dialog],[role=radio],img,figure,pre")) return;
      if (window.getSelection()?.toString()) return;
      pulseX = (e.clientX / window.innerWidth) * 2 - 1;
      pulseY = -((e.clientY / window.innerHeight) * 2 - 1);
      pulseStart = performance.now();
      unlock("shockwave");
    };
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
    }

    window.addEventListener("resize", resize, { passive: true });
    const themeObs = new MutationObserver(readTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", readTheme);

    /* ── draw ──────────────────────────────────────────────────── */
    const U = (p: WebGLProgram) => {
      const names = [
        "u_vp", "u_model", "u_t", "u_time", "u_dpr", "u_mouseOn", "u_matrix", "u_beat", "u_wave",
        "u_aspect", "u_dist", "u_halfW", "u_halfH", "u_size", "u_mouse", "u_pulse", "u_ink",
        "u_accent", "u_alpha", "u_lineAlpha", "u_accentBox", "u_accentCut", "u_flame", "u_textMask",
        "u_light", "u_res",
      ];
      const u: Record<string, WebGLUniformLocation | null> = {};
      names.forEach((nm) => (u[nm] = gl.getUniformLocation(p, nm)));
      return {
        u,
        from: gl.getAttribLocation(p, "a_from"),
        to: gl.getAttribLocation(p, "a_to"),
        seed: gl.getAttribLocation(p, "a_seed"),
      };
    };
    const LP = U(pPoint);
    const LL = U(pLine);

    const bind = (L: ReturnType<typeof U>) => {
      const attr = (loc: number, buf: WebGLBuffer | null) => {
        if (loc < 0) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
      };
      attr(L.from, bFrom);
      attr(L.to, bTo);
      attr(L.seed, bSeed);
    };

    const t0 = performance.now();
    let last = t0;

    const uniforms = (L: ReturnType<typeof U>, vp: Float32Array, model: Float32Array, time: number, alpha: number) => {
      const u = L.u;
      gl.uniformMatrix4fv(u.u_vp, false, vp);
      gl.uniformMatrix4fv(u.u_model, false, model);
      gl.uniform1f(u.u_t, t);
      gl.uniform1f(u.u_time, time);
      gl.uniform1f(u.u_dpr, dpr);
      gl.uniform1f(u.u_mouseOn, mouseOn);
      gl.uniform1f(u.u_matrix, matrix);
      gl.uniform1f(u.u_beat, beat);
      gl.uniform1f(u.u_wave, wave);
      gl.uniform1f(u.u_aspect, aspect);
      gl.uniform1f(u.u_dist, dist);
      gl.uniform1f(u.u_halfW, halfW());
      gl.uniform1f(u.u_halfH, halfH());
      gl.uniform1f(u.u_size, (small ? 0.9 : 1) * (light ? 0.9 : 1));
      gl.uniform2f(u.u_mouse, mouseX, mouseY);
      gl.uniform3f(u.u_pulse, pulseX, pulseY, pulseStart < 0 ? -1 : (performance.now() - pulseStart) / 1000);
      gl.uniform3fv(u.u_ink, ink);
      gl.uniform3fv(u.u_accent, accent);
      gl.uniform1f(u.u_alpha, alpha);
      gl.uniform1f(u.u_lineAlpha, lineAlpha);
      gl.uniform4f(u.u_accentBox, accentBox[0], accentBox[1], accentBox[2], accentBox[3]);
      gl.uniform1f(u.u_accentCut, accentCut);
      gl.uniform1f(u.u_flame, flame);
      gl.uniform1f(u.u_textMask, textMask);
      gl.uniform1f(u.u_light, light ? 1 : 0);
      gl.uniform2f(u.u_res, canvas.width, canvas.height);
    };

    function draw(now: number) {
      // rAF hands over the frame's start time, which can be earlier than a
      // performance.now() taken by an event that drew in between
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = Math.max(last, now);
      const time = (now - t0) / 1000;

      // an overlay (word, emoji) has finished: go back to this page's shape
      if (overlayUntil && now > overlayUntil) {
        overlayUntil = 0;
        morphTo(base === "sphere" ? sphere : buildShape(base, N), base);
      }

      t = Math.min(1, t + dt / MORPH_SECONDS);
      faceOn += (faceTarget - faceOn) * Math.min(1, dt * 3);
      mouseOn += (wantMouse - mouseOn) * Math.min(1, dt * 4);
      matrix += ((now < matrixUntil ? 1 : 0) - matrix) * Math.min(1, dt * 2.2);
      beat *= Math.exp(-dt * 5);
      lineAlpha += ((current === "sphere" && t > 0.6 ? 1 : 0) - lineAlpha) * Math.min(1, dt * 2.5);
      if (pulseStart >= 0 && now - pulseStart > 1600) pulseStart = -1;

      const scrollY = window.scrollY;
      const vh = window.innerHeight || 800;
      const home = homeRef.current;
      const scrollFade = 1 - Math.min(1, scrollY / vh) * (home ? 0.5 : 0.42);
      // quieter than it was: it's a background, and the words come first
      const alpha = scrollFade * (home ? 0.8 : 0.62) * (small ? 0.78 : 1);
      // on wide screens the text sits on the left, so the field dims there
      textMask += ((aspect > 1.15 ? 1 : 0) * (1 - faceOn) - textMask) * Math.min(1, dt * 2);
      const shape = current === "text" ? null : current;
      accentCut += ((shape ? 1 - (ACCENT_SHARE[shape] ?? 0.12) : 0.88) - accentCut) * Math.min(1, dt * 2);
      flame += ((shape === "rocket" || shape === "launch" ? 1 : 0) - flame) * Math.min(1, dt * 2);

      // shift the shape right on wide inner pages so it doesn't sit behind the
      // text column, but only as far as the window has room for
      const reach = current === "text" ? 0 : (REACH[current] ?? 1.45);
      const wantShift = aspect > 1.15 && !home ? Math.max(0, Math.min(halfW() * (shape ? (SHIFT[shape] ?? 0.42) : 0.42), halfW() - reach * 1.08)) : 0;
      shift = shift < 0 ? wantShift : shift + (wantShift - shift) * Math.min(1, dt * 2.5);
      const offX = shift * (1 - faceOn);
      // On wide inner pages the first card starts halfway down the screen and
      // would hide the bottom of the shape, so it sits a little higher and a
      // little smaller, in the empty space beside the page title.
      const inner = aspect > 1.15 && !home;
      lift += ((inner ? halfH() * 0.2 : 0) - lift) * Math.min(1, dt * 2.5);
      const shrink = 1 - (0.16 * lift) / Math.max(0.001, halfH() * 0.2);
      // on a phone held upright the wide shapes (the wave, the two links) are
      // wider than the screen, so shrink them to fit
      const wantFit = reach ? Math.min(1, (halfW() * 0.94) / reach) : 1;
      fit = fit < 0 ? wantFit : fit + (wantFit - fit) * Math.min(1, dt * 2.5);
      lean += ((shape ? (LEAN[shape] ?? 0) : 0) - lean) * Math.min(1, dt * 2);
      tiltZ += ((shape ? (TILT[shape] ?? 0) : 0) - tiltZ) * Math.min(1, dt * 2);
      const sway = shape ? SWAY[shape] : undefined;
      if (sway) {
        // things that only read from the front rock around it instead of
        // turning all the way round (a clock seen edge-on is just a line)
        const face = Math.round((spinAngle - sway.base) / TAU) * TAU + sway.base;
        spinAngle += (face + Math.sin(time * 0.35) * sway.amp - spinAngle) * Math.min(1, dt * 1.5);
      } else {
        spinAngle += dt * 0.11;
      }
      const spin = (1 - faceOn) * (spinAngle + scrollY * 0.00035 + mouseX * 0.25);
      const tilt = (1 - faceOn) * (Math.sin(time * 0.21) * 0.12 + lean - mouseY * 0.12);
      // spin each shape about its own axis, tip it sideways, then lean it
      // towards the camera, so a tilted shape keeps reading as itself
      const model = mul(
        translate(offX, lift * (1 - faceOn), 0),
        mul(rotX(tilt), mul(rotZ(tiltZ * (1 - faceOn)), mul(rotY(spin), scale(fit * (1 - (1 - shrink) * (1 - faceOn))))))
      );
      const vp = mul(perspective(FOV, aspect, 0.1, 100), translate(0, 0, -dist));

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (lineAlpha > 0.01 && edges.length) {
        gl.useProgram(pLine);
        bind(LL);
        uniforms(LL, vp, model, time, alpha);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx);
        gl.drawElements(gl.LINES, edges.length, gl.UNSIGNED_SHORT, 0);
      }

      gl.useProgram(pPoint);
      bind(LP);
      uniforms(LP, vp, model, time, alpha);
      gl.drawArrays(gl.POINTS, 0, N);
    }

    // Development only: lets the field be rendered and inspected on demand
    // from a background tab, where requestAnimationFrame never fires.
    // process.env.NODE_ENV is inlined at build time, so this is removed
    // from production bundles entirely.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __field?: unknown }).__field = {
        draw,
        canvas,
        snapshot(w = 480) {
          const out = document.createElement("canvas");
          out.width = w;
          out.height = Math.round((w * canvas.height) / canvas.width);
          const ctx = out.getContext("2d");
          if (!ctx) return "";
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg") || "#0c0b0a";
          ctx.fillRect(0, 0, out.width, out.height);
          ctx.drawImage(canvas, 0, 0, out.width, out.height);
          return out.toDataURL("image/jpeg", 0.82);
        },
      };
    }

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      draw(now);
    };
    if (reduce) draw(performance.now());
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      setShapeRef.current = null;
      window.removeEventListener("field", onField);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
      themeObs.disconnect();
      mq.removeEventListener("change", readTheme);
      // No WEBGL_lose_context: React can reuse this canvas across a remount,
      // and a lost context can never be re-acquired on the same element.
      [bFrom, bTo, bSeed].forEach((b) => gl.deleteBuffer(b));
      gl.deleteBuffer(bIdx);
    };
    // the canvas lives for the whole session; route changes go through setShapeRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {fallback ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            backgroundImage: "radial-gradient(var(--ink-4) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            opacity: 0.18,
            maskImage: "radial-gradient(ellipse at 60% 35%, #000 25%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 60% 35%, #000 25%, transparent 70%)",
          }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      )}
      <p
        aria-live="off"
        className="glass mono-sm pointer-events-none fixed bottom-6 left-1/2 z-[40] hidden max-w-[70vw] -translate-x-1/2 truncate rounded-full border border-[var(--glass-rule)] px-3.5 py-1.5 text-center text-[11px] text-[var(--ink-2)] transition-opacity duration-700 md:block"
        style={{ opacity: showCaption ? 1 : 0 }}
      >
        {caption}
      </p>
    </>
  );
}
