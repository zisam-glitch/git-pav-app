/**
 * Tapping a notification opens what it is about (R5), and there is somewhere
 * to read past ones (R6).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { routeForNotification } from "../features/notifications/notification-route";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🔔 NOTIFICATION TAP (R5, R6)\n");

const appt = routeForNotification({ appointmentId: "a1", type: "appointment_reminder" });
assert(appt?.pathname === "/(patient)/appointments/[id]" && appt.params.id === "a1", "A reminder opens that appointment");
const van = routeForNotification({ requestId: "r1", phase: "en_route" });
assert(van?.pathname === "/(patient)/van/live-track" && van.params.requestId === "r1", "A van update opens the live map");
assert(routeForNotification({ requestId: "r1", appointmentId: "a1" })?.pathname === "/(patient)/van/live-track", "A van update wins over an appointment id");
assert(routeForNotification({ type: "van_request_incoming" })?.pathname === "/(operator)/incoming", "A new van request opens the crew's incoming list");
const msg = routeForNotification({ type: "message", audience: "patient", threadId: "t1" });
assert(msg?.pathname === "/(patient)/message-thread" && msg.params.id === "t1", "A new message opens that conversation");
assert(routeForNotification({ type: "message", audience: "clinician", threadId: "t1" })?.pathname === "/(clinician)/inbox", "A message for the dentist opens the inbox");
const wr = routeForNotification({ appointmentId: "a1", screen: "waiting_room" });
assert(wr?.pathname === "/(patient)/video/device-check" && wr.params.appointmentId === "a1", "The 10-minute video reminder opens the waiting room");
assert(routeForNotification({}) === null && routeForNotification(null) === null && routeForNotification("x") === null, "Anything else just opens the app");
assert(routeForNotification({ appointmentId: 5 }) === null, "A malformed id is ignored");

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");
const layout = read("app/_layout.tsx");
assert(layout.includes("listenForNotificationTaps(") && layout.includes("routeForNotification("), "The app listens for notification taps");
assert(read("features/notifications/notification-hooks.ts").includes("addNotificationResponseReceivedListener"), "The listener uses the notification response event");
assert(read("features/notifications/notification-hooks.ts").includes("getLastNotificationResponseAsync"), "A tap that launched the app is handled too");
assert(read("app/(patient)/notifications.tsx").includes("useNotificationHistory"), "There is a notifications list");
assert(read("app/(patient)/(tabs)/profile/index.tsx").includes('"/(patient)/notifications"'), "The profile links to it");

console.log("\n🎉 ALL NOTIFICATION TAP TESTS PASSED!\n");
