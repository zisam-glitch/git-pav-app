/**
 * Every screen shows times in UK time, whatever the phone's own time zone
 * (B6), and calendar dates such as a date of birth never shift a day (B14).
 *
 * The patient booking screens were fixed on 4 Nov; the clinician, records,
 * messages and settings screens still formatted in the phone's time zone.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { calendarDateLabel } from "../features/booking/uk-time";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    failures++;
    console.error(`❌ FAILED: ${message}`);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🕘 SCREENS SHOW UK TIME (B6, B14)\n");

const root = join(__dirname, "..");
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "__tests__" || name === "node_modules") return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

// The arguments of each date/time formatting call, up to its closing bracket.
function formattingCalls(src: string): string[] {
  const calls: string[] = [];
  const re = /\.toLocale(Date|Time)?String\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const receiver = src.slice(Math.max(0, m.index - 40), m.index);
    // pointsBalance.toLocaleString("en-GB") is a number, not a date.
    if (!m[1] && !/Date\([^()]*\)$|\b(now|dt|date|d)$/.test(receiver)) continue;
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < src.length && depth > 0) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") depth--;
      i++;
    }
    calls.push(src.slice(m.index, i));
  }
  return calls;
}

for (const file of sourceFiles(join(root, "app")).concat(sourceFiles(join(root, "components")), sourceFiles(join(root, "features")))) {
  if (file.endsWith(join("features", "booking", "uk-time.ts"))) continue;
  const src = readFileSync(file, "utf8");
  for (const call of formattingCalls(src)) {
    assert(/timeZone/.test(call), `${relative(root, file)}: ${call.split("\n")[0].trim()} names the UK time zone`);
  }
}

assert(calendarDateLabel("2015-03-04") === "04/03/2015", "A date of birth shows as the same calendar day");
assert(calendarDateLabel("2015-03-04T00:00:00.000Z") === "04/03/2015", "A date of birth sent with a time still shows that day");
assert(calendarDateLabel("not a date") === "not a date", "Anything else is shown as it came");

if (failures > 0) {
  console.error(`\n${failures} failure(s)\n`);
  process.exit(1);
}
console.log("\n🎉 ALL SCREEN TIME ZONE TESTS PASSED!\n");
