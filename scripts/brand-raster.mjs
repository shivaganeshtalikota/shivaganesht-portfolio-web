// Renders the PNG and JPG versions of the logo kit from the SVGs that
// scripts/brand.py writes, using sharp (which Next already depends on).
// Run it through `npm run brand`, which does all three steps in order.

import { readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = join(import.meta.dirname, "..");
const out = join(root, "public", "brand");
const manifest = JSON.parse(await readFile(join(root, "src", "data", "brand.json"), "utf8"));

const used = new Set();
let n = 0;

for (const group of manifest.groups) {
  for (const item of group.items) {
    for (const f of item.files) {
      if (!f.from) continue;
      const svg = await readFile(join(out, f.from));
      used.add(f.from);
      // render at twice the size, then scale down: cleaner edges on the curves
      let img = sharp(svg, { density: 144 });
      img = f.size ? img.resize(f.size, f.size) : img.resize({ height: f.height });
      if (f.kind === "JPG") {
        img = img.flatten({ background: f.flatten ?? item.bg ?? "#ffffff" }).jpeg({ quality: 92, mozjpeg: true });
      } else {
        img = img.png({ compressionLevel: 9 });
      }
      await writeFile(join(root, "public", f.href), await img.toBuffer());
      n++;
    }
  }
}

// the full-bleed squares only exist to make the JPGs
for (const name of used) {
  if (name.endsWith("-square.svg") && existsSync(join(out, name))) await unlink(join(out, name));
}

console.log(`rendered ${n} images`);
