import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* The site's mark: an italic serif S with the accent dot, on the dark
   palette. Used for the favicon and the home-screen icon. */
export async function mark(size: number) {
  const serif = await readFile(join(process.cwd(), "src", "app", "_og", "InstrumentSerif-Regular.ttf"));
  const r = Math.round(size * 0.22);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0b0a",
          borderRadius: size >= 128 ? 0 : r,
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: "serif",
            fontSize: size * 0.86,
            lineHeight: 1,
            color: "#f2f0ec",
            marginTop: -size * 0.06,
            display: "flex",
          }}
        >
          S
        </div>
        <div
          style={{
            position: "absolute",
            right: size * 0.2,
            bottom: size * 0.22,
            width: Math.max(3, size * 0.12),
            height: Math.max(3, size * 0.12),
            borderRadius: 999,
            background: "#ff5c26",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [{ name: "serif", data: serif as unknown as ArrayBuffer, style: "normal", weight: 400 }],
    }
  );
}
