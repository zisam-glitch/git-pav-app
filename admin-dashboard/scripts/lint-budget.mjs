// CI lint gate. Most existing findings are in the template pages that go
// before launch (D-17), so instead of failing on all of them this fails when
// the counts go up. Lower the numbers when you fix some; never raise them.
import { spawnSync } from "node:child_process";

const BUDGET = { errors: 147, warnings: 197 };

const run = spawnSync("npx", ["biome", "lint", "--reporter=summary"], { encoding: "utf8" });
const output = `${run.stdout}${run.stderr}`;
const count = (kind) => Number(output.match(new RegExp(`Found (\\d+) ${kind}`))?.[1] ?? 0);
const found = { errors: count("error"), warnings: count("warning") };

if (run.error || (run.status !== 0 && found.errors === 0)) {
  console.error(output || run.error?.message);
  console.error("biome didn't run");
  process.exit(1);
}

let failed = false;
for (const kind of ["errors", "warnings"]) {
  const ok = found[kind] <= BUDGET[kind];
  console.log(`${kind}: ${found[kind]} (budget ${BUDGET[kind]})${ok ? "" : "  <- over budget"}`);
  if (!ok) failed = true;
}
if (failed) {
  console.error("New lint findings. Run `npx biome lint` to see them.");
  process.exit(1);
}
