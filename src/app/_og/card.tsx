import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/data/site";

/* Shared Open Graph card. Every page gets one, so a link shared into
   LinkedIn or WhatsApp shows the page it actually points at instead of
   the same portrait every time.

   Rendered by Satori, which only supports flexbox and a subset of CSS.
   No CSS variables, no grid — colours are hardcoded to match the dark
   theme because that is what reads best in a feed. */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

const BG = "#0c0b0a";
const INK = "#f2f0ec";
const INK_2 = "#a8a49c";
const INK_3 = "#948f86";
const ACCENT = "#ff5c26";
const RULE = "rgba(242, 240, 236, 0.14)";

let cached: { serif: Buffer; mono: Buffer } | null = null;

async function fonts() {
  if (cached) return cached;
  const dir = join(process.cwd(), "src", "app", "_og");
  const [serif, mono] = await Promise.all([
    readFile(join(dir, "InstrumentSerif-Regular.ttf")),
    readFile(join(dir, "Mono-Regular.ttf")),
  ]);
  cached = { serif, mono };
  return cached;
}

export async function ogCard({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  note?: string;
}) {
  const { serif, mono } = await fonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "68px 72px",
          fontFamily: "mono",
        }}
      >
        {/* top rule + eyebrow */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: 8, background: ACCENT, display: "flex" }} />
            <div
              style={{
                fontFamily: "mono",
                fontSize: 19,
                letterSpacing: 3.4,
                textTransform: "uppercase",
                color: ACCENT,
              }}
            >
              {eyebrow}
            </div>
          </div>
          <div style={{ width: "100%", height: 1, background: RULE, marginTop: 30, display: "flex" }} />
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: -20 }}>
          <div
            style={{
              fontFamily: "serif",
              fontSize: title.length > 46 ? 74 : 92,
              lineHeight: 1.04,
              letterSpacing: -2.2,
              color: INK,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {note ? (
            <div
              style={{
                fontFamily: "mono",
                fontSize: 23,
                lineHeight: 1.5,
                color: INK_2,
                marginTop: 26,
                maxWidth: 820,
              }}
            >
              {note}
            </div>
          ) : null}
        </div>

        {/* footer */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: "100%", height: 1, background: RULE, marginBottom: 26, display: "flex" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontFamily: "serif", fontSize: 34, color: INK, letterSpacing: -0.6 }}>
              {SITE.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontFamily: "mono", fontSize: 18, color: INK_3, letterSpacing: 1.2 }}>
                {SITE.role.toUpperCase()}
              </div>
              <div style={{ fontFamily: "mono", fontSize: 17, color: INK_3, marginTop: 8 }}>
                shivaganeshtalikota.vercel.app
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "serif", data: serif as unknown as ArrayBuffer, style: "normal", weight: 400 },
        { name: "mono", data: mono as unknown as ArrayBuffer, style: "normal", weight: 400 },
      ],
    }
  );
}
