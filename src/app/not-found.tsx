import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="text-[13px] font-medium text-[var(--accent)]">404</p>
      <h1 className="text-title-1 mt-3 text-balance">This page doesn&apos;t exist.</h1>
      <p className="text-body-lg mt-4 max-w-md text-pretty text-[var(--label-secondary)]">
        The link may be old, or the page may have moved.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button href="/">Back home</Button>
        <Button href="/projects" variant="secondary">
          See the work
        </Button>
      </div>
    </section>
  );
}
