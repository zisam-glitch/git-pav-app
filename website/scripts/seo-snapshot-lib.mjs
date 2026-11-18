// Helpers for scripts/seo-snapshot.mjs, which records what search engines see
// on a site so a new build can be checked against it before the domain moves.
// Everything here is a pure function except extractPageSeo, which runs inside
// the page and so must not reference anything outside its own body.
import { createHash } from "node:crypto";

/** Paths with these endings are files, not pages: kept as links, never rendered. */
const FILE_PATH =
  /\.(?:pdf|jpe?g|png|gif|webp|avif|svg|ico|mp4|webm|mov|mp3|zip|docx?|xlsx?|pptx?|csv|txt|xml|json|js|css|woff2?)$/i;

/**
 * Hosts a snapshot never contacts: analytics and ad beacons, so a crawl is not
 * counted as visits to the practice, and video embeds, which are slow and add
 * nothing a search engine reads from the page itself.
 */
const BLOCKED_HOSTS = [
  "google-analytics.com",
  "googletagmanager.com",
  "doubleclick.net",
  "facebook.net",
  "facebook.com",
  "analytics.tiktok.com",
  "clarity.ms",
  "hotjar.com",
  "youtube.com",
  "youtube-nocookie.com",
  "ytimg.com",
  "googlevideo.com",
];

/** Images, video and fonts are skipped too: their URLs and alt text stay in the page. */
const BLOCKED_TYPES = new Set(["image", "media", "font"]);

export function shouldBlockRequest(url, resourceType) {
  if (BLOCKED_TYPES.has(resourceType)) return true;
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

/** "www.pavdental.com" and "pavdental.com" are the same site. */
export function bareHost(hostname) {
  return String(hostname).toLowerCase().replace(/^www\./, "");
}

/** One spelling per page: no repeated slashes and no trailing slash (except "/"). */
export function normalizePath(pathname) {
  let path = String(pathname || "/");
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
}

/**
 * The page path a link points to on `origin`'s site, or null when the link
 * leaves the site, is not http(s) (mailto:, tel:) or points at a file. The
 * query string and #fragment are dropped: the live site does not use them for
 * separate pages.
 */
export function internalPath(href, origin) {
  let url;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (bareHost(url.hostname) !== bareHost(new URL(origin).hostname)) return null;
  if (FILE_PATH.test(url.pathname)) return null;
  return normalizePath(url.pathname);
}

/** A file name for a path: "/" is "home", "/services/whitening" is "services--whitening". */
export function slugForPath(path) {
  const normalized = normalizePath(path);
  if (normalized === "/") return "home";
  return normalized
    .slice(1)
    .replace(/\//g, "--")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Page text with spaces collapsed and blank lines squeezed, so diffs show real changes only. */
export function normalizeText(text) {
  const lines = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim());
  return lines
    .filter((line, i) => line !== "" || (i > 0 && lines[i - 1] !== ""))
    .join("\n")
    .trim();
}

export const SIGNERS_OMITTED = "[signer names and dates are not kept in this recording]";

const SIGNED_DATE = /^\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/;

/**
 * The live petition page lists the people who signed, by name and date. Those names are
 * personal data, so the recording keeps the heading (it carries the count) and drops the list.
 * The list is a "Signatures" / "Date" header, then a name line and a date line for each signer.
 * Page text that has no such list comes back unchanged.
 */
export function redactSigners(text) {
  const lines = String(text ?? "").split("\n");
  const start = lines.findIndex((line) => /^Petition Signatures \(\d+\)$/.test(line.trim()));
  if (start < 0) return String(text ?? "");
  let end = start + 1;
  while (end < lines.length && /^(Signatures|Date)$/.test(lines[end].trim())) end += 1;
  while (end + 1 < lines.length && SIGNED_DATE.test(lines[end + 1].trim())) end += 2;
  return [...lines.slice(0, start + 1), SIGNERS_OMITTED, ...lines.slice(end)].join("\n");
}

/** The same for content blocks, where each signer is one "name\ndate" list item. */
export function redactSignerBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.filter((block) => !(block?.tag === "li" && /\n/.test(block.text ?? "") && SIGNED_DATE.test(block.text.split("\n").pop().trim())));
}

export function wordCount(text) {
  const words = normalizeText(text).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return words ? words.length : 0;
}

export function textHash(text) {
  return createHash("sha256").update(normalizeText(text)).digest("hex").slice(0, 16);
}

/** The <loc> URLs of a sitemap, in document order. */
export function sitemapLocs(xml) {
  return Array.from(String(xml ?? "").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g), (m) => m[1]);
}

/**
 * Proxy settings for Playwright from the usual environment variables. A
 * sandbox or corporate network may only allow traffic through a proxy; CI
 * sets none, and this returns undefined there.
 */
export function proxyFromEnv(env = process.env) {
  const raw =
    env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || env.ALL_PROXY || env.all_proxy;
  if (!raw) return undefined;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return undefined;
  }
  const proxy = { server: `${url.protocol}//${url.host}` };
  if (url.username) proxy.username = decodeURIComponent(url.username);
  if (url.password) proxy.password = decodeURIComponent(url.password);
  const bypass = env.NO_PROXY || env.no_proxy;
  if (bypass) proxy.bypass = bypass;
  return proxy;
}

/**
 * Runs inside the page. The page's content as blocks in reading order, for
 * porting it word for word: headings, paragraphs, list items, links, buttons,
 * tables (with their rows) and images with their alt text. A block that holds
 * links inside its text lists them in `links`, with the text each one wraps,
 * so a ported paragraph keeps its internal links. The site header and footer
 * are left out, and so is nothing else: text hidden in a collapsed accordion
 * (FAQ answers) is kept, because search engines read it too.
 */
export function extractContentBlocks() {
  const CHROME = "header, footer, .st-site-header, .st-site-footer, script, style, noscript, svg, template";
  const BLOCK = /^(H[1-6]|P|LI|BLOCKQUOTE|TD|TH|DT|DD|FIGCAPTION|BUTTON|LABEL|A|SUMMARY)$/;
  // Visible text keeps its line breaks (points of a policy written with <br>).
  // Text in a closed <details> or other collapsed accordion has no rendered
  // text, so it falls back to the raw text, which search engines still read.
  const textOf = (el) =>
    String(el.innerText?.trim() ? el.innerText : el.textContent)
      .split("\n")
      .map((line) => line.replace(/[ \t\u00a0]+/g, " ").trim())
      .filter(Boolean)
      .join("\n");
  const taken = new Set();
  const blocks = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest(CHROME)) continue;
    let covered = false;
    for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
      if (taken.has(up)) {
        covered = true;
        break;
      }
    }
    if (covered) continue;
    if (el.tagName === "IMG") {
      const src = el.getAttribute("src");
      if (src) blocks.push({ tag: "img", src: new URL(src, location.href).href, alt: el.getAttribute("alt") });
      continue;
    }
    if (el.tagName === "TABLE") {
      const rows = Array.from(el.rows, (row) => Array.from(row.cells, (cell) => textOf(cell).replace(/\n/g, " ")));
      if (rows.length > 0) {
        taken.add(el);
        const header = Boolean(el.tHead) || Array.from(el.rows[0]?.cells ?? []).every((cell) => cell.tagName === "TH");
        blocks.push({ tag: "table", header, rows });
      }
      continue;
    }
    const ownText = Array.from(el.childNodes).some((node) => node.nodeType === 3 && node.textContent.trim());
    if (!ownText && !BLOCK.test(el.tagName)) continue;
    const text = textOf(el);
    if (!text) continue;
    taken.add(el);
    const block = { tag: el.tagName.toLowerCase(), text };
    if (el.tagName === "A" && el.getAttribute("href")) block.href = new URL(el.getAttribute("href"), location.href).href;
    if (el.tagName !== "A") {
      const links = Array.from(el.querySelectorAll("a[href]"), (a) => ({
        text: textOf(a).replace(/\n/g, " "),
        href: new URL(a.getAttribute("href"), location.href).href,
      })).filter((link) => link.text);
      if (links.length > 0) block.links = links;
    }
    blocks.push(block);
  }
  return blocks;
}

/**
 * Runs inside the page, after JavaScript (the live site sets its tags with
 * react-helmet, so the raw HTML has none of them). Collects everything a
 * search engine reads: tags, structured data, headings, links, images, text.
 * Every tag is listed, not just the first, so duplicates show up.
 */
export function extractPageSeo() {
  const clean = (value) =>
    String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();
  const contents = (selector) =>
    Array.from(document.querySelectorAll(selector), (el) => el.getAttribute("content")).filter(
      (value) => value !== null,
    );
  const firstByKey = (selector, keyAttr) => {
    const out = {};
    for (const el of document.querySelectorAll(selector)) {
      const key = el.getAttribute(keyAttr);
      if (key && !(key in out)) out[key] = el.getAttribute("content");
    }
    return out;
  };
  const absolute = (value) => {
    if (!value) return null;
    try {
      return new URL(value, location.href).href;
    } catch {
      return value;
    }
  };
  return {
    title: document.title,
    // Only the head's <title>: icons drawn as inline SVG carry <title> elements too.
    titles: Array.from(document.head.querySelectorAll("title"), (t) => clean(t.textContent)),
    descriptions: contents('meta[name="description"]'),
    canonicals: Array.from(document.querySelectorAll('link[rel="canonical"]'), (link) =>
      absolute(link.getAttribute("href")),
    ),
    robots: contents('meta[name="robots"]'),
    lang: document.documentElement.getAttribute("lang"),
    og: firstByKey('meta[property^="og:"]', "property"),
    twitter: firstByKey('meta[name^="twitter:"]', "name"),
    jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (script) => {
      try {
        return JSON.parse(script.textContent || "");
      } catch {
        return { unparsable: clean(script.textContent).slice(0, 200) };
      }
    }),
    h1: Array.from(document.querySelectorAll("h1"), (h) => clean(h.textContent)).filter(Boolean),
    h2: Array.from(document.querySelectorAll("h2"), (h) => clean(h.textContent)).filter(Boolean),
    links: Array.from(document.querySelectorAll("a[href]"), (a) => ({
      href: absolute(a.getAttribute("href")),
      text: clean(a.textContent).slice(0, 120),
    })),
    images: Array.from(document.querySelectorAll("img"), (img) => ({
      src: absolute(img.getAttribute("src")),
      alt: img.getAttribute("alt"),
    })),
    bodyText: document.body ? document.body.innerText : "",
  };
}
