#!/usr/bin/env node
// Generate per-locale static HTML from template.html + assets/i18n.json.
//
//   template.html             ← structure only (text-less [data-i18n] elements)
//   assets/i18n.json          ← every text string, per locale
//   ───────────────────────────────────────────────────────────────
//   index.html                ← generated (default locale, root)
//   <locale>/index.html       ← generated (every other locale)
//
// Run after editing template.html or assets/i18n.json:
//   $ npm run build:locales

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "node-html-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATE_PATH = path.join(ROOT, "template.html");
const I18N_PATH = path.join(ROOT, "assets/i18n.json");

const DEFAULT_LOCALE = "en";
const SITE_ORIGIN = "https://landing.fibe.gg";

const lookup = (dict, dottedKey) => {
  let cur = dict;
  for (const p of dottedKey.split(".")) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
};

const i18n = JSON.parse(fs.readFileSync(I18N_PATH, "utf8"));
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

const locales = Object.keys(i18n);
if (!locales.includes(DEFAULT_LOCALE)) {
  console.error(`✗ i18n.json missing required default locale "${DEFAULT_LOCALE}".`);
  process.exit(1);
}

const missingByLocale = {};

for (const locale of locales) {
  const dict = i18n[locale];
  if (!dict) continue;
  missingByLocale[locale] = [];

  const root = parse(template, {
    comment: true,
    blockTextElements: { script: true, style: true },
  });

  // 1. Fill every [data-i18n] element with its translation (HTML allowed).
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const v = lookup(dict, key);
    if (typeof v === "string") el.set_content(v);
    else missingByLocale[locale].push(key);
  });

  // 2. Fill [data-i18n-attr] targets ("attr=key;attr2=key2").
  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr");
    spec.split(";").forEach((pair) => {
      const eq = pair.indexOf("=");
      if (eq === -1) return;
      const attr = pair.slice(0, eq).trim();
      const key = pair.slice(eq + 1).trim();
      const v = lookup(dict, key);
      if (typeof v === "string") el.setAttribute(attr, v);
      else missingByLocale[locale].push(`${key} (→ ${attr})`);
    });
  });

  // 3. <html lang/data-locale>.
  const htmlEl = root.querySelector("html");
  if (htmlEl) {
    htmlEl.setAttribute("lang", locale);
    htmlEl.setAttribute("data-locale", locale);
  }

  // 4. <link rel="canonical"> per locale.
  const canonical = root.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute(
      "href",
      locale === DEFAULT_LOCALE ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${locale}/`
    );
  }

  // 5. Output: default → /index.html, others → /<loc>/index.html.
  const outPath =
    locale === DEFAULT_LOCALE
      ? path.join(ROOT, "index.html")
      : path.join(ROOT, locale, "index.html");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, root.toString(), "utf8");
  console.log(`✓ ${path.relative(ROOT, outPath)} (${locale})`);
}

let totalMissing = 0;
for (const [loc, missing] of Object.entries(missingByLocale)) {
  if (!missing.length) continue;
  totalMissing += missing.length;
  console.log(`\n⚠  Locale "${loc}" missing ${missing.length} keys:`);
  for (const k of missing.slice(0, 10)) console.log(`   - ${k}`);
  if (missing.length > 10) console.log(`   …and ${missing.length - 10} more.`);
}

console.log(
  `\nDone. Built ${locales.length} locale${locales.length === 1 ? "" : "s"}.` +
    (totalMissing ? ` ${totalMissing} missing keys total.` : "")
);
