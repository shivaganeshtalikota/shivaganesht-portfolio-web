import { field } from "./field";
import { toast, unlock } from "./secrets";

/* The personal eggs. Each one is something true about me, and each can be
   reached two ways: typing the word anywhere on the page, or running it as
   a command in the terminal. */

export function eggChai() {
  let n = 1;
  try {
    n = Number(window.localStorage.getItem("sgt-chai") || "0") + 1;
    window.localStorage.setItem("sgt-chai", String(n));
  } catch {
    /* fine */
  }
  field({ type: "text", text: "☕", emoji: true, hold: 4200 });
  toast(
    n === 1
      ? "one chai, coming right up. this is genuinely what I run on."
      : n < 4
        ? `chai number ${n}. no judgement. I'm usually on my third by now.`
        : `chai number ${n}. okay, now I'm a little worried about you.`
  );
  unlock("chai");
}

export function eggHyderabad() {
  field({ type: "text", text: "HYD", hold: 4400 });
  toast("Hyderabad. best biryani in the world, and that is not up for debate.");
  unlock("hyderabad");
}

export function eggTelugu() {
  field({ type: "text", text: "నమస్కారం", hold: 5000 });
  toast("namaskaram. that's hello, in Telugu.");
  unlock("telugu");
}

export function eggRecord() {
  field({ type: "text", text: "2,089", hold: 4800 });
  field({ type: "pulse" });
  toast("2,089 people in one agentic AI hackathon. it set a Guinness record, and I was one of them.", 5200);
  unlock("record");
}

export function eggMetcalfe() {
  field({ type: "shape", shape: "sphere", hold: 5600 });
  field({ type: "pulse" });
  toast(
    "Metcalfe's law: a network is worth roughly the square of its users. I once got to ask the man himself a question, at T-Hub.",
    6400
  );
  unlock("metcalfe");
}

export function eggMatrix() {
  field({ type: "matrix", ms: 6500 });
  toast("wake up, Neo. it goes back to normal in a moment.");
  unlock("matrix");
}

/* I once spoke about generative AI and music. This is not that. This is a
   melody generated from the letters of my name, which is much worse. */
export function eggMusic(): number {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return 0;
  const ctx = new Ctx();

  const master = ctx.createGain();
  master.gain.value = 0.11;
  master.connect(ctx.destination);

  const delay = ctx.createDelay();
  delay.delayTime.value = 0.27;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  // A minor pentatonic, and the notes are picked by the letters of my name
  const scale = [0, 3, 5, 7, 10, 12, 15, 17];
  const letters = "shivaganeshtalikota".split("").map((c) => c.charCodeAt(0));
  const root = 220;
  const step = 0.19;
  const steps = 26;
  const start = ctx.currentTime + 0.06;

  for (let i = 0; i < steps; i++) {
    const note = scale[letters[i % letters.length] % scale.length] + (i % 8 === 0 ? -12 : 0);
    const freq = root * Math.pow(2, note / 12);
    const at = start + i * step;

    const osc = ctx.createOscillator();
    osc.type = i % 4 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(0.9, at + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);

    osc.connect(env);
    env.connect(master);
    env.connect(delay);
    osc.start(at);
    osc.stop(at + 0.4);

    window.setTimeout(() => field({ type: "beat", strength: i % 4 === 0 ? 1 : 0.55 }), (at - ctx.currentTime) * 1000);
  }

  const total = steps * step + 1.8;
  window.setTimeout(() => void ctx.close(), total * 1000);
  unlock("music");
  return total;
}
