#!/usr/bin/env node
// Builds the Android JavaScript bundle and fails if it is bigger than the budget
// in bundle-budget.json. Prints where the bytes are, by package, so a jump has
// an obvious cause.
//
//   node scripts/check-bundle-size.mjs            check against the budget
//   node scripts/check-bundle-size.mjs --update   set the budget to today's size + 2%
//
// The budget is on the minified JavaScript (not the Hermes bytecode), which is
// the part the app's own code and libraries control.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const budgetFile = join(root, "bundle-budget.json");
const out = mkdtempSync(join(tmpdir(), "pav-bundle-"));

try {
  execFileSync(
    "npx",
    ["expo", "export", "--platform", "android", "--no-bytecode", "--dump-sourcemap", "--output-dir", out],
    { cwd: root, stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, EXPO_OFFLINE: "1", EXPO_NO_TELEMETRY: "1", CI: "1" } }
  );

  const dir = join(out, "_expo/static/js/android");
  const jsName = readdirSync(dir).find((f) => f.endsWith(".js"));
  const mapName = readdirSync(dir).find((f) => f.endsWith(".js.map"));
  if (!jsName || !mapName) throw new Error("The export produced no JavaScript bundle");
  const bytes = statSync(join(dir, jsName)).size;

  // Where the bytes are: walk the source map, adding each mapped stretch of the
  // bundle to the file it came from, then group files by package.
  const map = JSON.parse(readFileSync(join(dir, mapName), "utf8"));
  const lines = readFileSync(join(dir, jsName), "utf8").split("\n");
  const B64 = Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"].map((c, i) => [c, i]));
  const vlq = (s) => {
    const r = [];
    let shift = 0;
    let val = 0;
    for (const ch of s) {
      const d = B64[ch];
      val += (d & 31) << shift;
      if (d & 32) shift += 5;
      else {
        r.push(val & 1 ? -(val >> 1) : val >> 1);
        val = 0;
        shift = 0;
      }
    }
    return r;
  };
  const perSource = new Map();
  let srcIdx = 0;
  map.mappings.split(";").forEach((line, ln) => {
    if (!line) return;
    let col = 0;
    const segs = line.split(",").map((seg) => {
      const v = vlq(seg);
      col += v[0];
      if (v.length >= 4) srcIdx += v[1];
      return [col, v.length >= 4 ? srcIdx : null];
    });
    const len = (lines[ln] ?? "").length;
    segs.forEach(([c, s], i) => {
      if (s === null) return;
      const end = i + 1 < segs.length ? segs[i + 1][0] : len;
      perSource.set(s, (perSource.get(s) ?? 0) + Math.max(0, end - c));
    });
  });
  const byGroup = new Map();
  for (const [i, n] of perSource) {
    const p = map.sources[i].replace(/\\/g, "/");
    const pkg = p.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    const group = pkg ? pkg[1] : "our code";
    byGroup.set(group, (byGroup.get(group) ?? 0) + n);
  }
  const top = [...byGroup].sort((a, b) => b[1] - a[1]).slice(0, 12);

  const kb = (n) => `${Math.round(n / 1024).toLocaleString("en-GB")} KB`;
  console.log(`Android JavaScript bundle: ${kb(bytes)} (${bytes} bytes)`);
  console.log("Biggest contributors:");
  for (const [name, n] of top) console.log(`  ${kb(n).padStart(8)}  ${name}`);

  if (process.argv.includes("--update")) {
    const next = { androidJsBytes: Math.round((bytes * 1.02) / 1000) * 1000, note: "Set by scripts/check-bundle-size.mjs --update: today's size plus 2%." };
    writeFileSync(budgetFile, JSON.stringify(next, null, 2) + "\n");
    console.log(`Budget set to ${next.androidJsBytes} bytes.`);
  } else {
    const budget = JSON.parse(readFileSync(budgetFile, "utf8")).androidJsBytes;
    if (bytes > budget) {
      console.error(`\nOver budget by ${kb(bytes - budget)} (budget ${kb(budget)}). Find the cause above, or, if the growth is intended, run: node scripts/check-bundle-size.mjs --update`);
      process.exitCode = 1;
    } else {
      console.log(`Within budget (${kb(budget)}), ${kb(budget - bytes)} to spare.`);
    }
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
