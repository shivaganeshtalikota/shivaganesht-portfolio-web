"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const FIELD =
  "w-full rounded-[var(--radius-sm)] border border-[var(--rule-strong)] bg-[var(--bg)] px-4 py-3 text-[15px] text-[var(--ink)] outline-none transition-all duration-300 placeholder:text-[var(--ink-3)] focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-wash)]";

const TOPICS = ["A role", "A collaboration", "A talk", "Something else"] as const;

export function ContactForm() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("A role");
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const ready = name.trim().length > 0 && message.trim().length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    const subject = `${topic} — from ${name.trim()}`;
    const body = [message.trim(), "", "—", name.trim(), from.trim() || null]
      .filter((l) => l !== null)
      .join("\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="surface p-7 md:p-9">
      <fieldset>
        <legend className="label">What's this about?</legend>
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-[var(--radius-sm)] bg-[var(--fill)] p-1 sm:grid-cols-4" role="radiogroup">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={topic === t}
              onClick={() => setTopic(t)}
              className="relative rounded-[4px] px-3 py-2 text-[13px] transition-colors duration-300"
              style={{ color: topic === t ? "var(--ink)" : "var(--ink-2)" }}
            >
              {topic === t && (
                <motion.span
                  layoutId="topic-pill"
                  className="absolute inset-0 rounded-[4px] bg-[var(--bg-raised)] shadow-[var(--shadow)]"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className={`mt-2.5 ${FIELD}`}
          />
        </div>
        <div>
          <label htmlFor="from" className="label">
            Your email <span className="normal-case tracking-normal text-[var(--ink-3)]">(optional)</span>
          </label>
          <input
            id="from"
            name="from"
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="you@example.com"
            className={`mt-2.5 ${FIELD}`}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me what you are working on."
          className={`mt-2.5 resize-y ${FIELD}`}
        />
      </div>

      <button
        type="submit"
        disabled={!ready}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3.5 text-[15px] text-[var(--bg)] transition-all duration-300 hover:opacity-85 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
      >
        {sent ? "Opening your mail app…" : "Compose email"}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      </button>

      <p className="safe-text mt-5 text-[12.5px] leading-relaxed text-[var(--ink-3)]">
        This opens the message in your own mail app. Nothing goes through this site and nothing is
        stored here. Rather just write to me directly?{" "}
        <a href={`mailto:${SITE.email}`} className="link-underline text-[var(--accent)]">
          {SITE.email}
        </a>
      </p>
    </form>
  );
}
