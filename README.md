# ai-native.fibe.gg

A tiny, static single-page **marketing landing** for Fibe — the message of the
"Employee of the Month" video in a page: _become AI-native in 3 steps —
**dockerize** your app → **deploy** to Fibe in one command → **chat** with your
LLM to ship changes._ Part of the why / whats / faq / when family, sharing its
**"Phoenix Terminal"** palette and type system.

## Source of truth

`index.html` is **hand-authored** and is the single source of truth — there is
no build step. Edit it directly. `assets/style.css` holds the styling (shared
Phoenix Terminal system) and `assets/script.js` the behavior (mobile drawer,
footer year, scroll-spy).

## Develop

```bash
npm run dev          # http://localhost:5183
```

`npm run dev` serves the folder and hot-reloads open tabs when you edit
`index.html`, `assets/style.css`, or `assets/script.js`. (No dependencies — it
shells out to `python3 -m http.server`.)

## Sections

- **Hero** — the headline ("Become AI-native in 3 steps") + demo video + "Step One" CTA.
- **1 · Dockerize** — `docker-compose.yml`, runs locally like production → "Step Two".
- **2 · Deploy** — a few compose labels + one command → an isolated live URL → "Final Step".
- **3 · Chat** — describe changes to your LLM; closes with Start on Fibe / See FAQ.
- Shared header + footer (Fibe family links, social, support Ukraine, legal).

Each act has a faint Phoenix-Terminal watermark: `docker.svg` whale (Dockerize),
the phoenix raster (Deploy), `LLM.svg` neural net (Chat).

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which publishes the
repo as-is to **GitHub Pages** at `ai-native.fibe.gg` (custom domain via `CNAME`).
