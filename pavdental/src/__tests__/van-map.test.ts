/**
 * The patient's live van map (Uber-style tracking).
 */

import { readFileSync } from "fs";
import { createRequire } from "module";
import { join } from "path";
import { decodePolyline, trackingView } from "../features/van/tracking";

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

console.log("\n🎉 ALL VAN MAP TESTS PASSED (0 FAILURES)!\n");
