import { Button } from "@/components/ui";
import { LostSecret } from "@/components/LostSecret";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[75vh] flex-col items-start justify-center py-32">
      <LostSecret />
      <span className="label">Error 404</span>
      <h1 className="t-1 mt-6 max-w-[16ch] text-balance">
        This page doesn&apos;t <em className="italic text-[var(--accent)]">exist.</em>
      </h1>
      <p className="t-lede mt-5 max-w-[42ch] text-pretty">
        Either the link is old or I moved something. Press <kbd className="font-mono text-[var(--ink)]">⌘K</kbd> and it will probably turn up.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/">Back home</Button>
        <Button href="/projects" variant="outline">
          See the work
        </Button>
      </div>
      <p className="mono-sm mt-10 text-[var(--ink-3)]">
        On the bright side, getting lost here counts as one of the secrets.
      </p>
    </section>
  );
}
