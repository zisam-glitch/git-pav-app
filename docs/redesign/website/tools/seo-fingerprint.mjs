// In-browser SEO fingerprint of every recorded live page (plus a few pages only the new site has), to prove that a
// redesign leaves SEO unchanged: status, title, description, canonical, robots, Open Graph and Twitter tags,
// structured data, headings, links, image alt text and word count, read from the server-rendered HTML the way
// `npm run seo:parity` does (same parser). The shell sandbox cannot reach localhost, so load it from a browser tab
// that is on the dev server's origin (page fetches are then same-origin):
//
//   const f = await import("http://localhost:8099/parity/fingerprint.js");
//   await f.save("before");                          // once, BEFORE changing anything (kept in this browser's localStorage)
//   await f.compare({ only: ["/about", "/blog"] });  // later: diff against "before" (leave out `only` for every page)
//
// FAIL = a head tag, structured data, status or H1 changed: never acceptable in a redesign.
// WARN = a heading, link, image alt text or a tenth of the words went missing: restore it or explain it in your report.
import { parsePage } from "./seo-parity-lib.mjs";
import { wordCount } from "./seo-snapshot-lib.mjs";

const SEED = "http://localhost:8099";
const KEY = (name) => `pav-seo-fingerprint:${name}`;
// Pages only the new site has (the live baseline cannot list them); a product and a category page are found on /shop.
const EXTRA_PATHS = ["/blog/all", "/cart", "/checkout", "/reset-password", "/verify-email", "/fingerprint-no-such-page"];
const FAIL_FIELDS = ["error", "status", "location", "lang", "titles", "descriptions", "canonicals", "robots", "og", "twitter", "jsonLdTypes", "jsonLd", "h1"];
const WARN_LISTS = ["h2", "h3", "links", "external", "alts"];

const squash = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}

async function pagePaths(base) {
  const baseline = await (await fetch(`${SEED}/seo/live-baseline.json`)).json();
  const paths = baseline.pages.filter((page) => !page.error).map((page) => page.path);
  const shop = await (await fetch(`${base}/shop`)).text();
  const first = (prefix) => (shop.match(new RegExp(`href="(${prefix}/[^"/?#]+)"`)) ?? [])[1];
  return [...new Set([...paths, ...EXTRA_PATHS, first("/shop"), first("/category")].filter(Boolean))];
}

async function fingerprintPage(base, path) {
  let res;
  try {
    res = await fetch(base + path, { headers: { "user-agent": "pav-seo-fingerprint" } });
  } catch (error) {
    return { error: String(error) };
  }
  const html = await res.text();
  const page = parsePage(html);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const metas = [...doc.querySelectorAll("meta")];
  const tagged = (attr, prefix) =>
    Object.fromEntries(
      metas
        .filter((meta) => (meta.getAttribute(attr) ?? "").toLowerCase().startsWith(prefix))
        .map((meta) => [meta.getAttribute(attr).toLowerCase(), squash(meta.getAttribute("content"))])
        .sort(),
    );
  const jsonLd = [...doc.querySelectorAll('script[type="application/ld+json"]')].map((script) => {
    try {
      return hash(JSON.stringify(stable(JSON.parse(script.textContent))));
    } catch {
      return "unparseable";
    }
  });
  const external = [...new Set([...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((href) => /^https?:\/\//i.test(href) && !href.startsWith("https://www.pavdental.com")))].sort();
  return {
    status: res.redirected ? 308 : res.status,
    location: res.redirected ? new URL(res.url).pathname : null,
    lang: doc.documentElement.getAttribute("lang") ?? "",
    titles: page.titles,
    descriptions: page.descriptions,
    canonicals: page.canonicals,
    robots: page.robots,
    og: tagged("property", "og:"),
    twitter: tagged("name", "twitter:"),
    jsonLdTypes: page.jsonLdTypes,
    jsonLd,
    h1: page.h1,
    h2: page.h2,
    h3: [...doc.querySelectorAll("h3")].map((h) => squash(h.textContent)),
    links: page.internalLinks,
    external,
    alts: [...doc.querySelectorAll("img")].map((img) => squash(img.getAttribute("alt"))).sort(),
    words: wordCount(page.text),
  };
}

async function collect(base, only) {
  const paths = (await pagePaths(base)).filter((path) => !only || only.includes(path));
  const pages = {};
  for (const path of paths) pages[path] = await fingerprintPage(base, path);
  return pages;
}

/** Record the current site under `name` in this browser's localStorage (origin of the tab it runs in). */
export async function save(name = "before", { base = "" } = {}) {
  const pages = await collect(base, null);
  const payload = JSON.stringify({ savedAt: new Date().toISOString(), pages });
  localStorage.setItem(KEY(name), payload);
  return `saved "${name}": ${Object.keys(pages).length} pages, ${Math.round(payload.length / 1024)} KB, in localStorage of ${location.origin}`;
}

// Items of `before` that `after` has fewer copies of (a multiset difference).
function missing(before, after) {
  const have = new Map();
  for (const item of after) have.set(item, (have.get(item) ?? 0) + 1);
  const gone = [];
  for (const item of before) {
    const n = have.get(item) ?? 0;
    if (n > 0) have.set(item, n - 1);
    else gone.push(item);
  }
  return gone;
}

/** Diff the current site (or `only` some pages) against the fingerprint saved as `name`. */
export async function compare({ only = null, name = "before", base = "", verbose = true } = {}) {
  const stored = localStorage.getItem(KEY(name));
  if (!stored) return `no "${name}" fingerprint in localStorage of ${location.origin}: run save("${name}") on the original site first`;
  const before = JSON.parse(stored).pages;
  const after = await collect(base, only);
  const lines = [];
  let fails = 0;
  let warns = 0;
  for (const [path, now] of Object.entries(after)) {
    const was = before[path];
    if (!was) {
      lines.push(`NEW  ${path}`);
      continue;
    }
    const failed = FAIL_FIELDS.filter((field) => JSON.stringify(was[field]) !== JSON.stringify(now[field])).map(
      (field) => `${field}: ${JSON.stringify(was[field])} -> ${JSON.stringify(now[field])}`,
    );
    const warned = [];
    for (const field of WARN_LISTS) {
      const gone = missing(was[field] ?? [], now[field] ?? []);
      if (gone.length) warned.push(`${field} removed (${gone.length}): ${gone.slice(0, 12).map((item) => JSON.stringify(item)).join(", ")}`);
    }
    const change = was.words ? (now.words - was.words) / was.words : 0;
    if (change < -0.1) warned.push(`words ${was.words} -> ${now.words} (${Math.round(change * 100)}%)`);
    if (failed.length) fails += 1;
    else if (warned.length) warns += 1;
    const mark = failed.length ? "FAIL" : warned.length ? "WARN" : "OK  ";
    if (failed.length || warned.length || verbose) lines.push(`${mark} ${path}  words ${was.words ?? "-"} -> ${now.words ?? "-"}`);
    for (const detail of [...failed.map((d) => `FAIL ${d}`), ...warned.map((d) => `WARN ${d}`)]) lines.push(`       ${detail}`);
  }
  if (!only) for (const path of Object.keys(before)) if (!(path in after)) lines.push(`GONE ${path}`);
  lines.push(`${Object.keys(after).length} pages compared with "${name}": ${fails} FAIL, ${warns} WARN`);
  return lines.join("\n");
}
