"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { CONTACT_TOPICS, SITE } from "@/data/site";
import { field } from "@/lib/field";
import { useTheme } from "next-themes";
import { Refraction, canRefract, lensBackdrop } from "./Refraction";

const EASE = [0.16, 1, 0.3, 1] as const;

const FIELD =
  "w-full rounded-[var(--radius-sm)] border border-[var(--rule-strong)] bg-[var(--bg)] px-4 py-3 text-[16px] text-[var(--ink)] outline-none transition-all duration-300 placeholder:text-[var(--ink-3)] focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-wash)] md:text-[15px]";

type TopicKey = (typeof CONTACT_TOPICS)[number]["key"];
type State = "idle" | "sending" | "sent" | "error";

const PLACEHOLDER: Record<TopicKey, string> = {
  role: "The role, the team, and roughly what you'd want me working on.",
  talk: "The event, the date, the audience, and what you'd like me to talk about.",
  workshop: "Who it's for, how many people, and how long you've got.",
  brand: "The product, what you have in mind, and the timeline.",
  mentoring: "Where you are right now, and what you're stuck on.",
  other: "Tell me what you're working on.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// set in site.ts, or as NEXT_PUBLIC_WEB3FORMS_KEY in Vercel's settings
const KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || SITE.web3formsKey;

/* Messages go through Web3Forms straight to my inbox. The key is public by
   design (it can only ever deliver to the address it was registered to).
   A hidden honeypot field catches most bots; Web3Forms filters the rest.
   If the key is missing or the service is down, this falls back to
   opening the visitor's own mail app, so a message is never lost. */

/* The topic picker, as a piece of Liquid Glass.

   A glass bar holds every option; a clear glass lens sits over the chosen
   one. On a phone the options wrap onto two rows and the lens moves between
   them too. The lens:
   - shows the word under it once, through the glass: the row of labels has
     a hole cut where the lens is, and the lens carries its own aligned copy;
   - morphs straight to the size of whichever word it's moving to, and on the
     way narrows and grows taller, the way a drop of liquid does in motion,
     with a small overshoot when it arrives;
   - can be held and dragged anywhere, by mouse or finger. Held, it swells
     out past the edges of the bar and magnifies what's under it; let go and
     it springs onto the nearest option.
   Arrow keys move the choice, as a radio group should. */

type Slot = { key: TopicKey; x: number; y: number; w: number; h: number };

function TopicPicker({ value, onChange }: { value: TopicKey; onChange: (k: TopicKey) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [held, setHeld] = useState(false);
  // the lens bends what's behind its rim (Chromium), sized to where it's going
  const lensId = "lens-" + useId().replace(/[^a-z0-9]/gi, "");
  const [refract, setRefract] = useState(false);
  const [geo, setGeo] = useState({ w: 0, h: 0 });
  useEffect(() => setRefract(canRefract()), []);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";

  // the lens: where it is and how big, in the wrapper's coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const w = useMotionValue(0);
  const h = useMotionValue(0);
  const swell = useMotionValue(1);

  // in motion it narrows and grows taller, like the reference switch
  const vx = useVelocity(x);
  const squashX = useTransform(vx, [-2400, 0, 2400], [0.86, 1, 0.86]);
  const squashY = useTransform(vx, [-2400, 0, 2400], [1.14, 1, 1.14]);

  // the copy inside the lens stays on top of the words it covers
  const innerX = useTransform(x, (v) => -v);
  const innerY = useTransform(y, (v) => -v);

  // a hole in the labels where the lens is, so no word ever shows twice
  const holeSize = useTransform([w, h, swell], ([W, H, S]: number[]) => `100% 100%, ${Math.max(0, W * S - 10)}px ${Math.max(0, H * S - 8)}px`);
  const holePos = useTransform([x, y, w, h, swell], ([X, Y, W, H, S]: number[]) => {
    const cx = X + W / 2;
    const cy = Y + H / 2;
    return `0 0, ${cx - (W * S - 10) / 2}px ${cy - (H * S - 8) / 2}px`;
  });

  const valueRef = useRef(value);
  valueRef.current = value;
  const placed = useRef(false);
  const drag = useRef<{ id: number; gx: number; gy: number; ax: number; ay: number } | null>(null);

  useEffect(() => {
    animate(swell, held && !reduce ? 1.42 : 1, { type: "spring", stiffness: 420, damping: held ? 15 : 22 });
  }, [held, reduce, swell]);

  const measure = useCallback((): Slot[] => {
    const el = wrap.current;
    if (!el) return [];
    return [...el.querySelectorAll<HTMLElement>("[data-key]")].map((b) => ({
      key: b.dataset.key as TopicKey,
      x: b.offsetLeft,
      y: b.offsetTop,
      w: b.offsetWidth,
      h: b.offsetHeight,
    }));
  }, []);

  const moveTo = useCallback(
    (s: Slot, instant = false) => {
      setGeo({ w: s.w, h: s.h });
      if (instant || !placed.current || reduce) {
        x.jump(s.x);
        y.jump(s.y);
        w.jump(s.w);
        h.jump(s.h);
        placed.current = true;
        return;
      }
      // one spring for position and size alike, so the lens is the new word's
      // size the moment it arrives, with a small overshoot like the reference
      const spring = { type: "spring", stiffness: 420, damping: 30, mass: 0.9 } as const;
      animate(x, s.x, spring);
      animate(y, s.y, spring);
      animate(w, s.w, spring);
      animate(h, s.h, spring);
    },
    [x, y, w, h, reduce]
  );

  const home = useCallback(
    (instant: boolean) => {
      const all = measure();
      setSlots(all);
      const s = all.find((t) => t.key === valueRef.current);
      if (s) moveTo(s, instant);
    },
    [measure, moveTo]
  );

  useEffect(() => home(false), [value, home]);

  // the options reflow as fonts load or the window changes width (one row or
  // two), so follow them; one observer for good, since a new one reports at
  // once and would snap the lens mid-glide
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      home(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [home]);

  /* ── holding and dragging, by mouse or finger ── */
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a pointer the browser doesn't know: drag without capture */
    }
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    const cx = x.get() + w.get() / 2;
    const cy = y.get() + h.get() / 2;
    drag.current = { id: e.pointerId, gx: e.clientX - r.left - cx, gy: e.clientY - r.top - cy, ax: cx, ay: cy };
    setHeld(true);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = wrap.current;
    if (!d || d.id !== e.pointerId || !el) return;
    const r = el.getBoundingClientRect();
    let cx = e.clientX - r.left - d.gx;
    let cy = e.clientY - r.top - d.gy;
    // past the edges it resists, like glass pressed against its frame
    const band = (v: number, lo: number, hi: number) => (v < lo ? lo - (lo - v) * 0.25 : v > hi ? hi + (v - hi) * 0.25 : v);
    cx = band(cx, w.get() / 2, r.width - w.get() / 2);
    cy = band(cy, h.get() / 2, r.height - h.get() / 2);
    d.ax = cx;
    d.ay = cy;
    const follow = { type: "spring", stiffness: 1300, damping: 60, mass: 0.45 } as const;
    animate(x, cx - w.get() / 2, follow);
    animate(y, cy - h.get() / 2, follow);
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setHeld(false);
    // settle on the option nearest to where it was let go
    const all = measure();
    if (!all.length) return;
    const dist = (s: Slot) => Math.hypot(s.x + s.w / 2 - d.ax, (s.y + s.h / 2 - d.ay) * 1.4);
    const best = all.reduce((a, b) => (dist(b) < dist(a) ? b : a));
    if (best.key !== valueRef.current) onChange(best.key);
    else moveTo(best);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = CONTACT_TOPICS.findIndex((t) => t.key === value);
    const n = CONTACT_TOPICS.length;
    const next = CONTACT_TOPICS[(i + step + n) % n].key;
    onChange(next);
    wrap.current?.querySelector<HTMLElement>(`[data-key="${next}"]`)?.focus();
  };

  // tighter on phones, so the six topics sit in two rows down to 375px
  const label = "whitespace-nowrap px-2 py-2 text-[13px] sm:px-3.5 sm:text-[13.5px]";

  return (
    <div
      role="radiogroup"
      aria-label="What's this about?"
      onKeyDown={onKey}
      // no backdrop blur on the bar: it would make the bar a "backdrop root",
      // and the lens inside would only see the bar's half-transparent contents,
      // letting the original words ghost through its refraction
      className="glass-surface glass-focus mt-4 rounded-[26px] p-1"
    >
      <div ref={wrap} className="relative">
        {/* the labels. Where the glass can refract (Chromium), the lens
            transforms these very words; elsewhere it carries its own copy,
            and the labels get a hole where it sits so nothing shows twice. */}
        <motion.div
          className="flex flex-wrap gap-y-1"
          style={refract ? undefined : {
            maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
            WebkitMaskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            maskSize: holeSize,
            WebkitMaskSize: holeSize,
            maskPosition: holePos,
            WebkitMaskPosition: holePos,
          }}
        >
          {CONTACT_TOPICS.map((t) => {
            const on = t.key === value;
            return (
              <button
                key={t.key}
                data-key={t.key}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => onChange(t.key)}
                className={`flex-auto rounded-full text-[var(--ink-2)] outline-none transition-colors duration-300 hover:text-[var(--ink)] ${label}`}
              >
                {t.label}
              </button>
            );
          })}
        </motion.div>

        {/* the lens */}
        <Refraction id={lensId} width={geo.w} height={geo.h} theme={theme} scale={held ? -18 : -12} tint="accent" />
        <motion.div
          aria-hidden
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          data-held={held}
          className="glass-lens absolute left-0 top-0 z-10 cursor-grab touch-none overflow-hidden rounded-full active:cursor-grabbing"
          style={{
            x,
            y,
            width: w,
            height: h,
            scale: swell,
            scaleX: squashX,
            scaleY: squashY,
            backdropFilter: lensBackdrop(lensId, refract && geo.w > 0),
            WebkitBackdropFilter: lensBackdrop(lensId, false),
          }}
        >
          {/* without refraction: the words it covers, drawn inside it,
              exactly aligned at rest, magnified with the lens while held */}
          {!refract && (
          <motion.div className="pointer-events-none absolute left-0 top-0" style={{ x: innerX, y: innerY }}>
            {slots.map((s) => (
              <span
                key={s.key}
                className={`absolute flex items-center justify-center font-semibold text-[var(--accent)] ${label}`}
                style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
              >
                {CONTACT_TOPICS.find((t) => t.key === s.key)?.label}
              </span>
            ))}
          </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function ContactForm() {
  const [topic, setTopic] = useState<TopicKey>("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [touched, setTouched] = useState(false);

  // /contact?topic=talk preselects the right option
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("topic");
    if (q && CONTACT_TOPICS.some((t) => t.key === q)) setTopic(q as TopicKey);
  }, []);

  const label = CONTACT_TOPICS.find((t) => t.key === topic)?.label ?? "A message";
  const emailOk = EMAIL_RE.test(email.trim());
  const ready = name.trim().length > 1 && emailOk && message.trim().length > 9;

  const mailtoHref = () => {
    const subject = `${label} — from ${name.trim() || "someone"}`;
    const body = [message.trim(), "", "—", name.trim(), org.trim() || null, email.trim() || null]
      .filter((l) => l !== null)
      .join("\n");
    return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!ready || state === "sending") return;

    if (!KEY) {
      window.location.href = mailtoHref();
      setState("sent");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: KEY,
          subject: `${label} — from ${name.trim()}`,
          from_name: "shivaganeshtalikota.vercel.app",
          name: name.trim(),
          email: email.trim(),
          organisation: org.trim() || "—",
          topic: label,
          message: message.trim(),
          botcheck: honey,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean };
      if (!res.ok || !data.success) throw new Error("rejected");
      setState("sent");
      field({ type: "pulse" });
    } catch {
      setState("error");
    }
  }

  return (
    <div className="surface relative overflow-hidden p-5 sm:p-7 md:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {state === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="py-6"
            role="status"
          >
            <p className="label text-[var(--accent)]">Sent</p>
            <p className="font-display mt-4 text-[34px] leading-[1.05] md:text-[40px]">
              Got it, {name.trim().split(" ")[0] || "thank you"}.
            </p>
            <p className="safe-text mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-[var(--ink-2)]">
              {KEY
                ? `It's in my inbox now. I'll reply to ${email.trim()}, usually within a couple of days.`
                : "Your mail app should have opened with the message ready to send. If it didn't, write to me directly and I'll get back to you."}
            </p>
            <button
              type="button"
              onClick={() => {
                setState("idle");
                setMessage("");
                setTouched(false);
              }}
              className="mono-sm mt-8 text-[12px] text-[var(--ink-3)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
            >
              send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <fieldset>
              <legend className="label">What&apos;s this about?</legend>
              <TopicPicker value={topic} onChange={setTopic} />
            </fieldset>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-name" className="label">
                  Your name
                </label>
                <input
                  id="cf-name"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className={`mt-2.5 ${FIELD}`}
                  aria-invalid={touched && name.trim().length < 2}
                />
              </div>
              <div>
                <label htmlFor="cf-email" className="label">
                  Your email
                </label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`mt-2.5 ${FIELD}`}
                  aria-invalid={touched && !emailOk}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="cf-org" className="label">
                Company, college or event{" "}
                <span className="normal-case tracking-normal text-[var(--ink-3)]">(optional)</span>
              </label>
              <input
                id="cf-org"
                name="organisation"
                autoComplete="organization"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Where you're writing from"
                className={`mt-2.5 ${FIELD}`}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="cf-message" className="label">
                Message
              </label>
              <textarea
                id="cf-message"
                name="message"
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={PLACEHOLDER[topic]}
                className={`mt-2.5 resize-y ${FIELD}`}
                aria-invalid={touched && message.trim().length < 10}
              />
            </div>

            {/* honeypot: invisible to people, irresistible to bots */}
            <input
              type="checkbox"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              checked={honey}
              onChange={(e) => setHoney(e.target.checked)}
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            {touched && !ready && (
              <p className="mono-sm mt-4 text-[12px] text-[var(--accent)]" role="alert">
                {name.trim().length < 2
                  ? "I'll need your name."
                  : !emailOk
                    ? "That email doesn't look right, and I'll need it to reply."
                    : "Tell me a little more than that."}
              </p>
            )}

            {state === "error" && (
              <p className="mono-sm mt-4 text-[12px] leading-relaxed text-[var(--accent)]" role="alert">
                That didn&apos;t go through, which is on my end, not yours.{" "}
                <a href={mailtoHref()} className="underline underline-offset-2">
                  Send it by email instead
                </a>{" "}
                and nothing is lost.
              </p>
            )}

            <button
              type="submit"
              disabled={state === "sending"}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3.5 text-[15px] text-[var(--bg)] transition-all duration-300 hover:opacity-85 active:scale-[0.985] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            >
              {state === "sending" ? "Sending…" : KEY ? "Send message" : "Compose email"}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </button>

            <p className="safe-text mt-5 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
              {KEY
                ? "This comes straight to my inbox. Nothing is stored on this site."
                : "This opens the message in your own mail app. Nothing is stored on this site."}{" "}
              Rather write directly?{" "}
              <a href={`mailto:${SITE.email}`} className="link-underline text-[var(--accent)]">
                {SITE.email}
              </a>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
