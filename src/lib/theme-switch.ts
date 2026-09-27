import { flushSync } from "react-dom";

type Theme = "dark" | "light";
type VT = { ready: Promise<void>; finished: Promise<void> };

/* Switch the theme with the new one spreading out in a circle from `from`
   (the switch, usually). It uses a View Transition: the browser snapshots
   the page once and animates a single layer, so it stays smooth on slow
   phones, where fading every element's colours at once did not. Where View
   Transitions aren't supported, or motion is reduced, it switches at once. */
export function switchTheme(next: Theme, setTheme: (t: string) => void, from?: { x: number; y: number }) {
  const root = document.documentElement;
  const apply = () => {
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(next));
  };

  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) {
    apply();
    return;
  }

  const x = from?.x ?? window.innerWidth / 2;
  const y = from?.y ?? 0;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.classList.add("theme-vt");
  const vt = doc.startViewTransition(apply);
  vt.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 620, easing: "cubic-bezier(0.32, 0, 0.18, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    })
    .catch(() => {});
  vt.finished.finally(() => root.classList.remove("theme-vt")).catch(() => {});
}

/** The centre of an element, for switchTheme's `from`. */
export function centreOf(el: Element | null) {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
