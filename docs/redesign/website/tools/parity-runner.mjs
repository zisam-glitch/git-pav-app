// In-browser copy of `npm run seo:parity` (website/scripts/seo-parity.mjs), for a sandbox that cannot reach localhost
// from the shell. Load it from a tab that is on the dev server's origin (so page fetches are same-origin):
//   const r = await import("http://localhost:8099/parity/runner.mjs"); await r.run({ only: ["/about"] })
import { chromeLinks, comparePage, coverage, liveUnits, parsePage, ratchetProblems, sharedUnits } from "./seo-parity-lib.mjs";
import { slugForPath } from "./seo-snapshot-lib.mjs";

const SEED = "http://localhost:8099";

export async function run({ only = null, base = "", verbose = true } = {}) {
  const json = async (url, fallback) => {
    const res = await fetch(url);
    return res.ok ? res.json() : fallback;
  };
  const baseline = await json(`${SEED}/seo/live-baseline.json`);
  const exceptions = (await json(`${SEED}/seo/parity-exceptions.json`, {})) ?? {};
  const ratchet = await json(`${SEED}/seo/parity-ratchet.json`, null);

  const unitsByPath = new Map();
  await Promise.all(
    baseline.pages.map(async (page) => {
      const res = await fetch(`${SEED}/seo/live-text/${slugForPath(page.path)}.txt`);
      unitsByPath.set(page.path, res.ok ? liveUnits(await res.text()) : []);
    }),
  );
  const shared = sharedUnits(unitsByPath);
  const chrome = chromeLinks(baseline.pages.filter((page) => !page.error));
  const livePages = baseline.pages.filter((page) => !page.error && (!only || only.includes(page.path)));

  const results = [];
  for (const live of livePages) {
    const res = await fetch(base + live.path, { headers: { "user-agent": "pav-seo-parity" } });
    const html = await res.text();
    const status = res.redirected ? 308 : res.status;
    const location = res.redirected ? new URL(res.url).pathname : null;
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
      minCoverage: exception?.minCoverage ?? null,
      chrome,
      exceptions,
    });
    results.push({ path: live.path, status, coverage: cover?.ratio ?? 0, cover, issues, h1: page.h1.length });
  }

  const current = Object.fromEntries(
    results.map((r) => [
      r.path,
      {
        coverage: Math.round(r.coverage * 1000) / 1000,
        fails: [...new Set(r.issues.filter((i) => i.level === "fail").map((i) => i.code))].sort(),
      },
    ]),
  );
  const fails = results.flatMap((r) => r.issues.filter((i) => i.level === "fail").map((i) => `${r.path}: ${i.message}`));
  const problems = [];
  if (ratchet) {
    for (const r of results) {
      if (exceptions[r.path]?.minCoverage === undefined) problems.push(...ratchetProblems(r.path, current[r.path], ratchet[r.path]));
    }
  }
  const lines = results.map((r) => {
    const approved = r.issues.find((i) => i.level === "approved");
    const percent = r.cover ? `${String(Math.round(r.coverage * 100)).padStart(3)}%` : "  - ";
    const was = ratchet?.[r.path] ? ` (was ${Math.round(ratchet[r.path].coverage * 100)}%)` : "";
    const marks = approved ? "approved" : r.issues.map((i) => (i.level === "fail" ? `FAIL ${i.code}` : i.code)).join(",") || "ok";
    return `${r.status} ${percent}${was} ${r.path} h1=${r.h1} ${marks}`;
  });
  const specific = results.filter((r) => r.cover);
  const average = specific.length ? specific.reduce((s, r) => s + r.coverage, 0) / specific.length : 0;
  const summary = `${results.length} pages, ${fails.length} failures, ${problems.length} ratchet problems, average coverage ${Math.round(average * 100)}%`;
  return [verbose ? lines.join("\n") : "", summary, ...fails.map((f) => "FAIL " + f), ...problems.map((p) => "RATCHET " + p)].filter(Boolean).join("\n");
}
