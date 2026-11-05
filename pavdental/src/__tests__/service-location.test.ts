// Where the service is: Bradford (owner decision, 5 Nov). The app must not fall back to
// a made-up London position, and its examples should be local.
import { PRACTICE_CONFIG } from "../config/practice";
import { useVanStore } from "../features/van/van-store";
import fs from "fs";
import path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

console.log("\n📍 RUNNING SERVICE LOCATION TESTS...\n");

// ─── The practice is in Bradford ─────────────────────────────────────────────
const { lat, lng } = PRACTICE_CONFIG.location;
assert(lat > 53.7 && lat < 53.9 && lng > -1.9 && lng < -1.6, "the practice location is in Bradford");
assert(UK_POSTCODE_REGEX.test(PRACTICE_CONFIG.examplePostcode), "the example postcode is a valid UK postcode");
assert(PRACTICE_CONFIG.examplePostcode === "BD3 9TY", "the example postcode is the practice's own, which the seeded areas cover");
assert(PRACTICE_CONFIG.exampleCity === "Bradford", "the example town is Bradford");

// ─── The van draft starts at the practice ───────────────────────────────────
const draft = useVanStore.getState();
assert(draft.lat === lat && draft.lng === lng, "the van request draft starts at the practice, not at London");
assert(draft.isCovered === false, "a draft is not 'covered' until a coverage check says so");
useVanStore.getState().setLocationCoverage({ postcode: "BD3 9TY", lat: 53.8, lng: -1.73, isCovered: true, availability: null } as never);
useVanStore.getState().resetDraft();
assert(useVanStore.getState().lat === lat && useVanStore.getState().isCovered === false, "resetting the draft goes back to the practice");

// ─── No invented position, and no London left in the source ─────────────────
const src = (file: string) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const shift = src("app/(operator)/shift.tsx");
assert(shift.includes("startShift(fix ?? undefined)"), "a shift with no GPS fix starts without a position, not an invented one");
assert(!/startShift\(fix \?\? \{/.test(shift), "the shift screen doesn't fall back to a made-up coordinate");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}
const files = walk(path.join(__dirname, ".."));
const offenders = files.filter((f) => /51\.5074|defaultLondonFix|e\.g\. SW1A|e\.g\. London|14 Harley Street/.test(fs.readFileSync(f, "utf8")));
assert(offenders.length === 0, `no London default coordinates or examples remain in the app source${offenders.length ? `: ${offenders.map((f) => path.basename(f)).join(", ")}` : ""}`);

// ─── The Maestro van flow checks coverage with a postcode the seed covers ───
const flow = fs.readFileSync(path.join(__dirname, "../../maestro/flows/j4-van-request.yaml"), "utf8");
assert(flow.includes('inputText: "BD3 9TY"') && !flow.includes("SW1A 1AA"), "the van Maestro flow uses the practice postcode");

console.log("\n✅ ALL SERVICE LOCATION TESTS PASSED\n");
