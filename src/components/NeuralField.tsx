"use client";

import { useEffect, useRef, useState } from "react";

/* A real 3D node network — perspective-projected points and edges on a
   sphere, rotating, with cursor/touch parallax. Raw WebGL, no three.js.
   It's meant to read as an agent graph, not as decoration.

   The camera distance adapts to the canvas aspect, because a portrait
   phone viewport otherwise frames only a narrow sliver of the sphere.
   Falls back to a static CSS field if WebGL is unavailable, and is
   skipped entirely under prefers-reduced-motion. */

const FOV = Math.PI / 4.2;
const R = 1.32;

const VERT = `
attribute vec3 a_pos;
attribute float a_seed;
uniform mat4 u_mvp;
uniform float u_dpr;
uniform float u_time;
uniform float u_dist;
uniform float u_r;
varying float v_depth;
varying float v_seed;
void main(){
  vec3 p = a_pos;
  p += 0.035 * vec3(
    sin(u_time * 0.6 + a_seed * 12.9),
    cos(u_time * 0.5 + a_seed * 7.3),
    sin(u_time * 0.7 + a_seed * 3.1)
  );
  vec4 clip = u_mvp * vec4(p, 1.0);
  gl_Position = clip;
  // 1 at the nearest point of the sphere, 0 at the farthest
  v_depth = clamp((u_dist + u_r - clip.w) / (2.0 * u_r), 0.0, 1.0);
  v_seed = a_seed;
  gl_PointSize = (1.7 + 3.8 * v_depth) * u_dpr;
}
`;

const FRAG_POINT = `
precision highp float;
uniform vec3 u_ink;
uniform vec3 u_accent;
uniform float u_time;
varying float v_depth;
varying float v_seed;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float disc = 1.0 - smoothstep(0.26, 0.5, d);
  float isAccent = step(0.87, v_seed);
  float pulse = 0.5 + 0.5 * sin(u_time * 1.7 + v_seed * 62.83);
  vec3 col = mix(u_ink, u_accent, isAccent);
  float a = disc * (0.13 + 0.62 * v_depth) * mix(1.0, 0.5 + 0.9 * pulse, isAccent);
  gl_FragColor = vec4(col * a, a);
}
`;

const FRAG_LINE = `
precision highp float;
uniform vec3 u_ink;
varying float v_depth;
varying float v_seed;
void main(){
  float a = 0.035 + 0.17 * v_depth;
  gl_FragColor = vec4(u_ink * a, a);
}
`;

/* ── matrices ────────────────────────────────────────────────── */

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function multiply(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      o[i * 4 + j] =
        a[i * 4] * b[j] +
        a[i * 4 + 1] * b[4 + j] +
        a[i * 4 + 2] * b[8 + j] +
        a[i * 4 + 3] * b[12 + j];
    }
  }
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

function hexToRgb(v: string): [number, number, number] {
  const s = v.trim().replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  const n = parseInt(f, 16);
  if (Number.isNaN(n)) return [0.1, 0.1, 0.1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

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

function linkProg(gl: WebGLRenderingContext, vs: WebGLShader, fsSrc: string) {
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!fs) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  return p;
}

export function NeuralField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Keep the context request plain — exotic flags are the usual reason
    // mobile Safari silently hands back null.
    const gl = (canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
    }) || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) {
      setFallback(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    if (!vs) {
      setFallback(true);
      return;
    }
    const progPoint = linkProg(gl, vs, FRAG_POINT);
    const progLine = linkProg(gl, vs, FRAG_LINE);
    if (!progPoint || !progLine) {
      setFallback(true);
      return;
    }

    /* ── graph ───────────────────────────────────────────────── */
    const small = window.innerWidth < 768;
    const N = small ? 210 : 340;

    const pts: number[] = [];
    const seeds: number[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      pts.push(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
      seeds.push(((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1);
    }

    const maxEdges = small ? 420 : 680;
    const thresh = small ? 0.46 : 0.40;
    const lineVerts: number[] = [];
    const lineSeeds: number[] = [];
    outer: for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i * 3] - pts[j * 3];
        const dy = pts[i * 3 + 1] - pts[j * 3 + 1];
        const dz = pts[i * 3 + 2] - pts[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < thresh * thresh) {
          lineVerts.push(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]);
          lineVerts.push(pts[j * 3], pts[j * 3 + 1], pts[j * 3 + 2]);
          lineSeeds.push(seeds[i], seeds[j]);
          if (lineVerts.length / 6 >= maxEdges) break outer;
        }
      }
    }

    const mk = (data: number[], size: number) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      return { buf: b, count: data.length / size };
    };

    const pBuf = mk(pts, 3);
    const pSeed = mk(seeds, 1);
    const lBuf = mk(lineVerts, 3);
    const lSeed = mk(lineSeeds, 1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let ink: [number, number, number] = [0.95, 0.94, 0.93];
    let accent: [number, number, number] = [1, 0.36, 0.15];
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      ink = hexToRgb(cs.getPropertyValue("--ink"));
      accent = hexToRgb(cs.getPropertyValue("--accent"));
    };
    readTheme();

    const tanHalf = Math.tan(FOV / 2);
    let dpr = 1;
    let aspect = 1;
    let dist = 3.4;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      aspect = canvas.width / Math.max(1, canvas.height);
      // Pull the camera back far enough that the sphere is actually framed.
      // On a tall phone viewport this is what stops it filling off-screen.
      const need = (R * 1.25) / (tanHalf * Math.min(aspect, 1));
      dist = Math.min(Math.max(need, 3.2), 8);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    let tiltX = 0, tiltY = 0, wantX = 0, wantY = 0;
    const track = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      wantY = ((cx - r.left) / r.width - 0.5) * 0.9;
      wantX = ((cy - r.top) / r.height - 0.5) * 0.5;
    };
    const onMove = (e: PointerEvent) => track(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) track(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObs = new MutationObserver(readTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", readTheme);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    const U = (prog: WebGLProgram) => ({
      mvp: gl.getUniformLocation(prog, "u_mvp"),
      dpr: gl.getUniformLocation(prog, "u_dpr"),
      time: gl.getUniformLocation(prog, "u_time"),
      dist: gl.getUniformLocation(prog, "u_dist"),
      r: gl.getUniformLocation(prog, "u_r"),
      ink: gl.getUniformLocation(prog, "u_ink"),
      accent: gl.getUniformLocation(prog, "u_accent"),
      aPos: gl.getAttribLocation(prog, "a_pos"),
      aSeed: gl.getAttribLocation(prog, "a_seed"),
    });
    const uPoint = U(progPoint);
    const uLine = U(progLine);

    const draw = (
      prog: WebGLProgram,
      u: ReturnType<typeof U>,
      posB: { buf: WebGLBuffer | null; count: number },
      seedB: { buf: WebGLBuffer | null; count: number },
      mode: number,
      mvp: Float32Array,
      time: number
    ) => {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, posB.buf);
      gl.enableVertexAttribArray(u.aPos);
      gl.vertexAttribPointer(u.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, seedB.buf);
      gl.enableVertexAttribArray(u.aSeed);
      gl.vertexAttribPointer(u.aSeed, 1, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(u.mvp, false, mvp);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.dist, dist);
      gl.uniform1f(u.r, R);
      gl.uniform3fv(u.ink, ink);
      if (u.accent) gl.uniform3fv(u.accent, accent);
      gl.drawArrays(mode, 0, posB.count);
    };

    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;

      const time = (t - t0) / 1000;
      tiltX += (wantX - tiltX) * 0.05;
      tiltY += (wantY - tiltY) * 0.05;

      const proj = perspective(FOV, aspect, 0.1, 100);
      const view = translate(0, 0, -dist);
      const model = multiply(rotY(time * 0.12 + tiltY), rotX(tiltX + Math.sin(time * 0.22) * 0.12));
      const mvp = multiply(multiply(proj, view), model);

      gl.clear(gl.COLOR_BUFFER_BIT);
      draw(progLine, uLine, lBuf, lSeed, gl.LINES, mvp, time);
      draw(progPoint, uPoint, pBuf, pSeed, gl.POINTS, mvp, time);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      mq.removeEventListener("change", readTheme);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      // Deliberately NOT calling WEBGL_lose_context here. React reuses the
      // same <canvas> across a remount (Strict Mode runs effects twice), and
      // a lost context can never be re-acquired on that element — the second
      // getContext returns null and the whole field silently disappears.
      gl.deleteBuffer(pBuf.buf);
      gl.deleteBuffer(pSeed.buf);
      gl.deleteBuffer(lBuf.buf);
      gl.deleteBuffer(lSeed.buf);
    };
  }, []);

  if (fallback) {
    // WebGL unavailable — a quiet static field so the hero is never bare
    return (
      <div
        aria-hidden
        className={className}
        style={{
          backgroundImage: "radial-gradient(var(--ink-4) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.22,
          maskImage: "radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%)",
        }}
      />
    );
  }

  return <canvas ref={ref} aria-hidden className={className} />;
}
