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



# ── the mark as Liquid Glass ─────────────────────────────────────────────
# The same S and dot, made of glass: a dark plate lit from the top left, the
# S as a translucent glass letter with an edge-lit rim, a highlight caught
# inside it and a soft shadow under it, and the dot as a glossy bead of
# vermilion with its own specular spot and glow. Same geometry as the mark.

GLASS_THEMES = {
    # key: plate stops, ambient light, S fill (top, middle, bottom), S rim, shadow, plate rim
    "night": {
        "plate": ["#2a2925", "#131210", "#070706"],
        "ambient": "rgba(255,255,255,0.11)",
        "fill": ["rgba(255,255,255,0.36)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.2)"],
        "rim": ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.16)", "rgba(255,255,255,0.55)"],
        "shadow": ("#000000", 0.6),
        "caught": "rgba(255,255,255,0.5)",
        "edge": ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.28)"],
    },
    "frost": {
        "plate": ["#fbfaf7", "#ebe8e1", "#d9d5cc"],
        "ambient": "rgba(255,255,255,0.7)",
        "fill": ["rgba(255,255,255,0.75)", "rgba(255,255,255,0.28)", "rgba(255,255,255,0.5)"],
        "rim": ["rgba(255,255,255,1)", "rgba(20,19,15,0.28)", "rgba(20,19,15,0.45)"],
        "shadow": ("#5b574e", 0.35),
        "caught": "rgba(255,255,255,0.9)",
        "edge": ["rgba(255,255,255,1)", "rgba(20,19,15,0.06)", "rgba(20,19,15,0.18)"],
    },
}


def glass_svg(theme: str, plate: bool = True, rounded: bool = True, size: int = 1024) -> str:
    t = GLASS_THEMES[theme]
    cx, cy, rr = DOT["cx"], DOT["cy"], DOT["r"]
    rx = ' rx="22.5"' if rounded else ""
    defs = f"""<defs>
<linearGradient id="plate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{t['plate'][0]}"/><stop offset="0.55" stop-color="{t['plate'][1]}"/><stop offset="1" stop-color="{t['plate'][2]}"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.07)"/><stop offset="0.5" stop-color="rgba(255,255,255,0)"/></linearGradient>
<radialGradient id="ambient" cx="0.28" cy="0.16" r="0.8"><stop offset="0" stop-color="{t['ambient']}"/><stop offset="0.65" stop-color="rgba(255,255,255,0)"/></radialGradient>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{t['edge'][0]}"/><stop offset="0.3" stop-color="{t['edge'][1]}"/><stop offset="0.7" stop-color="{t['edge'][1]}"/><stop offset="1" stop-color="{t['edge'][2]}"/></linearGradient>
<linearGradient id="sfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{t['fill'][0]}"/><stop offset="0.5" stop-color="{t['fill'][1]}"/><stop offset="1" stop-color="{t['fill'][2]}"/></linearGradient>
<linearGradient id="srim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{t['rim'][0]}"/><stop offset="0.45" stop-color="{t['rim'][1]}"/><stop offset="1" stop-color="{t['rim'][2]}"/></linearGradient>
<radialGradient id="bead" cx="0.36" cy="0.3" r="0.78"><stop offset="0" stop-color="#ffc9ad"/><stop offset="0.32" stop-color="#ff6a36"/><stop offset="0.78" stop-color="#d63f0e"/><stop offset="1" stop-color="#9a2805"/></radialGradient>
<clipPath id="sclip"><path d="{S_PATH}"/></clipPath>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4"/></filter>
<filter id="blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6"/></filter>
<filter id="tiny" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.45"/></filter>
</defs>"""
    plate_svg = ""
    if plate:
        plate_svg = (
            f'<rect width="100" height="100"{rx} fill="url(#plate)"/>'
            f'<rect width="100" height="100"{rx} fill="url(#ambient)"/>'
            # a faint sheen over the top of the plate that fades out, no edge to it
            f'<rect width="100" height="100"{rx} fill="url(#sheen)"/>'
        )
    shadow_col, shadow_op = t["shadow"]
    body = (
        # the glass letter sits a little above the plate: a soft shadow under it
        f'<g opacity="{shadow_op}" transform="translate(0 2.4)" filter="url(#soft)"><path d="{S_PATH}" fill="{shadow_col}"/></g>'
        # the letter itself, translucent
        f'<path d="{S_PATH}" fill="url(#sfill)"/>'
        # light caught inside the glass: a highlight up top, and a glow along its inner edge
        f'<g clip-path="url(#sclip)">'
        f'<ellipse cx="44" cy="25" rx="17" ry="8.5" fill="{t["caught"]}" filter="url(#soft)"/>'
        f'<path d="{S_PATH}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.6" filter="url(#soft)"/>'
        f"</g>"
        # its rim, lit where the light hits
        f'<path d="{S_PATH}" fill="none" stroke="url(#srim)" stroke-width="0.6"/>'
        # the dot: a bead of vermilion glass, glowing a little, with a specular spot
        f'<circle cx="{r(cx)}" cy="{r(cy + 1.2)}" r="{r(rr * 1.35)}" fill="#ff5c26" opacity="0.32" filter="url(#blur2)"/>'
        f'<circle cx="{r(cx)}" cy="{r(cy)}" r="{r(rr)}" fill="url(#bead)"/>'
        f'<ellipse cx="{r(cx - 2.1)}" cy="{r(cy - 2.5)}" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.85)" filter="url(#tiny)"/>'
        f'<circle cx="{r(cx)}" cy="{r(cy)}" r="{r(rr - 0.2)}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.35"/>'
    )
    rim_svg = f'<rect x="0.35" y="0.35" width="99.3" height="99.3" rx="22.2" fill="none" stroke="url(#edge)" stroke-width="0.7"/>' if (plate and rounded) else ""
    if plate:
        view = 'viewBox="0 0 100 100"'
        dims = f'width="{size}" height="{size}"'
    else:
        # just the glass S and bead, trimmed to their bounds with room for the glow
        x0, y0 = S_X + 41 * S_SIZE / UPM - 5, S_BASELINE - 730 * S_SIZE / UPM - 5
        # leave room for the bead's glow on the right and below, or it gets cut off square
        x1, y1 = cx + rr * 2.6, max(S_BASELINE + 9 * S_SIZE / UPM + 6, cy + rr * 2.6)
        w, h = x1 - x0, y1 - y0
        view = f'viewBox="{r(x0)} {r(y0)} {r(w)} {r(h)}"'
        dims = f'width="{round(size * w / h)}" height="{size}"'
    return f'<svg xmlns="http://www.w3.org/2000/svg" {view} {dims}><title>{NAME}</title>{defs}{plate_svg}{body}{rim_svg}</svg>'

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

    # the same mark in Liquid Glass: an addition, the originals above are untouched
    glass = []
    for key, label, note, bg in [
        ("night", "Glass night", "The S in glass on a dark plate. The app-icon version.", "#0c0b0a"),
        ("frost", "Glass frost", "The same glass, on a light frosted plate.", "#f2f0ea"),
    ]:
        (OUT / f"glass-{key}.svg").write_text(glass_svg(key), encoding="utf-8")
        (OUT / f"glass-{key}-square.svg").write_text(glass_svg(key, rounded=False), encoding="utf-8")
        glass.append({
            "key": f"glass-{key}", "label": label, "note": note, "bg": bg,
            "colors": [GLASS_THEMES[key]["plate"][1], "#ff5c26"],
            "preview": f"/brand/glass-{key}.svg",
            "files": [
                {"kind": "SVG", "href": f"/brand/glass-{key}.svg"},
                {"kind": "PNG", "href": f"/brand/glass-{key}.png", "from": f"glass-{key}.svg", "size": 1024},
                {"kind": "JPG", "href": f"/brand/glass-{key}.jpg", "from": f"glass-{key}-square.svg", "size": 1024},
            ],
        })
    (OUT / "glass-clear.svg").write_text(glass_svg("night", plate=False), encoding="utf-8")
    glass.append({
        "key": "glass-clear", "label": "Glass, no plate", "note": "Just the glass S and bead, see-through. For dark photos and backgrounds.",
        "bg": "#1c1b18", "colors": ["#ffffff", "#ff5c26"], "preview": "/brand/glass-clear.svg",
        "files": [
            {"kind": "SVG", "href": "/brand/glass-clear.svg"},
            {"kind": "PNG", "href": "/brand/glass-clear.png", "from": "glass-clear.svg", "height": 1024},
        ],
    })
    groups.append({"title": "Liquid glass", "lede": "The same S, made of glass: a translucent letter with light caught inside it and a glossy vermilion bead, on a softly lit plate. For app icons, profile pictures and anywhere the flat mark feels too plain.", "items": glass})

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
