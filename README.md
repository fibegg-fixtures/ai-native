# ai-native.fibe.gg

A tiny, static single-page **marketing landing** for Fibe — the message of the
"Employee of the Month" video in a page: _become AI-native in 3 steps —
**dockerize** your app → **deploy** to Fibe in one command → **chat** with your
LLM to ship changes._ Part of the why / whats / faq / when family, sharing its
**"Phoenix Terminal"** palette and type system.

## How it works

The page is **generated** from two sources of truth:

| Source             | Role                                              |
| ------------------ | ------------------------------------------------- |
| `template.html`    | Structure only — text-less `[data-i18n]` markers  |
| `assets/i18n.json` | All copy, per locale (`en`)                        |

`scripts/build-locales.mjs` fills the template per locale and writes:

- `index.html` — default locale (`en`), at the root

## Develop

```bash
npm install
npm run dev          # http://localhost:5183
```

`npm run dev` serves the folder, rebuilds on changes to `template.html` /
`assets/i18n.json`, and hot-reloads the browser on any edit.

## Edit copy

Edit `assets/i18n.json`, then:

```bash
npm run build:locales
```

## Sections

- **Hero** — the headline ("Become AI-native in 3 steps") + demo video + CTA.
- **1 · Dockerize** — `docker-compose.yml`, runs locally like production.
- **2 · Deploy** — a few compose labels + one command → an isolated live URL.
- **3 · Chat** — describe changes to your LLM; it ships to the playground / PR.
- **CTA card** — "Ready to go AI-native?" → fibe.gg / FAQ.
- Shared header + footer (Fibe family links, social, support Ukraine, legal).

Styling lives in `assets/style.css` (shared Phoenix Terminal system); behavior
(mobile drawer, footer year, scroll-spy) in `assets/script.js`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
locales and publishes to **GitHub Pages** at `ai-native.fibe.gg` (custom domain
set via `CNAME`).
