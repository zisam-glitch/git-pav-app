// Helpers for scripts/seo-parity.mjs, which compares a build of this site with the recorded
// live site (seo/live-baseline.json and seo/live-text/) before the domain moves.
// Everything here is a pure function, so scripts/seo-parity-lib.test.mjs loads it directly.
import { internalPath, normalizeText } from "./seo-snapshot-lib.mjs";

export const LIVE_ORIGIN = "https://www.pavdental.com";

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201d",
  ldquo: "\u201c",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  pound: "\u00a3",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
  middot: "\u00b7",
  bull: "\u2022",
  times: "\u00d7",
  eacute: "\u00e9",
};

export function decodeEntities(text) {
  return String(text ?? "").replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (whole, dec, hex, name) => {
    if (dec || hex) {
      const code = dec ? Number(dec) : Number.parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[name.toLowerCase()] ?? whole;
  });
}

/** Tags that start a new line when a browser prints a page's text; every other tag is inline. */
const BLOCK_TAG =
  /<\/?(?:address|article|aside|blockquote|br|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|option|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi;

function attributes(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const name = m[1].toLowerCase();
    attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

function openingTags(html, name) {
  const found = [];
  for (const m of html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))) found.push(attributes(m[1]));
  return found;
}

/**
 * The text of an HTML fragment: everything outside tags. It reads the fragment once, from "<" to
 * the next ">", instead of stripping tags with a pattern, which can leave a tag behind
 * ("<scr<script>ipt>"). The result is only ever compared as plain text, never put back in a page.
 * Server-rendered HTML escapes "<" and ">" in text and attribute values, so a raw "<" starts a tag.
 */
function removeTags(html) {
  let text = "";
  let at = 0;
  while (at < html.length) {
    const open = html.indexOf("<", at);
    if (open === -1) return text + html.slice(at);
    text += html.slice(at, open);
    const close = html.indexOf(">", open + 1);
    if (close === -1) return text;
    at = close + 1;
  }
  return text;
}

function elementTexts(html, name) {
  const found = [];
  for (const m of html.matchAll(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "gi"))) {
    const text = decodeEntities(removeTags(m[1])).replace(/\s+/g, " ").trim();
    if (text) found.push(text);
  }
  return found;
}

function jsonLdTypes(html) {
  const types = new Set();
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    const type = node["@type"];
    for (const t of Array.isArray(type) ? type : type ? [type] : []) types.add(String(t));
    Object.values(node).forEach(visit);
  };
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(m[1]));
    } catch {
      types.add("(unreadable)");
    }
  }
  return [...types].sort();
}

/** What a search engine reads from a page's server-rendered HTML. `origin` resolves its links. */
export function parsePage(html, origin = LIVE_ORIGIN) {
  const source = String(html ?? "");
  const head = source.split(/<body\b/i)[0];
  const metas = openingTags(head, "meta");
  const content = (predicate) => metas.filter(predicate).map((meta) => (meta.content ?? "").trim());
  const linkTags = openingTags(source, "link");
  const anchorPaths = [];
  for (const a of openingTags(source, "a")) {
    const path = a.href ? internalPath(a.href, origin) : null;
    if (path) anchorPaths.push(path);
  }
  const images = openingTags(source, "img");
  // The words in the body only: the title and meta tags in the head are not page text.
  const bodyStart = source.search(/<body\b/i);
  const text = normalizeText(
    decodeEntities(
      removeTags(
        (bodyStart >= 0 ? source.slice(bodyStart) : source)
          .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi, " ")
          .replace(/<!--[\s\S]*?-->/g, " ")
          .replace(BLOCK_TAG, "\n"),
      ),
    ),
  );
  return {
    titles: elementTexts(head, "title"),
    descriptions: content((meta) => meta.name?.toLowerCase() === "description"),
    canonicals: linkTags.filter((link) => link.rel?.toLowerCase() === "canonical").map((link) => link.href ?? ""),
    robots: content((meta) => meta.name?.toLowerCase() === "robots"),
    h1: elementTexts(source, "h1"),
    h2: elementTexts(source, "h2"),
    jsonLdTypes: jsonLdTypes(source),
    internalLinks: [...new Set(anchorPaths)].sort(),
    images: { total: images.length, missingAlt: images.filter((img) => !(img.alt ?? "").trim()).length },
    text,
  };
}

/** Text compared without typography: one kind of quote and dash, one space, no capitals. */
export function normalizeForMatch(text) {
  return String(text ?? "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u201b\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201f\u2033]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The sentences and lines of a live page's text, normalised for matching. A line of at most 220
 * characters is one unit; a longer one is split into sentences. Units under 12 characters or
 * 3 words (menu items, buttons) are left out, and so are repeats.
 */
export function liveUnits(text) {
  const units = new Set();
  for (const line of String(text ?? "").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const pieces = trimmed.length <= 220 ? [trimmed] : trimmed.split(/(?<=[.!?])\s+(?=[A-Z0-9"'\u201c(])/);
    for (const piece of pieces) {
      const unit = normalizeForMatch(piece);
      if (unit.length >= 12 && unit.split(" ").length >= 3) units.add(unit);
    }
  }
  return [...units];
}

/** Units that appear on at least `minPages` live pages: header, footer and form text. */
export function sharedUnits(unitsByPath, minPages = 10) {
  const counts = new Map();
  for (const units of unitsByPath.values()) {
    for (const unit of units) counts.set(unit, (counts.get(unit) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count >= minPages).map(([unit]) => unit));
}

/**
 * How much of a live page's own text a page has. Shared units are left out of the ratio, so the
 * header and footer do not make a page that lost its content look complete.
 */
export function coverage(units, pageText, shared = new Set()) {
  const haystack = normalizeForMatch(pageText);
  const specific = units.filter((unit) => !shared.has(unit));
  const missing = specific.filter((unit) => !haystack.includes(unit));
  const specificFound = specific.length - missing.length;
  return {
    total: units.length,
    found: units.filter((unit) => haystack.includes(unit)).length,
    specificTotal: specific.length,
    specificFound,
    ratio: specific.length === 0 ? 1 : specificFound / specific.length,
    missing,
  };
}

const squash = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

/**
 * The links the live site carries on nearly every page: its header and footer. A page of the new
 * site that lacks one has lost part of its navigation, so that is a failure, not a note.
 */
export function chromeLinks(pages, share = 0.85) {
  const counts = new Map();
  for (const page of pages) {
    for (const link of page.internalLinks ?? []) counts.set(link, (counts.get(link) ?? 0) + 1);
  }
  return [...counts].filter(([, count]) => count >= pages.length * share).map(([link]) => link).sort();
}

/** The canonical URL a page at `path` should have: on www, with no trailing slash (but "/" keeps it). */
export function expectedCanonical(path) {
  return `${LIVE_ORIGIN}${path === "/" ? "/" : path}`;
}

/**
 * Compare one page of the new site with its live record. Returns issues: a "fail" is a missing
 * page or a changed title or description, which the owner must approve; a "note" is a gap to
 * close (words, headings, links, alt text) before the switch.
 * `exception` is this path's entry in seo/parity-exceptions.json, if it has one.
 */
export function comparePage({
  path,
  live,
  page,
  status,
  location = null,
  cover,
  exception = null,
  minCoverage = null,
  chrome = [],
  exceptions = {},
}) {
  const issues = [];
  const fail = (code, message, detail) => issues.push({ level: "fail", code, message, ...(detail && { detail }) });
  const note = (code, message, detail) => issues.push({ level: "note", code, message, ...(detail && { detail }) });

  if (exception?.missing) {
    if (status === 404) return [{ level: "approved", code: "missing", message: exception.reason ?? "not built yet" }];
    note("exception", "listed as missing but the page exists; remove it from the exceptions");
  }
  if (exception?.redirect) {
    const ok = (status === 301 || status === 308) && location === exception.redirect;
    return ok
      ? [{ level: "approved", code: "redirect", message: `redirects to ${exception.redirect}: ${exception.reason ?? ""}`.trim() }]
      : [{ level: "fail", code: "redirect", message: `expected a permanent redirect to ${exception.redirect}, got ${status} ${location ?? ""}` }];
  }

  if (status !== 200) {
    fail("status", `status ${status}${location ? ` to ${location}` : ""}, expected 200`);
    return issues;
  }

  if (page.titles.length !== 1) fail("title-count", `${page.titles.length} title tags`);
  if (live.title && !exception?.approvedTitle) {
    if (squash(page.titles[0]) !== squash(live.title)) fail("title", `title is "${page.titles[0] ?? ""}", live has "${live.title}"`);
  } else if (!page.titles[0]) {
    fail("title", "no title");
  }

  if (page.descriptions.length !== 1) fail("description-count", `${page.descriptions.length} description tags`);
  if (live.description && !exception?.approvedDescription) {
    if (squash(page.descriptions[0]) !== squash(live.description)) fail("description", "description differs from live");
  } else if (!page.descriptions[0]) {
    fail("description", "no description");
  }

  if (page.canonicals.length !== 1 || page.canonicals[0] !== expectedCanonical(path)) {
    fail("canonical", `canonical is ${JSON.stringify(page.canonicals)}, expected ${expectedCanonical(path)}`);
  }
  if (page.robots.some((value) => /noindex/i.test(value)) && !(live.robots && /noindex/i.test(live.robots))) {
    fail("robots", "noindex on a page the live site lets search engines index");
  }

  if (page.h1.length !== 1) note("h1", `${page.h1.length} H1 headings (live has ${live.h1?.length ?? 0})`);
  const text = normalizeForMatch(page.text);
  const lostH1 = (live.h1 ?? []).filter((heading) => !text.includes(normalizeForMatch(heading)));
  if (lostH1.length) note("h1-live", `live H1 not on the page: ${lostH1.join(" | ")}`);
  const lostH2 = (live.h2 ?? []).filter((heading) => !text.includes(normalizeForMatch(heading)));
  if (lostH2.length) note("h2", `${lostH2.length} of ${(live.h2 ?? []).length} live H2 headings are not on the page`);

  const liveTypes = [...new Set((live.jsonLd ?? []).flatMap((block) => [block?.["@type"]].flat().filter(Boolean)))];
  const lostTypes = liveTypes.filter((type) => !page.jsonLdTypes.includes(type));
  if (lostTypes.length) note("json-ld", `structured data types missing: ${lostTypes.join(", ")}`);

  // A live link to a page the owner approved leaving out (not built, or redirected to a page this
  // one links to) is not a loss.
  const approvedAway = (link) => {
    const approved = exceptions[link];
    return Boolean(approved?.missing || (approved?.redirect && page.internalLinks.includes(approved.redirect)));
  };
  const lostLinks = (live.internalLinks ?? []).filter(
    (link) => link !== path && !page.internalLinks.includes(link) && !approvedAway(link),
  );
  const lostChrome = lostLinks.filter((link) => chrome.includes(link));
  if (lostChrome.length) fail("chrome-links", `${lostChrome.length} header or footer links the live site has on nearly every page are missing: ${lostChrome.join(", ")}`, lostChrome);
  const lostOther = lostLinks.filter((link) => !chrome.includes(link));
  if (lostOther.length) note("links", `${lostOther.length} live internal links missing: ${lostOther.slice(0, 4).join(", ")}${lostOther.length > 4 ? ", ..." : ""}`, lostOther);
  if (page.images.missingAlt) note("alt", `${page.images.missingAlt} of ${page.images.total} images have no alt text`);

  if (cover) {
    const wanted = minCoverage ?? null;
    const percent = Math.round(cover.ratio * 100);
    const detail = `${cover.specificFound} of ${cover.specificTotal} of the live page's own sentences are on the page (${percent}%)`;
    if (wanted !== null && cover.ratio < wanted) fail("coverage", `${detail}; wanted ${Math.round(wanted * 100)}%`);
    // A page whose exception sets its own minimum is meant to differ: no note while it is above it.
    else if (cover.ratio < 0.95 && exception?.minCoverage === undefined) note("coverage", detail);
  }
  return issues;
}

/**
 * Hold the line while pages are ported: a page's coverage may not drop below what the ratchet file
 * recorded (less a small margin), and it may not gain a failure the file did not record.
 * Returns the problems, empty when the page is no worse than it was.
 */
export function ratchetProblems(path, now, recorded, margin = 0.005) {
  if (!recorded) return [];
  const problems = [];
  if (now.coverage < recorded.coverage - margin) {
    problems.push(`${path}: coverage fell from ${Math.round(recorded.coverage * 100)}% to ${Math.round(now.coverage * 100)}%`);
  }
  for (const code of now.fails) {
    if (!(recorded.fails ?? []).includes(code)) problems.push(`${path}: new failure "${code}"`);
  }
  return problems;
}
