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

/* Hints are meant to be followed, not solved: each one says where to go
   and roughly what to do, without spoiling the exact word. */
export const SECRETS: { id: SecretId; label: string; hint: string }[] = [
  { id: "terminal", label: "Opened the terminal", hint: "click the >_ button in the bottom-right corner" },
  { id: "palette", label: "Found the command palette", hint: "press ⌘K (Ctrl+K on Windows), or just /" },
  { id: "command", label: "Ran a command that isn't on the list", hint: "in the terminal, try something rude, like sudo" },
  { id: "konami", label: "Entered the Konami code", hint: "on a keyboard: ↑ ↑ ↓ ↓ ← → ← → B A" },
  { id: "logo", label: "Tapped the S five times", hint: "tap the S in the top-left corner five times, quickly" },
  { id: "roll", label: "Made the whole site roll over", hint: "click my name at the very bottom of any page, five times" },
  { id: "comic", label: "Ruined the design system", hint: "keep clicking my name at the bottom, all the way to twelve" },
  { id: "matrix", label: "Took the red pill", hint: "type the name of a 1999 film about a simulation, anywhere on the page" },
  { id: "chai", label: "Made chai", hint: "type the drink I run on (it isn't coffee), anywhere on the page" },
  { id: "hyderabad", label: "Typed where I'm from", hint: "type the city I live in, or its most famous dish" },
  { id: "telugu", label: "Said hello in Telugu", hint: "type a hello: namaste works, and so does the Telugu one" },
  { id: "record", label: "Typed the record number", hint: "type how many people were at Agentathon 2025 (four digits)" },
  { id: "metcalfe", label: "Met Bob Metcalfe", hint: "type the surname of the man who invented Ethernet" },
  { id: "music", label: "Played the music", hint: "open the terminal and ask it to play something" },
  { id: "shockwave", label: "Sent a shockwave through the field", hint: "click any empty patch of background" },
  { id: "shortcuts", label: "Found the keyboard shortcuts", hint: "press ? (that's Shift and /)" },
  { id: "lost", label: "Got properly lost", hint: "go to a page that doesn't exist, like /nowhere" },
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
