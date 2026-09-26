/* Commands for the site-wide 3D particle field. Anything can drive it by
   dispatching one of these; the field decides how to animate. */

export type FieldCommand =
  | { type: "text"; text: string; hold?: number; emoji?: boolean }
  | { type: "matrix"; ms?: number }
  | { type: "pulse"; x?: number; y?: number }
  | { type: "beat"; strength?: number }
  | { type: "shape"; shape: string; hold?: number };

export function field(cmd: FieldCommand) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FieldCommand>("field", { detail: cmd }));
}
