"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SITE } from "@/data/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const FIELD =
  "w-full rounded-[var(--radius-md)] border border-[var(--separator-opaque)] bg-[var(--bg)] px-4 py-3 text-[15px] text-[var(--label)] outline-none transition-all duration-300 placeholder:text-[var(--label-tertiary)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]";

const TOPICS = ["A role", "A collaboration", "A speaking invite", "Something else"] as const;

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
    const body = [
      message.trim(),
      "",
      "—",
      name.trim(),
      from.trim() ? from.trim() : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="card p-7 md:p-9">
      <fieldset>
        <legend className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
          What's this about?
        </legend>
        <div
          className="mt-3 grid grid-cols-2 gap-1 rounded-[var(--radius-md)] bg-[var(--fill-tertiary)] p-1 sm:grid-cols-4"
          role="radiogroup"
        >
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={topic === t}
              onClick={() => setTopic(t)}
              className="relative rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors duration-300"
              style={{ color: topic === t ? "var(--label)" : "var(--label-secondary)" }}
            >
              {topic === t && (
                <motion.span
                  layoutId="topic-pill"
                  className="absolute inset-0 rounded-[10px] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]"
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
          <label htmlFor="name" className="block text-[13px] font-medium">
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className={`mt-2 ${FIELD}`}
          />
        </div>
        <div>
          <label htmlFor="from" className="block text-[13px] font-medium">
            Your email <span className="text-[var(--label-tertiary)]">(optional)</span>
          </label>
          <input
            id="from"
            name="from"
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="you@example.com"
            className={`mt-2 ${FIELD}`}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-[13px] font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me what you're working on."
          className={`mt-2 resize-y ${FIELD}`}
        />
      </div>

      <button
        type="submit"
        disabled={!ready}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-[15px] font-medium text-white transition-all duration-300 hover:bg-[var(--accent-hover)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {sent ? "Opening your mail app…" : "Compose email"}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h13M12 5l7 7-7 7" />
        </svg>
      </button>

      <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--label-tertiary)]">
        This composes the message in your own mail app — nothing is sent through this site and
        nothing is stored here. Prefer to write directly?{" "}
        <a
          href={`mailto:${SITE.email}`}
          className="text-[var(--accent)] transition-opacity hover:opacity-70"
        >
          {SITE.email}
        </a>
      </p>
    </form>
  );
}
