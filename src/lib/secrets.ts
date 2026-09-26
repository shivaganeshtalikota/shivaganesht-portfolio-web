/* Every easter egg on the site reports here. Progress lives in
   localStorage so a visitor's finds survive reloads, and the tracker
   only appears after the first one, which is the hook. */

export type SecretId =
  | "terminal"
  | "palette"
  | "command"
  | "konami"
  | "logo"
  | "roll"
  | "comic"
  | "matrix"
  | "chai"
  | "hyderabad"
  | "telugu"
  | "record"
  | "metcalfe"
  | "music"
  | "shockwave"
  | "shortcuts"
  | "lost";

export const SECRETS: { id: SecretId; label: string; hint: string }[] = [
  { id: "terminal", label: "Opened the terminal", hint: "bottom-right corner" },
  { id: "palette", label: "Found the command palette", hint: "⌘K, or just /" },
  { id: "command", label: "Ran a command that isn't on the list", hint: "be rude to the terminal" },
  { id: "konami", label: "Entered the Konami code", hint: "↑ ↑ ↓ ↓ ← → ← → B A" },
  { id: "logo", label: "Tapped my name five times", hint: "the name at the top" },
  { id: "roll", label: "Made the whole site roll over", hint: "the name at the bottom" },
  { id: "comic", label: "Ruined the design system", hint: "keep clicking the name at the bottom" },
  { id: "matrix", label: "Took the red pill", hint: "type the name of a film" },
  { id: "chai", label: "Made chai", hint: "what I run on" },
  { id: "hyderabad", label: "Typed where I'm from", hint: "a city, or its best dish" },
  { id: "telugu", label: "Said hello in Telugu", hint: "a greeting" },
  { id: "record", label: "Typed the record number", hint: "four digits, from Agentathon" },
  { id: "metcalfe", label: "Met Bob Metcalfe", hint: "the man behind Ethernet" },
  { id: "music", label: "Played the music", hint: "a terminal command" },
  { id: "shockwave", label: "Sent a shockwave through the field", hint: "click the empty background" },
  { id: "shortcuts", label: "Found the keyboard shortcuts", hint: "press ?" },
  { id: "lost", label: "Got properly lost", hint: "a page that doesn't exist" },
];

const KEY = "sgt-secrets";

export function foundSecrets(): SecretId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as SecretId[]) : [];
    return Array.isArray(arr) ? arr.filter((id) => SECRETS.some((s) => s.id === id)) : [];
  } catch {
    return [];
  }
}

export function unlock(id: SecretId) {
  if (typeof window === "undefined") return;
  const have = foundSecrets();
  if (have.includes(id)) return;
  const next = [...have, id];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: still announce it, it just won't persist */
  }
  window.dispatchEvent(new CustomEvent("secret", { detail: { id, count: next.length } }));
}

export function resetSecrets() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
  window.dispatchEvent(new CustomEvent("secret", { detail: { id: null, count: 0 } }));
}

/* A small shared toast channel, so any egg can say something. */
export function toast(text: string, ms = 3400) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("site-toast", { detail: { text, ms } }));
}
