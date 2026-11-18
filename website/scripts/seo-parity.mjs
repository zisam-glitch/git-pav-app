#!/usr/bin/env node
/**
 * Compare a build of this site with the recorded live site, page by page.
 *
 * The live site is recorded in seo/live-baseline.json (titles, descriptions, headings, links,
 * structured data) and seo/live-text/ (each page's words). This script fetches every recorded
 * URL from a running copy of the new site (a local `npm run preview`, or a Vercel preview),
 * reads the server-rendered HTML the way a search engine does, and reports what differs.
 *
 *   node scripts/seo-parity.mjs --base http://127.0.0.1:4173 --wait-seconds 60
 *
 * A "fail" is a missing page or a changed title, description or canonical, or a page kept out
 * of search: the owner must approve those (seo/parity-exceptions.json lists the approved ones).
 * A "note" is a gap to close before the switch: words, headings, links, alt text.
 *
 * While pages are still being ported, seo/parity-ratchet.json holds each page's coverage and
 * the run fails if a page falls behind it. Run with --update-ratchet after porting a page to
 * record the improvement. Before the switch, run with --min-sentences 0.95: every page must have
 * at least 95% of the live page's own sentences, except where the exceptions file says otherwise.
 *
 * Options: --base URL (required) --baseline FILE --text-dir DIR --exceptions FILE --ratchet FILE
 *   --update-ratchet --min-sentences 0.95 --wait-seconds N --only /a,/b --out FILE --quiet
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { chromeLinks, comparePage, coverage, liveUnits, parsePage, ratchetProblems, sharedUnits } from "./seo-parity-lib.mjs";
import { slugForPath } from "./seo-snapshot-lib.mjs";

function parseArgs(argv) {
  const args = {
    baseline: "seo/live-baseline.json",
    textDir: "seo/live-text",
    exceptions: "seo/parity-exceptions.json",
    ratchet: "seo/parity-ratchet.json",
  };
  const flags = new Set(["--update-ratchet", "--quiet"]);
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const name = flag.replace(/^--/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (flags.has(flag)) args[name] = true;
    else if (["--base", "--baseline", "--text-dir", "--exceptions", "--ratchet", "--min-sentences", "--wait-seconds", "--only", "--out"].includes(flag)) {
      args[name] = argv[(i += 1)];
      if (args[name] === undefined) throw new Error(`${flag} needs a value`);
    } else throw new Error(`unknown option ${flag}`);
  }
  if (!args.base) throw new Error("--base URL is required");
  return args;
}

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);

async function waitForServer(base, seconds) {
  const until = Date.now() + seconds * 1000;
  for (;;) {
    try {
      await fetch(base, { redirect: "manual" });
      return;
    } catch (error) {
      if (Date.now() > until) throw new Error(`${base} did not answer within ${seconds} seconds (${error.cause?.code ?? error.message})`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function fetchPage(base, path) {
  const res = await fetch(base + path, { redirect: "manual", headers: { "user-agent": "pav-seo-parity" } });
  let location = res.headers.get("location");
  if (location?.startsWith(base)) location = location.slice(base.length) || "/";
  return { status: res.status, location, html: await res.text() };
}

const args = parseArgs(process.argv.slice(2));
const base = args.base.replace(/\/+$/, "");
const baseline = readJson(args.baseline);
const exceptions = readJson(args.exceptions, {});
const ratchet = readJson(args.ratchet, null);
const only = args.only ? new Set(args.only.split(",")) : null;
const minSentences = args.minSentences === undefined ? null : Number(args.minSentences);

if (args.waitSeconds) await waitForServer(base, Number(args.waitSeconds));

const livePages = baseline.pages.filter((page) => !page.error && (!only || only.has(page.path)));
const unitsByPath = new Map();
for (const page of baseline.pages) {
  const file = `${args.textDir}/${slugForPath(page.path)}.txt`;
  unitsByPath.set(page.path, existsSync(file) ? liveUnits(readFileSync(file, "utf8")) : []);
}
const shared = sharedUnits(unitsByPath);
const chrome = chromeLinks(baseline.pages.filter((page) => !page.error));

const results = [];
for (const live of livePages) {
  const { status, location, html } = await fetchPage(base, live.path);
  const exception = exceptions[live.path] ?? null;
  const page = parsePage(html);
  const cover = status === 200 ? coverage(unitsByPath.get(live.path) ?? [], page.text, shared) : null;
  const issues = comparePage({
    path: live.path,
    live,
    page,
    status,
    location,
    cover,
    exception,
    minCoverage: exception?.minCoverage ?? minSentences,
    chrome,
    exceptions,
  });
  results.push({ path: live.path, status, location, coverage: cover?.ratio ?? 0, cover, issues });
}

const fails = results.flatMap((r) => r.issues.filter((i) => i.level === "fail").map((i) => `${r.path}: ${i.message}`));
const current = Object.fromEntries(
  results.map((r) => [
    r.path,
    {
      coverage: Math.round(r.coverage * 1000) / 1000,
      fails: [...new Set(r.issues.filter((i) => i.level === "fail").map((i) => i.code))].sort(),
    },
  ]),
);

if (!args.quiet) {
  for (const r of results) {
    const approved = r.issues.find((i) => i.level === "approved");
    const percent = r.cover ? `${String(Math.round(r.coverage * 100)).padStart(3)}%` : "  - ";
    const marks = approved ? `approved: ${approved.message}` : r.issues.map((i) => (i.level === "fail" ? `FAIL ${i.code}` : i.code)).join(", ") || "ok";
    console.log(`${String(r.status).padEnd(4)} ${percent}  ${r.path}  ${marks}`);
  }
}

const problems = [];
if (args.updateRatchet) {
  writeFileSync(args.ratchet, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`\nwrote ${args.ratchet} (${results.length} pages)`);
} else if (ratchet) {
  // A page whose exception sets its own minimum (the legal pages) is meant to differ from the live
  // text, so that minimum is its floor and the ratchet does not apply.
  for (const r of results) {
    if (exceptions[r.path]?.minCoverage === undefined) problems.push(...ratchetProblems(r.path, current[r.path], ratchet[r.path]));
  }
}

if (args.out) {
  const report = results.map((r) => ({ ...r, cover: r.cover && { ...r.cover, missing: r.cover.missing.slice(0, 60) } }));
  writeFileSync(args.out, `${JSON.stringify(report, null, 2)}\n`);
}

const specific = results.filter((r) => r.cover);
const average = specific.length ? specific.reduce((sum, r) => sum + r.coverage, 0) / specific.length : 0;
console.log(
  `\n${results.length} pages: ${results.filter((r) => r.status === 200).length} served, ` +
    `${results.filter((r) => r.issues.some((i) => i.level === "approved")).length} approved differences, ` +
    `${fails.length} failures, average coverage of the live page's own sentences ${Math.round(average * 100)}%, ` +
    `${specific.filter((r) => r.coverage >= 0.95).length} of ${specific.length} pages at 95% or more`,
);
for (const line of [...fails, ...problems]) console.log(`FAIL ${line}`);
process.exit(fails.length || problems.length ? 1 : 0);
