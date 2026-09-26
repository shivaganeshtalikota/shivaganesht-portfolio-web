"""Builds the logo kit in public/brand/ from the site's own font.

    npm run brand

The S and the name are traced out of Instrument Serif and shaped with
HarfBuzz (so the name is kerned properly), then written as SVG paths, so the
files look identical everywhere, with no font needed. The geometry matches
src/components/Mark.tsx exactly: an S at 0.82 of the square, centred on its
line box, lifted 2%, with the dot at 19% from the right and 21% from the
bottom. brand-raster.mjs then renders PNG and JPG versions, and
`brand.py zip` bundles everything into one download.

Needs: fonttools, uharfbuzz (pip), and sharp (already there via Next).
"""

import json
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "src" / "app" / "_og" / "InstrumentSerif-Regular.ttf"
OUT = ROOT / "public" / "brand"
MANIFEST = ROOT / "src" / "data" / "brand.json"
NAME = "Shiva Ganesh Talikota"

font = TTFont(FONT)
glyphs = font.getGlyphSet()
UPM = font["head"].unitsPerEm
ASC = font["hhea"].ascent
DESC = -font["hhea"].descent

blob = hb.Blob.from_file_path(str(FONT))
hb_font = hb.Font(hb.Face(blob))


def shaped_path(text: str, size: float, x: float, baseline: float) -> tuple[str, float]:
    """The text as one SVG path, `size` units per em, starting at x on the
    given baseline, with the font's own kerning applied; and its width."""
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb_font, buf, {"kern": True, "liga": True})
    k = size / UPM
    order = font.getGlyphOrder()
    parts = []
    pen_x = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        svg = SVGPathPen(glyphs)
        # font units are y-up; SVG is y-down
        t = TransformPen(svg, (k, 0, 0, -k, x + (pen_x + pos.x_offset) * k, baseline - pos.y_offset * k))
        glyphs[name].draw(t)
        parts.append(svg.getCommands())
        pen_x += pos.x_advance
    return " ".join(p for p in parts if p), pen_x * k


def advance(text: str, size: float) -> float:
    return shaped_path(text, size, 0, 0)[1]


def r(v: float) -> str:
    return f"{v:.2f}".rstrip("0").rstrip(".")


# ── the mark, in a 100 × 100 box, exactly as Mark.tsx draws it ────────────

S_SIZE = 82
LINE_TOP = (100 - S_SIZE) / 2 - 2  # centred line box, lifted 2%
# with line-height 1 the line box is one em tall; the font's ascent and
# descent overflow it equally, so the baseline sits at:
S_BASELINE = LINE_TOP + (S_SIZE - (ASC + DESC) * S_SIZE / UPM) / 2 + ASC * S_SIZE / UPM
S_X = (100 - advance("S", S_SIZE)) / 2
S_PATH, _ = shaped_path("S", S_SIZE, S_X, S_BASELINE)
DOT = {"cx": 100 - 19 - 6.5, "cy": 100 - 21 - 6.5, "r": 6.5}

PALETTES = {
    # key: (label, background, S, dot, note)
    "night": ("Night", "#0c0b0a", "#f2f0ec", "#ff5c26", "The original. Use this one when in doubt."),
    "paper": ("Paper", "#faf9f7", "#14130f", "#c93800", "For light pages and print."),
    "white": ("White", "#ffffff", "#0c0b0a", "#ff5c26", "Pure white, for slides and documents."),
    "graphite": ("Graphite", "#2b2a27", "#f2f0ec", "#ff5c26", "A softer dark, for busy dark layouts."),
    "stone": ("Stone", "#e6e3dc", "#14130f", "#c93800", "A warm grey, for light layouts that need contrast."),
    "vermilion": ("Vermilion", "#ff5c26", "#0c0b0a", "#0c0b0a", "The accent as the background. Use sparingly."),
}
INKS = {
    "ink": ("Dark ink", "#14130f", "#c93800", "For light backgrounds, no square."),
    "light": ("Light ink", "#f2f0ec", "#ff5c26", "For dark backgrounds, no square."),
}


def mark_svg(bg, fg, dot, rounded=True, pad=0.0, size=1024):
    """The square mark. `pad` shrinks the art inside a full-bleed square, for
    avatars that get cropped to a circle."""
    inner = f'<path d="{S_PATH}" fill="{fg}"/><circle cx="{r(DOT["cx"])}" cy="{r(DOT["cy"])}" r="{r(DOT["r"])}" fill="{dot}"/>'
    if pad:
        s = 1 - 2 * pad
        inner = f'<g transform="translate({r(100 * pad)} {r(100 * pad)}) scale({r(s)})">{inner}</g>'
    rx = ' rx="24"' if rounded else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="{size}" height="{size}">'
        f'<title>{NAME}</title><rect width="100" height="100"{rx} fill="{bg}"/>{inner}</svg>'
    )


def glyph_svg(fg, dot, size=1024):
    # just the S and the dot, trimmed to their own bounds with a little air
    x0, y0, x1, y1 = S_X + 41 * S_SIZE / UPM - 4, S_BASELINE - 730 * S_SIZE / UPM - 4, DOT["cx"] + DOT["r"] + 4, S_BASELINE + 9 * S_SIZE / UPM + 4
    w, h = x1 - x0, y1 - y0
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{r(x0)} {r(y0)} {r(w)} {r(h)}" width="{round(size * w / h)}" height="{size}">'
        f'<title>{NAME}</title><path d="{S_PATH}" fill="{fg}"/>'
        f'<circle cx="{r(DOT["cx"])}" cy="{r(DOT["cy"])}" r="{r(DOT["r"])}" fill="{dot}"/></svg>'
    )


def lockup_svg(bg, name_fg, height=600):
    """Mark and name side by side, in the proportions the nav uses: the name
    at 0.63 of the mark's height, a third of a mark apart, centred on it.
    The mark itself is always the original Night square, as in the nav."""
    pad = 34 if bg else 6
    name_size = 63.3
    gap = 33.3
    cy = pad + 50
    # a line box of ascent + descent, centred on the mark: this puts the
    # baseline where the browser puts it in the nav
    baseline = cy - (ASC + DESC) * name_size / UPM / 2 + ASC * name_size / UPM
    text_x = pad + 100 + gap
    text_path, text_w = shaped_path(NAME, name_size, text_x, baseline)
    W = text_x + text_w + pad
    H = 100 + 2 * pad
    back = f'<rect width="{r(W)}" height="{r(H)}" rx="{r(H * 0.12)}" fill="{bg}"/>' if bg else ""
    mark = (
        f'<g transform="translate({pad} {pad})"><rect width="100" height="100" rx="24" fill="#0c0b0a"/>'
        f'<path d="{S_PATH}" fill="#f2f0ec"/><circle cx="{r(DOT["cx"])}" cy="{r(DOT["cy"])}" r="{r(DOT["r"])}" fill="#ff5c26"/></g>'
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {r(W)} {r(H)}" width="{round(height * W / H)}" height="{height}">'
        f'<title>{NAME}</title>{back}{mark}<path d="{text_path}" fill="{name_fg}"/></svg>'
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    groups = []

    marks = []
    for key, (label, bg, fg, dot, note) in PALETTES.items():
        (OUT / f"mark-{key}.svg").write_text(mark_svg(bg, fg, dot), encoding="utf-8")
        # JPG has no transparency, so it gets the full-bleed square
        (OUT / f"mark-{key}-square.svg").write_text(mark_svg(bg, fg, dot, rounded=False), encoding="utf-8")
        marks.append({
            "key": f"mark-{key}", "label": label, "note": note, "bg": bg, "colors": [bg, fg, dot],
            "preview": f"/brand/mark-{key}.svg",
            "files": [
                {"kind": "SVG", "href": f"/brand/mark-{key}.svg"},
                {"kind": "PNG", "href": f"/brand/mark-{key}.png", "from": f"mark-{key}.svg", "size": 1024},
                {"kind": "JPG", "href": f"/brand/mark-{key}.jpg", "from": f"mark-{key}-square.svg", "size": 1024},
            ],
        })
    groups.append({"title": "The mark", "lede": "The S and the dot on its square. Rounded corners as SVG and PNG; the JPG is a full square, since JPG can't be see-through.", "items": marks})

    loose = []
    for key, (label, fg, dot, note) in INKS.items():
        (OUT / f"glyph-{key}.svg").write_text(glyph_svg(fg, dot), encoding="utf-8")
        loose.append({
            "key": f"glyph-{key}", "label": label, "note": note, "bg": None if key == "ink" else "#0c0b0a",
            "colors": [fg, dot], "preview": f"/brand/glyph-{key}.svg",
            "files": [
                {"kind": "SVG", "href": f"/brand/glyph-{key}.svg"},
                {"kind": "PNG", "href": f"/brand/glyph-{key}.png", "from": f"glyph-{key}.svg", "height": 1024},
            ],
        })
    groups.append({"title": "Just the S", "lede": "No square, transparent background. For putting the mark straight onto a photo or a colour.", "items": loose})

    lockups = []
    for key, bg, name_fg, label, note in [
        ("night", "#0c0b0a", "#f2f0ec", "Night", "Mark and name, dark."),
        ("paper", "#faf9f7", "#14130f", "Paper", "Mark and name, light."),
        ("ink", None, "#14130f", "Dark ink", "Transparent, for light backgrounds."),
        ("light", None, "#f2f0ec", "Light ink", "Transparent, for dark backgrounds."),
    ]:
        (OUT / f"lockup-{key}.svg").write_text(lockup_svg(bg, name_fg), encoding="utf-8")
        files = [
            {"kind": "SVG", "href": f"/brand/lockup-{key}.svg"},
            {"kind": "PNG", "href": f"/brand/lockup-{key}.png", "from": f"lockup-{key}.svg", "height": 600},
        ]
        if bg:
            files.append({"kind": "JPG", "href": f"/brand/lockup-{key}.jpg", "from": f"lockup-{key}.svg", "height": 600, "flatten": bg})
        lockups.append({
            "key": f"lockup-{key}", "label": label, "note": note, "bg": bg if bg else (None if key == "ink" else "#0c0b0a"),
            "colors": [c for c in [bg, name_fg, "#ff5c26"] if c], "preview": f"/brand/lockup-{key}.svg", "wide": True, "files": files,
        })
    groups.append({"title": "With my name", "lede": "The mark and the name together, spaced the way the site's top bar spaces them.", "items": lockups})

    avatars = []
    for key in ("night", "paper", "vermilion"):
        label, bg, fg, dot, _ = PALETTES[key]
        (OUT / f"avatar-{key}.svg").write_text(mark_svg(bg, fg, dot, rounded=False, pad=0.14), encoding="utf-8")
        avatars.append({
            "key": f"avatar-{key}", "label": label, "note": "Square, with room for a circular crop.", "bg": bg, "colors": [bg, fg, dot],
            "preview": f"/brand/avatar-{key}.svg", "round": True,
            "files": [
                {"kind": "PNG", "href": f"/brand/avatar-{key}.png", "from": f"avatar-{key}.svg", "size": 1024},
                {"kind": "JPG", "href": f"/brand/avatar-{key}.jpg", "from": f"avatar-{key}.svg", "size": 1024},
            ],
        })
    groups.append({"title": "Profile pictures", "lede": "Full-bleed squares with extra room around the S, so a round crop on LinkedIn or Instagram doesn't clip it.", "items": avatars})

    MANIFEST.write_text(json.dumps({"zip": "/brand/shiva-ganesh-talikota-logo-kit.zip", "groups": groups}, indent=2), encoding="utf-8")
    print(f"wrote {len(list(OUT.glob('*.svg')))} SVGs and {MANIFEST.relative_to(ROOT)}")
    print(f"S baseline {S_BASELINE:.2f}, x {S_X:.2f}")


if __name__ == "__main__" and len(__import__("sys").argv) == 1:
    main()


def zip_kit():
    """Everything in one download, laid out in folders."""
    import zipfile

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    dest = ROOT / "public" / data["zip"].lstrip("/")
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
        for group in data["groups"]:
            folder = group["title"].lower().replace(" ", "-")
            for item in group["items"]:
                for f in item["files"]:
                    src = ROOT / "public" / f["href"].lstrip("/")
                    z.write(src, f"shiva-ganesh-talikota-logo/{folder}/{src.name}")
        z.writestr(
            "shiva-ganesh-talikota-logo/README.txt",
            "Shiva Ganesh Talikota: logo kit\n\n"
            "Night #0c0b0a  Paper #faf9f7  Ink #14130f  Cream #f2f0ec\n"
            "Vermilion #ff5c26 (on dark)  #c93800 (on light)\n\n"
            "Leave at least a quarter of the mark's width clear around it.\n"
            "Don't stretch it, recolour the S, or move the dot.\n\n"
            "https://shivaganeshtalikota.vercel.app/brand\n",
        )
    print(f"wrote {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__" and len(__import__("sys").argv) > 1 and __import__("sys").argv[1] == "zip":
    zip_kit()
