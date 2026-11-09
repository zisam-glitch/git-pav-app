// CS-46: Dental Odontogram Structure & Validation Tests against real domain types
import { readFileSync } from "fs";
import { join } from "path";
import { ToothCondition } from "../features/records/records-types";
import { universalToFdi, fdiToUniversal, UPPER_CHART_ROW, LOWER_CHART_ROW } from "../features/records/tooth-number";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🦷 RUNNING DENTAL ODONTOGRAM INTEGRITY TESTS (CS-46)...\n");

// 1. Tooth numbering domain rules (FDI / Universal numbering: 1 to 32)
function isValidToothNumber(num: number): boolean {
  return Number.isInteger(num) && num >= 1 && num <= 32;
}

assert(isValidToothNumber(1), "Tooth #1 (UR Wisdom) is valid");
assert(isValidToothNumber(16), "Tooth #16 (UL Wisdom) is valid");
assert(isValidToothNumber(17), "Tooth #17 (LL Wisdom) is valid");
assert(isValidToothNumber(32), "Tooth #32 (LR Wisdom) is valid");
assert(!isValidToothNumber(0), "Tooth #0 is rejected");
assert(!isValidToothNumber(33), "Tooth #33 is rejected");
assert(!isValidToothNumber(15.5), "Decimal tooth number is rejected");

// 2. Arch and Quadrant mapping
function getArchAndQuadrant(toothNumber: number): { arch: "upper" | "lower"; quadrant: "UR" | "UL" | "LL" | "LR" } {
  if (toothNumber >= 1 && toothNumber <= 8) return { arch: "upper", quadrant: "UR" };
  if (toothNumber >= 9 && toothNumber <= 16) return { arch: "upper", quadrant: "UL" };
  if (toothNumber >= 17 && toothNumber <= 24) return { arch: "lower", quadrant: "LL" };
  if (toothNumber >= 25 && toothNumber <= 32) return { arch: "lower", quadrant: "LR" };
  throw new Error(`Invalid tooth number: ${toothNumber}`);
}

assert(getArchAndQuadrant(1).quadrant === "UR" && getArchAndQuadrant(1).arch === "upper", "Tooth #1 maps to UR upper");
assert(getArchAndQuadrant(8).quadrant === "UR" && getArchAndQuadrant(8).arch === "upper", "Tooth #8 maps to UR upper");
assert(getArchAndQuadrant(9).quadrant === "UL" && getArchAndQuadrant(9).arch === "upper", "Tooth #9 maps to UL upper");
assert(getArchAndQuadrant(16).quadrant === "UL" && getArchAndQuadrant(16).arch === "upper", "Tooth #16 maps to UL upper");
assert(getArchAndQuadrant(17).quadrant === "LL" && getArchAndQuadrant(17).arch === "lower", "Tooth #17 maps to LL lower");
assert(getArchAndQuadrant(24).quadrant === "LL" && getArchAndQuadrant(24).arch === "lower", "Tooth #24 maps to LL lower");
assert(getArchAndQuadrant(25).quadrant === "LR" && getArchAndQuadrant(25).arch === "lower", "Tooth #25 maps to LR lower");
assert(getArchAndQuadrant(32).quadrant === "LR" && getArchAndQuadrant(32).arch === "lower", "Tooth #32 maps to LR lower");

// 3. Clinical condition validation (must match ToothCondition union from records-types.ts)
const VALID_CONDITIONS: readonly ToothCondition[] = ["healthy", "decay", "filling", "crown", "missing"];
function isValidToothCondition(c: string): c is ToothCondition {
  return VALID_CONDITIONS.includes(c as ToothCondition);
}

assert(isValidToothCondition("healthy"), "Accepts 'healthy'");
assert(isValidToothCondition("decay"), "Accepts 'decay'");
assert(isValidToothCondition("filling"), "Accepts 'filling'");
assert(isValidToothCondition("crown"), "Accepts 'crown'");
assert(isValidToothCondition("missing"), "Accepts 'missing'");
assert(!isValidToothCondition("broken_arm"), "Rejects non-dental condition");
assert(!isValidToothCondition(""), "Rejects empty condition");

// 4. Update payload integrity (validating items for updateOdontogram)
interface OdontogramUpdateItem {
  toothNumber: number;
  arch: string;
  quadrant: string;
  condition: string;
  notes?: string;
}

function validateOdontogramPayload(items: unknown[]): { valid: boolean; error?: string } {
  if (!Array.isArray(items)) return { valid: false, error: "Must be an array" };
  for (const item of items) {
    const it = item as Partial<OdontogramUpdateItem>;
    if (typeof it.toothNumber !== "number" || !isValidToothNumber(it.toothNumber)) {
      return { valid: false, error: `Invalid tooth number: ${it.toothNumber}` };
    }
    if (typeof it.condition !== "string" || !isValidToothCondition(it.condition)) {
      return { valid: false, error: `Invalid condition: ${it.condition}` };
    }
  }
  return { valid: true };
}

assert(validateOdontogramPayload([{ toothNumber: 14, condition: "crown" }]).valid, "Valid update payload passes");
assert(!validateOdontogramPayload([{ toothNumber: 99, condition: "healthy" }]).valid, "Rejects out-of-range tooth number in payload");
assert(!validateOdontogramPayload([{ toothNumber: 14, condition: "invalid_diag" }]).valid, "Rejects invalid condition in payload");

// 5. Clinicians see UK (FDI) numbers, in the order a UK chart reads
for (let u = 1; u <= 32; u++) assert(fdiToUniversal(universalToFdi(u)!) === u, `FDI round trip for stored tooth ${u}`);
assert(fdiToUniversal(36) === 19 && fdiToUniversal(11) === 8 && fdiToUniversal(48) === 32, "FDI 36, 11 and 48 map to the stored numbers");
assert(fdiToUniversal(19) === null && fdiToUniversal(51) === null && fdiToUniversal(5) === null, "Not an FDI number is rejected");
assert(UPPER_CHART_ROW.map((u) => universalToFdi(u)).join(",") === "18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28", "Upper row reads 18–11, 21–28");
assert(LOWER_CHART_ROW.map((u) => universalToFdi(u)).join(",") === "48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38", "Lower row reads 48–41, 31–38");
for (const f of ["consult-room", "odontogram-editor", "patient-record"]) {
  const src = readFileSync(join(__dirname, `../app/(clinician)/${f}.tsx`), "utf8");
  assert(!/#\{|#1–#|1 - 16|17 - 32/.test(src) && /fdiText\(/.test(src), `${f} shows FDI numbers, not US #1–#32`);
}

console.log("\n🎉 ALL ODONTOGRAM INTEGRITY TESTS PASSED (0 FAILURES)!\n");
