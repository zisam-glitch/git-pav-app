#!/usr/bin/env node
/**
 * Record what search engines see on a site: each page's title, description,
 * canonical, robots, Open Graph and Twitter tags, structured data, headings,
 * links, images and text, rendered in a real browser. The live site sets its
 * tags with JavaScript, so fetching the HTML alone would miss all of them.
 *
 *   node scripts/seo-snapshot.mjs --base https://www.pavdental.com \
 *     --seeds seo/live-seed-paths.json --out seo/live-baseline.json \
 *     --text-dir seo/live-text --crawl
 *
 * --crawl follows links to other pages on the same site (up to --max, default
 * 200), which finds blog posts and pages no list names. Pages load one at a
 * time with a pause between them. Analytics and ad beacons, video, images and
 * fonts are blocked, so the crawl is not counted as visits; image URLs and alt
 * text are still read from the page. Pages render at a phone's size, because
 * Google indexes the mobile version of a site.
 *
 * Uses Playwright's Chromium. Set SEO_BROWSER_CHANNEL=chrome to use the
 * installed Google Chrome instead, which needs no browser download.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium, devices, request } from "playwright";
import {
  bareHost,
  extractPageSeo,
  internalPath,
  normalizePath,
  normalizeText,
  proxyFromEnv,
  shouldBlockRequest,
  sitemapLocs,
  slugForPath,
  textHash,
  wordCount,
} from "./seo-snapshot-lib.mjs";

const USAGE =
  "usage: node scripts/seo-snapshot.mjs --base URL --out FILE [--seeds FILE] [--text-dir DIR] [--crawl] [--max N] [--delay-ms N]";

/** A path no site has, to see what the host does with an unknown page. */
const MISSING_PATH = "/__seo-snapshot-missing-page__";

function parseArgs(argv) {
  const args = { crawl: false, max: 200, delayMs: 500 };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) throw new Error(`${flag} needs a value\n${USAGE}`);
      i += 1;
      return next;
    };
    if (flag === "--base") args.base = value();
    else if (flag === "--out") args.out = value();
    else if (flag === "--seeds") args.seeds = value();
    else if (flag === "--text-dir") args.textDir = value();
    else if (flag === "--crawl") args.crawl = true;
    else if (flag === "--max") args.max = Number(value());
    else if (flag === "--delay-ms") args.delayMs = Number(value());
    else throw new Error(`unknown argument ${flag}\n${USAGE}`);
  }
  if (!args.base || !args.out) throw new Error(USAGE);
  return args;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const unique = (values) => [...new Set(values)];
const firstLine = (err) => String(err?.message || err).split("\n")[0];

/** How the host answers before any page renders: apex and http redirects, a trailing slash, an unknown path. */
async function hostRules(api, origin, samplePath) {
  const bare = bareHost(new URL(origin).hostname);
  const probes = [
    `http://${bare}/`,
    `https://${bare}/`,
    `http://www.${bare}/`,
    `${origin}${samplePath}/`,
    `${origin}${MISSING_PATH}`,
  ];
  const rules = [];
  for (const url of probes) {
    try {
      const res = await api.get(url, { maxRedirects: 0, timeout: 20_000 });
      rules.push({ url, status: res.status(), location: res.headers().location ?? null });
    } catch (err) {
      rules.push({ url, error: firstLine(err) });
    }
  }
  return rules;
}

/** A file the host serves (robots.txt, sitemap.xml). A single-page app may answer with its HTML page instead. */
async function siteFile(api, url) {
  try {
    const res = await api.get(url, { timeout: 20_000 });
    const contentType = res.headers()["content-type"] ?? "";
    const servedAsPage = contentType.includes("text/html");
    const body = await res.text();
    return { url, status: res.status(), contentType, servedAsPage, body: servedAsPage ? null : body };
  } catch (err) {
    return { url, error: firstLine(err) };
  }
}

async function renderPage(context, url) {
  const page = await context.newPage();
  try {
    const res = await page.goto(url, { waitUntil: "load", timeout: 45_000 });
    // react-helmet sets the title after the app mounts, and data-driven pages
    // may still be fetching. Give both a bounded chance to finish.
    await page
      .waitForFunction(() => document.title.trim().length > 0, null, { timeout: 8_000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 6_000 }).catch(() => {});
    await page.waitForTimeout(1_000);
    const seo = await page.evaluate(extractPageSeo);
    return { status: res?.status() ?? null, finalUrl: page.url(), seo };
  } finally {
    await page.close();
  }
}

function pageEntry(path, origin, rendered, textDir) {
  const { seo } = rendered;
  const text = normalizeText(seo.bodyText);
  const site = bareHost(new URL(origin).hostname);
  const external = [];
  const contact = [];
  for (const { href } of seo.links) {
    if (!href) continue;
    if (/^(mailto|tel):/i.test(href)) {
      contact.push(href);
      continue;
    }
    try {
      const url = new URL(href);
      if (/^https?:$/.test(url.protocol) && bareHost(url.hostname) !== site) external.push(url.href);
    } catch {
      // Not a URL; nothing to record.
    }
  }
  let textFile = null;
  if (textDir) {
    textFile = join(textDir, `${slugForPath(path)}.txt`);
    writeFileSync(textFile, `${text}\n`);
  }
  return {
    path,
    status: rendered.status,
    finalUrl: rendered.finalUrl,
    title: seo.title,
    description: seo.descriptions[0] ?? null,
    canonical: seo.canonicals[0] ?? null,
    robots: seo.robots[0] ?? null,
    lang: seo.lang,
    tagCounts: {
      titles: seo.titles.length,
      descriptions: seo.descriptions.length,
      canonicals: seo.canonicals.length,
    },
    og: seo.og,
    twitter: seo.twitter,
    jsonLd: seo.jsonLd,
    h1: seo.h1,
    h2: seo.h2,
    internalLinks: unique(seo.links.map((link) => internalPath(link.href, origin)).filter(Boolean)).sort(),
    externalLinks: unique(external).sort(),
    contactLinks: unique(contact).sort(),
    images: unique(seo.images.map((img) => JSON.stringify(img))).map((json) => JSON.parse(json)),
    wordCount: wordCount(text),
    textHash: textHash(text),
    textFile,
  };
}

function printSummary({ pages, missingPage, notVisited }) {
  const rendered = pages.filter((p) => !p.error);
  const byTitle = new Map();
  for (const p of rendered) byTitle.set(p.title, [...(byTitle.get(p.title) ?? []), p.path]);
  const sharedTitles = [...byTitle].filter(([, paths]) => paths.length > 1);
  const list = (items) => items.join(", ") || "none";
  console.log("\nSummary");
  console.log(`  rendered: ${rendered.length}, errors: ${pages.length - rendered.length}, left over --max: ${notVisited.length}`);
  console.log(`  same text as the not-found page: ${list(rendered.filter((p) => p.looksLikeNotFound).map((p) => p.path))}`);
  console.log(`  no title: ${list(rendered.filter((p) => !p.title).map((p) => p.path))}`);
  console.log(`  no description: ${list(rendered.filter((p) => !p.description).map((p) => p.path))}`);
  console.log(`  no canonical: ${list(rendered.filter((p) => !p.canonical).map((p) => p.path))}`);
  console.log(`  titles shared by several pages: ${sharedTitles.length}`);
  for (const [title, paths] of sharedTitles) console.log(`    "${title}": ${paths.join(", ")}`);
  if (missingPage?.error) console.log(`  not-found probe failed: ${missingPage.error}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const origin = new URL(args.base).origin;
  const proxy = proxyFromEnv();
  mkdirSync(dirname(args.out), { recursive: true });
  if (args.textDir) mkdirSync(args.textDir, { recursive: true });

  const seeds = ["/", ...(args.seeds ? JSON.parse(readFileSync(args.seeds, "utf8")) : [])].map(normalizePath);

  const api = await request.newContext({ proxy });
  const robotsTxt = await siteFile(api, `${origin}/robots.txt`);
  const sitemap = await siteFile(api, `${origin}/sitemap.xml`);
  const sitemapUrls = sitemap.body ? sitemapLocs(sitemap.body) : [];
  const rules = await hostRules(api, origin, seeds.find((p) => p !== "/") ?? "/about");
  await api.dispose();

  const queue = unique([...seeds, ...sitemapUrls.map((url) => internalPath(url, origin)).filter(Boolean)]);
  const seen = new Set(queue);
  const pages = [];
  let missingPage = null;

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.SEO_BROWSER_CHANNEL || undefined,
    proxy,
  });
  try {
    const context = await browser.newContext({ ...devices["Pixel 7"], locale: "en-GB" });
    await context.route("**/*", (route) => {
      const req = route.request();
      return shouldBlockRequest(req.url(), req.resourceType()) ? route.abort() : route.continue();
    });

    // What the site shows for a page that does not exist, so crawled URLs that
    // are really "not found" can be told apart from real pages.
    try {
      const probe = await renderPage(context, `${origin}${MISSING_PATH}`);
      const text = normalizeText(probe.seo.bodyText);
      missingPage = {
        path: MISSING_PATH,
        status: probe.status,
        title: probe.seo.title,
        h1: probe.seo.h1,
        wordCount: wordCount(text),
        textHash: textHash(text),
      };
    } catch (err) {
      missingPage = { path: MISSING_PATH, error: firstLine(err) };
    }

    while (queue.length > 0 && pages.length < args.max) {
      const path = queue.shift();
      process.stdout.write(`${path} ... `);
      try {
        const entry = pageEntry(path, origin, await renderPage(context, `${origin}${path}`), args.textDir);
        entry.looksLikeNotFound =
          path !== "/" && Boolean(missingPage?.textHash) && entry.textHash === missingPage.textHash;
        pages.push(entry);
        console.log(`${entry.status} "${entry.title}"${entry.looksLikeNotFound ? " (not-found page)" : ""}`);
        if (args.crawl) {
          for (const link of entry.internalLinks) {
            if (seen.has(link)) continue;
            seen.add(link);
            queue.push(link);
          }
        }
      } catch (err) {
        pages.push({ path, error: firstLine(err) });
        console.log(`error: ${firstLine(err)}`);
      }
      await sleep(args.delayMs);
    }
  } finally {
    await browser.close();
  }

  pages.sort((a, b) => a.path.localeCompare(b.path));
  const baseline = {
    capturedAt: new Date().toISOString(),
    base: origin,
    tool: "website/scripts/seo-snapshot.mjs",
    viewport: "Pixel 7, because Google indexes the mobile version",
    hostRules: rules,
    robotsTxt,
    sitemap: {
      url: sitemap.url,
      status: sitemap.status ?? null,
      servedAsPage: sitemap.servedAsPage ?? null,
      urls: sitemapUrls,
    },
    missingPage,
    notVisited: queue,
    pages,
  };
  writeFileSync(args.out, `${JSON.stringify(baseline, null, 2)}\n`);
  printSummary(baseline);
}

main().catch((err) => {
  console.error(String(err?.stack || err));
  process.exitCode = 1;
});
