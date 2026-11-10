/**
 * The Maestro flows only name things that exist in the app (checklist G2).
 *
 * Found on 10 Nov: 40 of the flows' screen steps named text that is not in the
 * app at all, so those flows could never have passed. This test stops it
 * getting worse and forces the list to shrink:
 *
 *  - a step that names text or an id that the app does not contain fails,
 *    unless it is in maestro/known-stale-steps.json;
 *  - a step in that list that now exists fails, so it must be removed.
 *
 * Prefer `id:` selectors: a testID survives a change of wording.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🧭 MAESTRO STEPS MATCH THE APP\n");

const root = join(__dirname, "../..");
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((n: string) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? (n === "__tests__" || n === "__component__" ? [] : files(p)) : /\.tsx?$/.test(n) ? [p] : [];
  });
const source = files(join(root, "src")).map((f) => readFileSync(f, "utf8")).join("\n");

const flowsDir = join(root, "maestro/flows");
const stale: Array<{ flow: string; step: string; text: string }> = JSON.parse(
  readFileSync(join(root, "maestro/known-stale-steps.json"), "utf8")
);
const isStale = (flow: string, step: string, text: string) =>
  stale.some((s) => s.flow === flow && s.step === step && s.text === text);

const problems: string[] = [];
const stillStale: string[] = [];
let checked = 0;
let ids = 0;

for (const flow of readdirSync(flowsDir).filter((f: string) => f.endsWith(".yaml")).sort()) {
  const lines = readFileSync(join(flowsDir, flow), "utf8").split("\n");
  lines.forEach((line: string, i: number) => {
    const text = line.match(/^\s*-\s*(tapOn|assertVisible|assertNotVisible):\s*"([^"]+)"/);
    if (text) {
      checked++;
      const present = source.includes(text[2]);
      if (!present && !isStale(flow, text[1], text[2])) problems.push(`${flow}: ${text[1]} "${text[2]}" is not in the app`);
      if (present && isStale(flow, text[1], text[2])) stillStale.push(`${flow}: ${text[1]} "${text[2]}" now exists; remove it from known-stale-steps.json`);
    }
    const id = line.match(/^\s*id:\s*"([^"]+)"/);
    if (id) {
      ids++;
      if (!source.includes(`testID="${id[1]}"`) && !source.includes(`testID: "${id[1]}"`)) problems.push(`${flow}:${i + 1} id "${id[1]}" is not a testID in the app`);
    }
  });
}

assert(existsSync(flowsDir), "The flows folder exists");
assert(problems.length === 0, `Every named step exists in the app or is on the stale list${problems.length ? "\n  " + problems.join("\n  ") : ""}`);
assert(stillStale.length === 0, `Nothing on the stale list has been fixed without removing it${stillStale.length ? "\n  " + stillStale.join("\n  ") : ""}`);
assert(ids >= 4, `The flows use id selectors where the app has testIDs (${ids} so far)`);
console.log(`   ${checked} text steps checked, ${stale.length} known stale, ${ids} id steps`);

console.log("\n🎉 ALL MAESTRO MATCH TESTS PASSED!\n");
