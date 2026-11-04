import { getLiveTrackDispatchView } from "../features/van/live-track-view";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

const van = { name: "Van Alpha", registrationPlate: "AB12 CDE" };
const base = {
  etaLabel: "12 min",
  etaSecondsSnapshot: 720,
  van,
  service: { name: "Dental Checkup", durationMinutes: 30 },
};

const pending = getLiveTrackDispatchView({ ...base, status: "pending" });
assert(!pending.accepted, "pending request is not treated as accepted");
assert(pending.etaLabel === null, "pending request shows no ETA even if the API sent one");
assert(pending.vanName === null, "pending request names no van even if the API sent one");
assert(!pending.vanSubtitle.includes("AB12 CDE"), "pending request hides the van plate");
assert(pending.vanSubtitle.includes("Waiting for an operator to accept"), "pending request shows the waiting state");

const accepted = getLiveTrackDispatchView({ ...base, status: "accepted" });
assert(accepted.accepted, "accepted request is accepted");
assert(accepted.etaLabel === "12 min", "accepted request shows the ETA");
assert(accepted.vanName === "Van Alpha", "accepted request names the van");
assert(accepted.vanSubtitle.includes("AB12 CDE"), "accepted request shows the van plate");

const noEta = getLiveTrackDispatchView({ ...base, etaLabel: null, etaSecondsSnapshot: null, status: "accepted" });
assert(noEta.etaLabel === "Calculating...", "accepted request without ETA says calculating");
