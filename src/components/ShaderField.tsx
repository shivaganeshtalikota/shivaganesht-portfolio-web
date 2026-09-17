"use client";

import { useEffect, useRef } from "react";

/* A cursor-reactive dot field, written as a raw WebGL fragment shader.
   No three.js — this is ~4KB instead of ~600KB. Degrades to nothing if
   WebGL is unavailable or the visitor prefers reduced motion. */

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_on;
uniform vec3  u_ink;
uniform vec3  u_accent;
uniform float u_dpr;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),            hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main(){
  vec2 px = gl_FragCoord.xy;
  float spacing = 26.0 * u_dpr;

  vec2 cell   = floor(px / spacing);
  vec2 center = (cell + 0.5) * spacing;

  float n1 = noise(cell * 0.085 + u_time * 0.10);
  float n2 = noise(cell * 0.055 - u_time * 0.07);

  float d    = distance(center, u_mouse);
  float infl = u_on * exp(-d / (165.0 * u_dpr));

  vec2 dir  = normalize(center - u_mouse + vec2(0.0001));
  vec2 disp = dir * infl * 18.0 * u_dpr;
  disp += vec2(cos(n1 * 6.2831), sin(n2 * 6.2831)) * 2.4 * u_dpr;

  float r    = (0.85 + n1 * 1.5 + infl * 3.4) * u_dpr;
  float dist = distance(px, center + disp);
  float dot_ = 1.0 - smoothstep(r - 1.1 * u_dpr, r + 1.1 * u_dpr, dist);

  vec2 uv = px / u_res;
  float fade = smoothstep(0.0, 0.42, uv.y) * smoothstep(1.02, 0.55, uv.y);

  vec3  col = mix(u_ink, u_accent, clamp(infl * 2.4, 0.0, 1.0));
  float a   = dot_ * (0.13 + n1 * 0.13 + infl * 0.7) * fade;

  // premultiplied — the canvas composites over the page, so colour must be
  // scaled by alpha and blended with ONE / ONE_MINUS_SRC_ALPHA.
  gl_FragColor = vec4(col * a, a);
}
`;

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

export function ShaderField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl =
      (canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        depth: false,
        stencil: false,
      }) as WebGLRenderingContext | null) ?? null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      on: gl.getUniformLocation(prog, "u_on"),
      ink: gl.getUniformLocation(prog, "u_ink"),
      accent: gl.getUniformLocation(prog, "u_accent"),
      dpr: gl.getUniformLocation(prog, "u_dpr"),
    };

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.dpr, dpr);
    };

    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      gl.uniform3fv(U.ink, hexToRgb(cs.getPropertyValue("--ink")));
      gl.uniform3fv(U.accent, hexToRgb(cs.getPropertyValue("--accent")));
    };

    // pointer, eased so the ripple trails the cursor rather than snapping
    let mx = -9999,
      my = -9999,
      tx = -9999,
      ty = -9999,
      on = 0,
      wantOn = 0;

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = (e.clientX - r.left) * dpr;
      ty = (r.height - (e.clientY - r.top)) * dpr;
      wantOn = 1;
    };
    const onLeave = () => {
      wantOn = 0;
    };

    resize();
    readTheme();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    const themeObs = new MutationObserver(readTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", readTheme);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    const t0 = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      mx += (tx - mx) * 0.09;
      my += (ty - my) * 0.09;
      on += (wantOn - on) * 0.06;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.time, (t - t0) / 1000);
      gl.uniform2f(U.mouse, mx, my);
      gl.uniform1f(U.on, on);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      mq.removeEventListener("change", readTheme);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
