/**
 * Bugs found by the redesign audit (docs/redesign/screen-inventory.md) and
 * fixed during the Wise rebuild.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { isUpperArch } from "../features/records/arch";
import { appointmentClinician, appointmentLocation } from "../features/booking/appointment-labels";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🔧 RUNNING REDESIGN FIX TESTS...\n");

const src = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

// ─── Dental chart: teeth with server quadrants were dropped from both arches ──
assert(isUpperArch("upper_right", 1) && isUpperArch("upper_left", 9), "server 'upper_*' quadrants are the upper arch");
assert(!isUpperArch("lower_left", 20) && !isUpperArch("lower_right", 30), "server 'lower_*' quadrants are the lower arch");
assert(isUpperArch("UR", 3) && !isUpperArch("LL", 22), "the app's own UR/LL codes still work");
assert(isUpperArch("", 5) && !isUpperArch(undefined, 25), "no quadrant: falls back to the tooth number");
const chart = src("app/(patient)/records/odontogram.tsx");
assert(!/quadrant\.includes\("U"\)/.test(chart), "patient chart no longer splits arches with a case-sensitive test");
assert(!/missing: "success"/.test(chart), "a missing tooth isn't shown as a success");

// ─── Appointment location by channel ─────────────────────────────────────────
assert(appointmentLocation({ channel: "van" }) === "Dental van at your address", "a van visit isn't labelled a video consultation");
assert(appointmentLocation({ channel: "van", van: { name: "Pav Dental Van #1" } }) === "Pav Dental Van #1", "a van visit shows its van");
assert(appointmentLocation({ channel: "video" }) === "Video consult", "a video consult says so");
assert(appointmentLocation({ channel: "clinic", clinic: { name: "Central" } }) === "Central", "a clinic visit shows its clinic");
assert(appointmentClinician({}) === "Dentist to be confirmed", "no invented clinician name");
for (const f of ["app/(patient)/(tabs)/appointments.tsx", "app/(patient)/appointments/[id].tsx", "app/(patient)/booking/summary.tsx"]) {
  assert(!src(f).includes('"Assigned Practitioner"') && !src(f).includes('"Video Consultation"'), `${f} has no placeholder names`);
}

// ─── Flow headers below the status bar ───────────────────────────────────────
for (const f of [
  "app/(patient)/booking/service-catalog.tsx",
  "app/(patient)/booking/clinic-picker.tsx",
  "app/(patient)/booking/clinician-picker.tsx",
  "app/(patient)/booking/slot-picker.tsx",
  "app/(patient)/booking/summary.tsx",
  "app/onboarding/profile.tsx",
  "app/onboarding/address.tsx",
  "app/onboarding/medical-history.tsx",
  "app/onboarding/consents.tsx",
]) {
  const code = src(f);
  assert(code.includes("<FlowHeader") && !code.includes("<ProgressPills"), `${f} uses the shared FlowHeader`);
}
assert(/insets\.top/.test(src("components/flow-header.tsx")), "FlowHeader keeps clear of the status bar");
assert(/canGoBack\(\)/.test(src("components/navigation.tsx")) && /height: insets\.top/.test(src("components/navigation.tsx")), "root screens get no empty nav bar");

// ─── Clipped and unreadable content ──────────────────────────────────────────
const plan = src("app/(patient)/records/plans/[id].tsx");
assert(/summaryTitle: \{[^}]*flex: 1/.test(plan), "sign-plan sheet: a long plan name wraps instead of clipping the total");
const triage = src("components/emergency-triage-modal.tsx");
assert(/isSelected && styles\.painDotTextSelected/.test(triage) && /painDotTextSelected: \{\s*color: colors\.onTint/.test(triage), "triage: the selected pain score's number stays readable");

console.log("\n🎉 ALL REDESIGN FIX TESTS PASSED (0 FAILURES)!\n");
