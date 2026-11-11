// The booking rules come from the server, and the app falls back to its built-in text until it has them (A1).
import { readFileSync } from "fs";
import { join } from "path";
import { parsePolicies, cancellationSheetMessage, currentPolicies, resetPoliciesForTest } from "../features/booking/policies";
import { CANCELLATION_SHEET_MESSAGE } from "../features/booking/cancellation-policy";

let failed = 0;
const check = (name: string, ok: boolean) => {
  if (ok) console.log(`✓ PASSED: ${name}`);
  else {
    failed++;
    console.error(`✗ FAILED: ${name}`);
  }
};

const good = {
  cancellation: { fullRefundHours: 48, halfRefundHours: 24, message: "From the server." },
  rescheduleMinNoticeHours: 48,
  checkInOpensHours: 48,
  checkInClosesHours: 2,
  waitingRoomOpensMinutes: 10,
};

check("a well-formed answer is accepted", parsePolicies(good)?.cancellation.message === "From the server.");
check("nothing, junk or a half answer is refused", parsePolicies(null) === null && parsePolicies("x") === null && parsePolicies({}) === null && parsePolicies({ cancellation: good.cancellation }) === null);
check("an empty message or a negative or non-number window is refused", parsePolicies({ ...good, cancellation: { ...good.cancellation, message: "  " } }) === null && parsePolicies({ ...good, checkInOpensHours: -1 }) === null && parsePolicies({ ...good, waitingRoomOpensMinutes: "10" }) === null);

resetPoliciesForTest();
check("before the server has answered, the built-in text is used", cancellationSheetMessage() === CANCELLATION_SHEET_MESSAGE && currentPolicies() === null);

const screens = [
  readFileSync(join(__dirname, "../app/(patient)/appointments/[id].tsx"), "utf8"),
  readFileSync(join(__dirname, "../app/(patient)/(tabs)/appointments.tsx"), "utf8"),
];
check("the cancel screens use the server's wording, not a copy", screens.every((s) => s.includes("cancellationSheetMessage()") && !s.includes("CANCELLATION_SHEET_MESSAGE")));
const layout = readFileSync(join(__dirname, "../app/_layout.tsx"), "utf8");
check("the app asks the server for the policies when it starts", layout.includes("loadBookingPolicies()"));

if (failed > 0) process.exit(1);
console.log("BOOKING POLICIES TESTS PASSED");
