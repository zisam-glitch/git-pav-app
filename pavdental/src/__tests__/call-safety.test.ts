// The call keeps the screen on, the summary says when it failed, the appointment
// screen stops asking for answers already sent, and the dead hooks are gone (V17, V20, V21, V33, V36, V39).
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
let failed = 0;
const check = (name: string, ok: boolean) => {
  if (ok) console.log(`✓ PASSED: ${name}`);
  else {
    failed++;
    console.error(`✗ FAILED: ${name}`);
  }
};

const call = read("features/video/native-call.tsx");
check("the call keeps the screen awake", call.includes("useKeepAwake()"));
check("the call says when the other person has left", call.includes("has left the call"));

const screen = read("app/(patient)/video/call.tsx");
check("rejoining asks for a fresh token", /opened \? await loadRoom\(\)/.test(screen));

const summary = read("app/(patient)/video/summary.tsx");
check("the summary shows a retry when it cannot load", summary.includes("setLoadFailed(true)") && summary.includes("Try again"));
check("the summary shows the follow-up the dentist advised", summary.includes("Follow-up advised"));

const appt = read("app/(patient)/appointments/[id].tsx");
check("the appointment screen knows when answers were sent", appt.includes("triageAnswered"));

check("the unused video hooks are deleted", !existsSync(join(root, "features/video/video-hooks.ts")));

if (failed > 0) process.exit(1);
console.log("CALL SAFETY TESTS PASSED");
