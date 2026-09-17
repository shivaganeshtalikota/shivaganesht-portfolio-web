"use client";

import { useEffect, useRef } from "react";

/* A real 3D node network — perspective-projected points and edges on a
   sphere, rotating, with cursor/touch parallax. Raw WebGL, no three.js.
   It's meant to read as an agent graph, not as decoration.

   Degrades to nothing if WebGL is unavailable or reduced motion is set. */

const VERT = `
attribute vec3 a_pos;
attribute float a_seed;
uniform mat4 u_mvp;
uniform float u_dpr;
uniform float u_time;
varying float v_depth;
varying float v_seed;
void main(){
  vec3 p = a_pos;
  // gentle organic drift so the lattice never looks rigid
  p += 0.035 * vec3(
    sin(u_time * 0.6 + a_seed * 12.9),
    cos(u_time * 0.5 + a_seed * 7.3),
    sin(u_time * 0.7 + a_seed * 3.1)
  );
  vec4 clip = u_mvp * vec4(p, 1.0);
  gl_Position = clip;
  v_depth = clamp((3.4 - clip.w) / 2.0, 0.0, 1.0);
  v_seed = a_seed;
  gl_PointSize = (1.3 + 3.0 * v_depth) * u_dpr;
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
  float disc = 1.0 - smoothstep(0.30, 0.5, d);
  float isAccent = step(0.88, v_seed);
  float pulse = 0.5 + 0.5 * sin(u_time * 1.7 + v_seed * 62.83);
  vec3 col = mix(u_ink, u_accent, isAccent);
  float a = disc * (0.06 + 0.48 * v_depth) * mix(1.0, 0.45 + 0.85 * pulse, isAccent);
  gl_FragColor = vec4(col * a, a);
}
`;

const FRAG_LINE = `
precision highp float;
uniform vec3 u_ink;
varying float v_depth;
varying float v_seed;
void main(){
  float a = (0.02 + 0.13 * v_depth);
  gl_FragColor = vec4(u_ink * a, a);
}
`;

/* ── tiny matrix helpers ─────────────────────────────────────── */

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

function link(gl: WebGLRenderingContext, vs: WebGLShader, fsSrc: string) {
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

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    if (!vs) return;
    const progPoint = link(gl, vs, FRAG_POINT);
    const progLine = link(gl, vs, FRAG_LINE);
    if (!progPoint || !progLine) return;

    /* ── build the graph ─────────────────────────────────────── */
    const small = window.innerWidth < 768;
    const N = small ? 150 : 320;
    const R = 1.32;

    const pts: number[] = [];
    const seeds: number[] = [];
    // Fibonacci sphere — even distribution, no clustering at the poles
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      pts.push(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
      // deterministic pseudo-random seed (no Math.random — keeps renders stable)
      seeds.push(((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1);
    }

    // edges between near neighbours
    const maxEdges = small ? 260 : 620;
    const thresh = small ? 0.52 : 0.40;
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
      return { buf: b, size, count: data.length / size };
    };

    const pBuf = mk(pts, 3);
    const pSeed = mk(seeds, 1);
    const lBuf = mk(lineVerts, 3);
    const lSeed = mk(lineSeeds, 1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let ink: [number, number, number] = [0.1, 0.1, 0.1];
    let accent: [number, number, number] = [1, 0.36, 0.15];
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      ink = hexToRgb(cs.getPropertyValue("--ink"));
      accent = hexToRgb(cs.getPropertyValue("--accent"));
    };
    readTheme();

    let dpr = 1;
    let aspect = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      aspect = canvas.width / Math.max(1, canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // pointer parallax, eased
    let tiltX = 0, tiltY = 0, wantX = 0, wantY = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      wantY = ((e.clientX - r.left) / r.width - 0.5) * 0.9;
      wantX = ((e.clientY - r.top) / r.height - 0.5) * 0.55;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObs = new MutationObserver(readTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", readTheme);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    const bind = (prog: WebGLProgram, posB: typeof pBuf, seedB: typeof pSeed) => {
      const ap = gl.getAttribLocation(prog, "a_pos");
      gl.bindBuffer(gl.ARRAY_BUFFER, posB.buf);
      gl.enableVertexAttribArray(ap);
      gl.vertexAttribPointer(ap, 3, gl.FLOAT, false, 0, 0);
      const as = gl.getAttribLocation(prog, "a_seed");
      gl.bindBuffer(gl.ARRAY_BUFFER, seedB.buf);
      gl.enableVertexAttribArray(as);
      gl.vertexAttribPointer(as, 1, gl.FLOAT, false, 0, 0);
    };

    const setU = (prog: WebGLProgram, mvp: Float32Array, time: number) => {
      gl.uniformMatrix4fv(gl.getUniformLocation(prog, "u_mvp"), false, mvp);
      gl.uniform1f(gl.getUniformLocation(prog, "u_dpr"), dpr);
      gl.uniform1f(gl.getUniformLocation(prog, "u_time"), time);
      gl.uniform3fv(gl.getUniformLocation(prog, "u_ink"), ink);
      const ua = gl.getUniformLocation(prog, "u_accent");
      if (ua) gl.uniform3fv(ua, accent);
    };

    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;

      const time = (t - t0) / 1000;
      tiltX += (wantX - tiltX) * 0.05;
      tiltY += (wantY - tiltY) * 0.05;

      const proj = perspective(Math.PI / 4.2, aspect, 0.1, 100);
      const view = translate(0, 0, -3.4);
      const model = multiply(rotY(time * 0.12 + tiltY), rotX(tiltX + Math.sin(time * 0.22) * 0.12));
      const mvp = multiply(multiply(proj, view), model);

      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(progLine);
      bind(progLine, lBuf, lSeed);
      setU(progLine, mvp, time);
      gl.drawArrays(gl.LINES, 0, lBuf.count);

      gl.useProgram(progPoint);
      bind(progPoint, pBuf, pSeed);
      setU(progPoint, mvp, time);
      gl.drawArrays(gl.POINTS, 0, pBuf.count);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      mq.removeEventListener("change", readTheme);
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
