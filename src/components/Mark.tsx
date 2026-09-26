/* The site's mark, the same one as the favicon: a serif S with the accent
   dot, on the dark square. Drawn in HTML rather than an image so it uses the
   page's own Instrument Serif and stays sharp at any size. It keeps its dark
   square in light mode too, the way an app icon would. */
export function Mark({ size = 30, className = "", ...rest }: { size?: number; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={`mark relative inline-grid shrink-0 place-items-center rounded-[24%] bg-[#0c0b0a] ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      <span
        className="font-display block leading-none text-[#f2f0ec]"
        style={{ fontSize: size * 0.82, marginTop: -size * 0.02 }}
      >
        S
      </span>
      <span
        className="absolute rounded-full bg-[#ff5c26]"
        style={{
          width: Math.max(3, size * 0.13),
          height: Math.max(3, size * 0.13),
          right: size * 0.19,
          bottom: size * 0.21,
        }}
      />
    </span>
  );
}
