# landing.fibe.gg

A tiny, static single-page **marketing landing** for Fibe — the message of the
"Employee of the Month" video in a page: _develop locally → deploy live in one
command → delegate the busywork to AI agents._ Part of the
why / whats / faq / when family, sharing its **"Phoenix Terminal"** palette and
type system.

## How it works

The page is **generated** from two sources of truth:

| Source             | Role                                              |
| ------------------ | ------------------------------------------------- |
| `template.html`    | Structure only — text-less `[data-i18n]` markers  |
| `assets/i18n.json` | All copy, per locale (`en`, `uk`)                 |

`scripts/build-locales.mjs` fills the template per locale and writes:

- `index.html` — default locale (`en`), at the root
- `uk/index.html` — Ukrainian

## Develop

```bash
npm install
npm run dev          # http://localhost:5183  (uk: /uk/)
```

`npm run dev` serves the folder, rebuilds on changes to `template.html` /
`assets/i18n.json`, and hot-reloads the browser on any edit.

## Edit copy

Edit `assets/i18n.json` (per locale: `en`, `uk`), then:

```bash
npm run build:locales
```

## Sections

- **Hero** — the headline ("Make your SDLC AI-native — in minutes.") + CTAs.
- **Flow** — three cards: **Develop · Deploy · Delegate** (the video's arc).
- **CTA card** — "Ready to go AI-native?" → fibe.gg / GitHub.
- Shared header + footer (Fibe family links, social, support Ukraine, legal).

Styling lives in `assets/style.css` (shared Phoenix Terminal system + a small
`.flow` block at the end); behavior (mobile drawer, footer year) in
`assets/script.js`.
