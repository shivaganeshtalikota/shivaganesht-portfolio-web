"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-full border border-[var(--rule-strong)] px-5 py-2.5 text-[14px] transition-colors duration-300 hover:bg-[var(--fill)]"
    >
      Save as PDF
      <span className="mono-sm text-[var(--ink-3)]">⌘P</span>
    </button>
  );
}
