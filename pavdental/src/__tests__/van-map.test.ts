/**
 * The patient's live van map (Uber-style tracking).
 */

import { readFileSync } from "fs";
import { createRequire } from "module";
import { join } from "path";
import { decodePolyline, MAP_MAX_ZOOM, positionAgeLabel, trackingSheet, trackingView, vanIsAssigned } from "../features/van/tracking";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;

console.log("\n🗺️  RUNNING VAN MAP TESTS...\n");

// ─── Google's own worked example for encoded polylines ────────────────────────
const decoded = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
assert(decoded.length === 3, "decodes every point of Google's example");
assert(near(decoded[0].latitude, 38.5) && near(decoded[0].longitude, -120.2), "first point is 38.5, -120.2");
assert(near(decoded[2].latitude, 43.252) && near(decoded[2].longitude, -126.453), "last point is 43.252, -126.453");
assert(decodePolyline("").length === 0, "an empty route draws nothing");

// ─── What the map shows, request by request ──────────────────────────────────
const base = {
  patientLat: 51.501,
  patientLng: -0.1416,
  shift: { lastLat: 51.5033, lastLng: -0.1196, status: "online" as const },
  route: null,
};

const pending = trackingView({ ...base, status: "pending", phase: "queued" });
assert(pending.van === null, "no van on the map before an operator accepts");
assert(pending.home.latitude === 51.501, "the patient's address is always shown");

const queued = trackingView({ ...base, status: "accepted", phase: "queued" });
assert(queued.van === null, "no van while the patient is still waiting in the queue");

const notNext = trackingView({ ...base, status: "in_progress", phase: "en_route", shift: { lastLat: null, lastLng: null, status: "online" } });
assert(notNext.van === null, "no van when the server withheld its position (patient not next)");

const straight = trackingView({ ...base, status: "in_progress", phase: "en_route" });
assert(straight.van !== null && straight.path.length === 2 && !straight.isRoadRoute, "on its way without a road route: a straight line");

const road = trackingView({
  ...base,
  status: "in_progress",
  phase: "en_route",
  route: { encodedPolyline: "_p~iF~ps|U_ulLnnqC_mqNvxq`@", distanceMeters: 2100, durationSeconds: 480 },
});
assert(road.isRoadRoute && road.path.length === 3, "on its way with a road route: the route is drawn");

const arrived = trackingView({ ...base, status: "in_progress", phase: "on_site" });
assert(arrived.van !== null && arrived.path.length === 0, "arrived: van shown at the address, no route");

const treating = trackingView({ ...base, status: "in_progress", phase: "in_treatment" });
assert(treating.van === null, "no van marker once treatment has started");

// ─── Build settings: keys come from the build environment only ───────────────
type BuiltConfig = {
  plugins: (string | [string, Record<string, string>])[];
  extra: { googleMaps: { android: boolean; ios: boolean } };
};
const appConfig = createRequire(__filename)("../../app.config.js") as (ctx: { config: Record<string, unknown> }) => BuiltConfig;
const mapsProps = (c: BuiltConfig) => (c.plugins.at(-1) as [string, Record<string, string>])[1];
const base_ = { plugins: ["expo-router"], extra: { eas: {} } };
const saved = { ...process.env };
delete process.env.GOOGLE_MAP_API;
delete process.env.GOOGLE_MAPS_ANDROID_API_KEY;
delete process.env.GOOGLE_MAPS_IOS_API_KEY;
let out = appConfig({ config: base_ });
assert(out.extra.googleMaps.android === false && out.extra.googleMaps.ios === false, "no key: the app knows there's no Google map");
assert(JSON.stringify(out.plugins.at(-1)) === JSON.stringify(["react-native-maps", {}]), "no key: the maps plugin gets no key");
process.env.GOOGLE_MAPS_ANDROID_API_KEY = "android-test";
process.env.GOOGLE_MAPS_IOS_API_KEY = "ios-test";
out = appConfig({ config: base_ });
const props = mapsProps(out);
assert(props.androidGoogleMapsApiKey === "android-test" && props.iosGoogleMapsApiKey === "ios-test", "each platform gets its own key");
delete process.env.GOOGLE_MAPS_IOS_API_KEY;
process.env.GOOGLE_MAP_API = "shared-test";
out = appConfig({ config: base_ });
assert(mapsProps(out).iosGoogleMapsApiKey === "shared-test", "GOOGLE_MAP_API fills in a missing platform key");
assert(mapsProps(out).androidGoogleMapsApiKey === "android-test", "a platform's own key wins over GOOGLE_MAP_API");
process.env = saved;

const appJson = readFileSync(join(__dirname, "../../app.json"), "utf8");
assert(!/AIza[0-9A-Za-z_-]{20,}/.test(appJson), "no Google key is committed in app.json");

// ─── The screen uses the map ─────────────────────────────────────────────────
const screen = readFileSync(join(__dirname, "../app/(patient)/van/live-track.tsx"), "utf8");
assert(screen.includes("<VanTrackingMap view={trackingView(request)}"), "live tracking shows the map");
assert(screen.includes("{vanComing ? ("), "the fallback panel only draws a van that's actually coming");

// ─── What the sheet says at each stage ───────────────────────────────────────
const sheetBase = { queuePosition: 1, route: null, etaSeconds: null, etaSecondsSnapshot: 480, etaLabel: "5–15 min" };
const sPending = trackingSheet({ ...sheetBase, status: "pending", phase: "queued" });
assert(sPending.step === 0 && sPending.etaMinutes === 8, "pending: first step, ETA from the dispatch estimate");
assert(sPending.etaIsEstimate === true, "pending: the time is marked as an estimate");
assert(vanIsAssigned("accepted") && vanIsAssigned("in_progress") && vanIsAssigned("completed"), "a van is named once an operator has accepted");
assert(!vanIsAssigned("pending") && !vanIsAssigned("declined") && !vanIsAssigned("expired") && !vanIsAssigned("cancelled"), "no van is named before acceptance or when none took the visit");
const sQueued = trackingSheet({ ...sheetBase, status: "accepted", phase: "queued", queuePosition: 3 });
assert(sQueued.step === 1 && sQueued.title.includes("#3"), "queued: says where the patient is in line");
const sDriving = trackingSheet({
  ...sheetBase,
  status: "in_progress",
  phase: "en_route",
  route: { encodedPolyline: "_p~iF~ps|U", distanceMeters: 2100, durationSeconds: 400 },
});
assert(sDriving.step === 2 && sDriving.etaMinutes === 7 && sDriving.title === "Arriving in 7 min", "driving: ETA from the road route");
const sDrivingNoRoute = trackingSheet({ ...sheetBase, status: "in_progress", phase: "en_route", etaSecondsSnapshot: null });
assert(sDrivingNoRoute.etaMinutes === null && sDrivingNoRoute.etaText === "5–15 min", "driving without a route: falls back to the server's range");
const sHere = trackingSheet({ ...sheetBase, status: "in_progress", phase: "on_site" });
assert(sHere.etaMinutes === null && sHere.etaText === null, "arrived: no arrival countdown once the van is parked");
const sTreating = trackingSheet({ ...sheetBase, status: "in_progress", phase: "in_treatment" });
assert(sTreating.etaMinutes === null && sTreating.step === 4, "treating: no countdown, fifth step");
const sDone = trackingSheet({ ...sheetBase, status: "completed", phase: "in_treatment" });
assert(sDone.step === 5 && sDone.tone === "done", "completed: all steps done");
for (const st of ["declined", "expired", "cancelled"] as const) {
  const sheet = trackingSheet({ ...sheetBase, status: st, phase: "queued" });
  assert(sheet.tone === "stopped" && sheet.etaMinutes === null, `${st}: stopped, no ETA`);
}

// ─── The browser map ─────────────────────────────────────────────────────────
const webMap = readFileSync(join(__dirname, "../features/van/van-tracking-map.web.tsx"), "utf8");
assert(webMap.includes("process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY"), "web map reads its own browser key");
assert(!/GOOGLE_MAP_API|GOOGLE_ROUTES_API_KEY/.test(webMap), "web map never uses the server or app keys");
assert(webMap.includes('state === "failed"') && webMap.includes('<View key="fallback"'), "web map falls back to the status panel, in its own element");
const loader = readFileSync(join(__dirname, "../features/van/google-maps-web.ts"), "utf8");
assert(loader.includes("gm_authFailure"), "a key Google refuses switches to the fallback");
assert(screen.includes("bottomInset={sheetHeight}"), "the map is framed above the sheet");

// ─── Zoom cap, both maps ─────────────────────────────────────────────────────
// Fitting the van and the address when the van is a street away zoomed the
// phone map to a single building. Both maps stop at street level.
assert(MAP_MAX_ZOOM >= 16 && MAP_MAX_ZOOM <= 17, `maps stop at street level (zoom ${MAP_MAX_ZOOM})`);
const nativeMap = readFileSync(join(__dirname, "../features/van/van-tracking-map.tsx"), "utf8");
assert(nativeMap.includes("maxZoomLevel={MAP_MAX_ZOOM}"), "the phone map caps its zoom");
assert(webMap.includes("maxZoom: MAP_MAX_ZOOM"), "the web map uses the same cap");

// ─── A frozen marker must not look live (N19) ────────────────────────────────
const clock = new Date("2031-03-11T10:00:00Z");
const minsAgo = (m: number) => new Date(clock.getTime() - m * 60_000).toISOString();
assert(positionAgeLabel(minsAgo(1), clock) === null, "a fresh position shows no age");
assert(positionAgeLabel(minsAgo(4), clock) === "Last seen 4 min ago", "an old position says how old");
assert(positionAgeLabel(minsAgo(90), clock) === "Last seen over an hour ago", "a very old position says so");
assert(positionAgeLabel(null, clock) === null && positionAgeLabel("not a date", clock) === null, "no position or a bad date shows nothing");

// ─── A failed check is not "no request" (N25) ────────────────────────────────
const liveTrack = readFileSync(join(__dirname, "../app/(patient)/van/live-track.tsx"), "utf8");
assert(liveTrack.includes("!request && isError") && liveTrack.includes("<ErrorState"), "a failed status check offers a retry, not a new request");

console.log("\n🎉 ALL VAN MAP TESTS PASSED (0 FAILURES)!\n");
