// The call says when it is reconnecting or weak, drops to audio-only once, and reports without personal data (V16, V23).
import { readFileSync } from "fs";
import { join } from "path";
import { linkStatus, linkMessage, shouldGoAudioOnly, joinTimeBucket } from "../features/video/call-health";
import { reportCallEvent, setCallEventReporter } from "../lib/call-events";

let failed = 0;
const check = (name: string, ok: boolean) => {
  if (ok) console.log(`✓ PASSED: ${name}`);
  else {
    failed++;
    console.error(`✗ FAILED: ${name}`);
  }
};

check("a dropped connection says reconnecting, even if the network was fine", linkStatus({ interrupted: true, network: "good" }) === "reconnecting");
check("a weak network says weak", linkStatus({ interrupted: false, network: "warning" }) === "weak" && linkStatus({ interrupted: false, network: "bad" }) === "weak");
check("a good or unknown network says nothing", linkStatus({ interrupted: false, network: "good" }) === "ok" && linkMessage("ok", false) === null && linkStatus({ interrupted: false, network: "unknown" }) === "ok");
check("reconnecting tells the person to stay on the screen", (linkMessage("reconnecting", false) ?? "").includes("Keep this screen open"));
check("audio-only explains why the camera is off", (linkMessage("weak", true) ?? "").includes("camera is off"));
check("a bad network turns the camera off once", shouldGoAudioOnly({ network: "bad", alreadyDone: false, cameraOn: true }));
check("it does not do it twice, or when the camera is already off, or for a mere warning", !shouldGoAudioOnly({ network: "bad", alreadyDone: true, cameraOn: true }) && !shouldGoAudioOnly({ network: "bad", alreadyDone: false, cameraOn: false }) && !shouldGoAudioOnly({ network: "warning", alreadyDone: false, cameraOn: true }));
check("join time is reported in coarse buckets", joinTimeBucket(1500) === "under_2s" && joinTimeBucket(3000) === "2_to_5s" && joinTimeBucket(7000) === "5_to_10s" && joinTimeBucket(20000) === "over_10s" && joinTimeBucket(NaN) === "unknown");

const seen: string[] = [];
setCallEventReporter((name, labels) => seen.push(`${name}:${JSON.stringify(labels)}`));
reportCallEvent("call.joined", { join_time: "under_2s" });
setCallEventReporter(null);
reportCallEvent("call.interrupted");
check("call events reach the reporter, and are a no-op without one", seen.length === 1 && seen[0].startsWith("call.joined"));

const call = readFileSync(join(__dirname, "../features/video/native-call.tsx"), "utf8");
check("the call listens for dropped connections and weak networks", call.includes('"network-connection"') && call.includes('"network-quality-change"'));
check("the call reports joins, drops and failed joins", ["call.joined", "call.interrupted", "call.join_failed"].every((e) => call.includes(e)));
check("the call event names carry no appointment or room", !/reportCallEvent\([^)]*(appointment|room|url|token)/i.test(call));

if (failed > 0) process.exit(1);
console.log("CALL HEALTH TESTS PASSED");
