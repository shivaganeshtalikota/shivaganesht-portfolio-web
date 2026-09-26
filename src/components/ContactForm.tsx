"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CONTACT_TOPICS, SITE } from "@/data/site";
import { field } from "@/lib/field";

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
    <div className="surface relative overflow-hidden p-7 md:p-9">
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
              <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup">
                {CONTACT_TOPICS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="radio"
                    aria-checked={topic === t.key}
                    onClick={() => setTopic(t.key)}
                    className="relative rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-300"
                    style={{
                      borderColor: topic === t.key ? "var(--ink)" : "var(--rule-strong)",
                      background: topic === t.key ? "var(--ink)" : "transparent",
                      color: topic === t.key ? "var(--bg)" : "var(--ink-2)",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
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
