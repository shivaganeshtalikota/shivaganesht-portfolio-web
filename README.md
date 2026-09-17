# shivaganesht-portfolio-web

Personal portfolio of **Shiva Ganesh Talikota** — Founder & Product Engineer, Hyderabad.

Live at **[shivaganeshtalikota.vercel.app](https://shivaganeshtalikota.vercel.app)**

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Motion | `motion` v13 |
| Theming | `next-themes`, light/dark/system with no flash |
| Hosting | Vercel |

Every route is statically prerendered.

## Design

An Apple / iOS design language, built from system values rather than approximations:

- **Type** — real SF Pro on Apple devices via `-apple-system`, Inter tuned to match elsewhere. Negative tracking at display sizes (`-0.028em`), matching Apple's own scale.
- **Colour** — Apple's system palette and the full label/fill/separator alpha ladder, defined for both schemes. Dark mode uses `#000` for base and `#1C1C1E` for elevated surfaces, as iOS does.
- **Materials** — frosted glass via `backdrop-filter: saturate(180%) blur(20px)` over a semi-transparent layer with a hairline border.
- **Motion** — Apple's easing curves as exact cubic-béziers; the reveal curve is `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Accessibility** — zero contrast failures, full `prefers-reduced-motion` support, visible focus rings, labelled controls.

## Pages

| Route | What's on it |
|---|---|
| `/` | Hero, stats, selected work, speaking rail, recognition |
| `/about` | Long-form bio, education, skills |
| `/projects` | Four live builds + earlier work |
| `/experience` | Role timeline and education |
| `/speaking` | 10 events, 31 photographs, keyboard-navigable lightbox |
| `/awards` | Awards, recognition, certifications |
| `/contact` | Composer form (mailto — no backend) + links |

## Content

All site copy lives in [`src/data/site.ts`](src/data/site.ts) — one file, one source of truth. Event
photography and its metadata are in [`src/data/media.json`](src/data/media.json), generated from the
original event archive and optimised to WebP (28 MB → 4.9 MB).

Claims are stated precisely and deliberately: participation is not described as a win, and
unverified figures are not published.

## Local development

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build   # production build
npm start       # serve the build
```

## Notes

- The contact form composes a message in the visitor's own mail client. Nothing is sent through
  the site and nothing is stored.
- `_source/` holds the original high-resolution photography and documents. It is gitignored.
