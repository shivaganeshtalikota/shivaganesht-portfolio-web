"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FieldCommand } from "@/lib/field";
import { unlock } from "@/lib/secrets";

/* ─────────────────────────────────────────────────────────────────
   One particle field behind the whole site.

   Every page has its own shape, chosen to mean something: a network on
   the home page, a double helix on About, a sound wave on Speaking. When
   you navigate, each particle travels from where it is to its place in
   the next shape, staggered so it feels organic rather than mechanical.

   It also takes commands (src/lib/field.ts): form a word or an emoji,
   rain like the Matrix, pulse to a beat, or send a shockwave out from
   wherever you clicked. Raw WebGL, hand-written matrices, no three.js.
   ───────────────────────────────────────────────────────────────── */

const FOV = Math.PI / 4.2;
const R = 1.35;
const MORPH_SECONDS = 1.55;

type Shape =
  | "sphere"
  | "helix"
  | "lattice"
  | "spiral"
  | "wave"
  | "torus"
  | "rings"
  | "links"
  | "bloom"
  | "scatter";

const ROUTE_SHAPE: Record<string, Shape> = {
  "/": "sphere",
  "/about": "helix",
  "/projects": "lattice",
  "/experience": "spiral",
  "/speaking": "wave",
  "/speaking-kit": "wave",
  "/awards": "torus",
  "/now": "rings",
  "/contact": "links",
  "/work-with-me": "bloom",
};

// how far each shape reaches from its centre, so the sideways shift on
// inner pages never pushes it off the edge of a narrow window
const REACH: Partial<Record<Shape, number>> = { wave: 2.0, links: 1.6 };

// a fixed lean, so flat shapes are seen from above rather than edge-on
const LEAN: Partial<Record<Shape, number>> = { wave: -0.55, torus: 0.95 };

const CAPTION: Record<Shape, string> = {
  sphere: "the field: a network, agents talking to agents. push it around, or click the background",
  helix: "the field: a double helix, because this page is about me",
  lattice: "the field: a lattice, since systems are built from small boring pieces",
  spiral: "the field: a rising spiral, seven jobs pointing one way",
  wave: "the field: a sound wave. this is the talking part",
  torus: "the field: a ring, the closest thing I own to a medal",
  rings: "the field: rings going outward. this is what is happening now",
  links: "the field: two nodes and the link between them. that's us",
  bloom: "the field: a burst, all the ways we could work together",
  scatter: "the field: scattered, a bit like whatever link got you here",
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

/* ── shapes ────────────────────────────────────────────────────────── */

function buildShape(shape: Shape, n: number): Float32Array {
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
    case "helix": {
      for (let i = 0; i < n; i++) {
        if (i % 8 < 6) {
          const strand = i % 2;
          const t = i / n;
          const a = t * Math.PI * 6 + strand * Math.PI;
          set(i, Math.cos(a) * 0.62, -1.4 + t * 2.8, Math.sin(a) * 0.62);
        } else {
          const k = Math.floor(r() * 34) / 34;
          const a = k * Math.PI * 6;
          const along = r() * 2 - 1;
          set(i, Math.cos(a) * 0.62 * along, -1.4 + k * 2.8, Math.sin(a) * 0.62 * along);
        }
      }
      break;
    }
    case "lattice": {
      const g = Math.ceil(Math.cbrt(n));
      const side = 1.9;
      for (let i = 0; i < n; i++) {
        const gx = i % g;
        const gy = Math.floor(i / g) % g;
        const gz = Math.floor(i / (g * g)) % g;
        const f = (v: number) => (v / (g - 1) - 0.5) * side;
        set(i, f(gx), f(gy), f(gz));
      }
      break;
    }
    case "spiral": {
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const a = t * Math.PI * 7;
        const rad = 0.2 + t * 1.05 + (r() - 0.5) * 0.06;
        set(i, Math.cos(a) * rad, -1.35 + t * 2.7, Math.sin(a) * rad);
      }
      break;
    }
    case "wave": {
      const cols = Math.ceil(Math.sqrt(n * 1.7));
      const rows = Math.ceil(n / cols);
      for (let i = 0; i < n; i++) {
        const cx = i % cols;
        const cz = Math.floor(i / cols);
        const x = (cx / (cols - 1) - 0.5) * 3.8;
        const z = (cz / Math.max(1, rows - 1) - 0.5) * 2.2;
        set(i, x, 0.18 * Math.sin(x * 2.2) * Math.cos(z * 1.6), z);
      }
      break;
    }
    case "torus": {
      for (let i = 0; i < n; i++) {
        const u = r() * Math.PI * 2;
        const v = r() * Math.PI * 2;
        const rr = 1.0 + 0.32 * Math.cos(v);
        set(i, rr * Math.cos(u), 0.32 * Math.sin(v), rr * Math.sin(u));
      }
      break;
    }
    case "rings": {
      const radii = [0.35, 0.72, 1.08, 1.45];
      const total = radii.reduce((a, b) => a + b, 0);
      let i = 0;
      radii.forEach((rad, k) => {
        const count = k === radii.length - 1 ? n - i : Math.round((rad / total) * n);
        for (let j = 0; j < count && i < n; j++, i++) {
          const a = (j / count) * Math.PI * 2;
          set(i, Math.cos(a) * rad, Math.sin(a) * rad, (r() - 0.5) * 0.12 + k * 0.05);
        }
      });
      break;
    }
    case "links": {
      const g = Math.PI * (3 - Math.sqrt(5));
      const each = Math.floor(n * 0.4);
      for (let i = 0; i < n; i++) {
        if (i < each * 2) {
          const k = i % each;
          const side = i < each ? -1 : 1;
          const y = 1 - (k / (each - 1)) * 2;
          const rr = Math.sqrt(Math.max(0, 1 - y * y));
          set(i, side * 1.0 + Math.cos(g * k) * rr * 0.55, y * 0.55, Math.sin(g * k) * rr * 0.55);
        } else {
          const t = r();
          set(i, -0.45 + t * 0.9, Math.sin(t * Math.PI) * 0.18 + (r() - 0.5) * 0.05, (r() - 0.5) * 0.05);
        }
      }
      break;
    }
    case "bloom": {
      const rays = 40;
      const g = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const k = i % rays;
        const y = 1 - (k / (rays - 1)) * 2;
        const rr = Math.sqrt(Math.max(0, 1 - y * y));
        const t = 0.18 + Math.pow(r(), 0.7) * 1.25;
        set(i, Math.cos(g * k) * rr * t, y * t, Math.sin(g * k) * rr * t);
      }
      break;
    }
    case "scatter":
    default: {
      for (let i = 0; i < n; i++) set(i, (r() - 0.5) * 4.2, (r() - 0.5) * 3, (r() - 0.5) * 2.4);
    }
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
    : '"Instrument Serif","Nirmala UI","Noto Sans Telugu","Telugu Sangam MN",Georgia,serif';
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
varying float v_depth;
varying float v_seed;
varying float v_glow;
varying float v_matrix;
varying float v_pulse;

void main(){
  float t = clamp(u_t * 1.35 - a_seed.x * 0.35, 0.0, 1.0);
  float e = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(a_from, a_to, e);

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
  v_glow = glow + u_beat * 0.6;
  v_matrix = u_matrix;
  // computed here, not in the fragment shader: WebGL 1 refuses to link two
  // shaders that declare u_time at different precisions (highp vs mediump)
  v_pulse = 0.5 + 0.5 * sin(u_time * 1.7 + a_seed.y * 62.83);
  gl_PointSize = (1.4 + 3.2 * v_depth + glow * 3.0 + u_beat * 1.6) * u_dpr * u_size;
}
`;

const FRAG_POINT = `
precision mediump float;
uniform vec3 u_ink;
uniform vec3 u_accent;
uniform float u_alpha;
varying float v_depth;
varying float v_seed;
varying float v_glow;
varying float v_matrix;
varying float v_pulse;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float disc = 1.0 - smoothstep(0.22, 0.5, d);
  float isAcc = step(0.88, v_seed);
  float pulse = v_pulse;
  vec3 col = mix(u_ink, u_accent, clamp(isAcc + v_glow, 0.0, 1.0));
  col = mix(col, vec3(0.3, 1.0, 0.45), v_matrix);
  float a = disc * (0.12 + 0.58 * v_depth) * mix(1.0, 0.55 + 0.8 * pulse, isAcc);
  a = min(1.0, a + v_glow * 0.5) * u_alpha;
  gl_FragColor = vec4(col * a, a);
}
`;

const FRAG_LINE = `
precision mediump float;
uniform vec3 u_ink;
uniform float u_alpha;
uniform float u_lineAlpha;
varying float v_depth;
void main(){
  float a = (0.03 + 0.16 * v_depth) * u_alpha * u_lineAlpha;
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
    let wave = routeShape === "wave" ? 1 : 0;
    let pulseStart = -1;
    let pulseX = 0;
    let pulseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseOn = 0;
    let wantMouse = 0;
    let shift = -1; // eased sideways offset; -1 until the first frame sets it
    let fit = -1; // eased scale for shapes wider than the screen; same -1 rule
    let spinAngle = 0;
    let lean = LEAN[routeShape] ?? 0;

    let ink: [number, number, number] = [0.9, 0.9, 0.9];
    let accent: [number, number, number] = [1, 0.36, 0.15];
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      ink = hexToRgb(cs.getPropertyValue("--ink"));
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
        "u_accent", "u_alpha", "u_lineAlpha",
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
      gl.uniform1f(u.u_size, small ? 0.9 : 1);
      gl.uniform2f(u.u_mouse, mouseX, mouseY);
      gl.uniform3f(u.u_pulse, pulseX, pulseY, pulseStart < 0 ? -1 : (performance.now() - pulseStart) / 1000);
      gl.uniform3fv(u.u_ink, ink);
      gl.uniform3fv(u.u_accent, accent);
      gl.uniform1f(u.u_alpha, alpha);
      gl.uniform1f(u.u_lineAlpha, lineAlpha);
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
      wave += ((current === "wave" ? 1 : 0) - wave) * Math.min(1, dt * 2);
      lineAlpha += ((current === "sphere" && t > 0.6 ? 1 : 0) - lineAlpha) * Math.min(1, dt * 2.5);
      if (pulseStart >= 0 && now - pulseStart > 1600) pulseStart = -1;

      const scrollY = window.scrollY;
      const vh = window.innerHeight || 800;
      const home = homeRef.current;
      const scrollFade = 1 - Math.min(1, scrollY / vh) * (home ? 0.5 : 0.42);
      const alpha = scrollFade * (home ? 1 : 0.85) * (small ? 0.82 : 1);

      // shift the shape right on wide inner pages so it doesn't sit behind the
      // text column, but only as far as the window has room for
      const reach = current === "text" ? 0 : (REACH[current] ?? 1.45);
      const wantShift = aspect > 1.15 && !home ? Math.max(0, Math.min(halfW() * 0.42, halfW() - reach * 1.08)) : 0;
      shift = shift < 0 ? wantShift : shift + (wantShift - shift) * Math.min(1, dt * 2.5);
      const offX = shift * (1 - faceOn);
      // on a phone held upright the wide shapes (the wave, the two links) are
      // wider than the screen, so shrink them to fit
      const wantFit = reach ? Math.min(1, (halfW() * 0.94) / reach) : 1;
      fit = fit < 0 ? wantFit : fit + (wantFit - fit) * Math.min(1, dt * 2.5);
      lean += ((current === "text" ? 0 : (LEAN[current] ?? 0)) - lean) * Math.min(1, dt * 2);
      if (current === "links") {
        // two nodes would hide behind each other half the time, so sway around
        // the nearest face-on angle instead of turning all the way round
        const faceOnAngle = Math.round(spinAngle / Math.PI) * Math.PI;
        spinAngle += (faceOnAngle + Math.sin(time * 0.35) * 0.55 - spinAngle) * Math.min(1, dt * 1.5);
      } else {
        spinAngle += dt * 0.11;
      }
      const spin = (1 - faceOn) * (spinAngle + scrollY * 0.00035 + mouseX * 0.25);
      const tilt = (1 - faceOn) * (Math.sin(time * 0.21) * 0.12 + lean - mouseY * 0.12);
      // spin each shape about its own axis, then lean it towards the camera, so
      // a tilted ring keeps reading as a ring instead of turning edge-on
      const model = mul(translate(offX, 0, 0), mul(rotX(tilt), mul(rotY(spin), scale(fit))));
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
