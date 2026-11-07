/**
 * Automated tests for CS-43: Build Configuration (CG-1, CG-2, CG-3, CG-4).
 *
 * Verifies:
 * 1. app.json has no invented EAS project ID (V-06), a runtimeVersion policy,
 *    and required plugins:
 *    - expo-notifications (CG-1)
 *    - @stripe/stripe-react-native with Apple Pay merchant ID (CG-2)
 *    - iOS entitlements for Apple Pay
 * 2. eas.json commits no placeholder Stripe keys or invented Apple ids (V-06).
 *    Stripe keys come from EAS environment variables; if one is committed,
 *    preview must use pk_test_ and production pk_live_ (CG-2). An Apple Team
 *    ID, if set, is 10 characters (CG-3).
 * 3. .env.example cleanliness (CG-4):
 *    - Dead variables EXPO_PUBLIC_DAILY_URL and EXPO_PUBLIC_DSPT_MODE are removed
 *    - EAS project ID and LAN configuration are documented
 */

import fs from "fs";
import path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n📦 RUNNING CS-43 BUILD CONFIGURATION TESTS...\n");

const rootDir = path.resolve(__dirname, "../..");
const appJsonPath = path.join(rootDir, "app.json");
const easJsonPath = path.join(rootDir, "eas.json");
const envExamplePath = path.join(rootDir, ".env.example");

// 1. app.json Inspection
assert(fs.existsSync(appJsonPath), "app.json exists");
const appConfig = JSON.parse(fs.readFileSync(appJsonPath, "utf-8")).expo;

// EAS Project ID: added by `eas init` once the real Expo account exists (C-03).
// The one committed before was made up (V-06) and must not come back.
const INVENTED_IDS = ["c8c3bb48-932f-4c57-89b5-c05333a4bf45", "PAV8899210", "6540192831"];
const projectId = appConfig.extra?.eas?.projectId;
assert(
  projectId === undefined ||
    (typeof projectId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)),
  `app.json extra.eas.projectId is unset or a UUID (${projectId})`
);
const appJsonText = fs.readFileSync(appJsonPath, "utf-8");
assert(
  INVENTED_IDS.every((id) => !appJsonText.includes(id)),
  "app.json contains none of the invented Expo/Apple ids"
);
if (appConfig.updates?.url) {
  assert(
    projectId !== undefined && appConfig.updates.url.endsWith(projectId),
    "app.json updates.url points at the configured EAS project"
  );
}

// Runtime version policy
assert(
  appConfig.runtimeVersion?.policy === "appVersion",
  "app.json specifies runtimeVersion policy: 'appVersion' for updates"
);

// Plugins
const plugins = appConfig.plugins || [];
const notificationsPlugin = plugins.find(
  (p: unknown) => p === "expo-notifications" || (Array.isArray(p) && p[0] === "expo-notifications")
);
assert(notificationsPlugin !== undefined, "app.json includes 'expo-notifications' plugin (CG-1)");

const sentryPlugin = plugins.find(
  (p: unknown) => p === "@sentry/react-native/expo" || (Array.isArray(p) && p[0] === "@sentry/react-native/expo")
);
assert(sentryPlugin !== undefined, "app.json includes '@sentry/react-native/expo' plugin (RB-08)");

// Van shift location in the background (D-21), and no microphone string now
// that video calls open in the browser (D-01, RB-07).
const locationPlugin = plugins.find((p: unknown) => Array.isArray(p) && p[0] === "expo-location");
const locationOptions = locationPlugin?.[1] ?? {};
assert(
  locationOptions.isIosBackgroundLocationEnabled === true &&
    locationOptions.isAndroidBackgroundLocationEnabled === true &&
    locationOptions.isAndroidForegroundServiceEnabled === true &&
    /shift/i.test(locationOptions.locationAlwaysAndWhenInUsePermission ?? ""),
  "expo-location allows background updates during a shift and explains why (D-21)"
);
// Patients see the "while using" text when they check van coverage, so it must
// give their reason too, not only the operator's (App Store guideline 5.1.1).
const whenInUse: string = locationOptions.locationWhenInUsePermission ?? "";
assert(/whether .*van/i.test(whenInUse) && /postcode/i.test(whenInUse), "location text tells patients why: van coverage and their postcode");
assert(/shift/i.test(whenInUse), "location text still covers the operator's use during a shift");
{
  // The coverage screen asks only when the patient taps "Use my current location".
  const coverage = fs.readFileSync(path.join(__dirname, "../app/(patient)/van/service-area.tsx"), "utf8");
  const onOpen = coverage.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[\]\);/)?.[1] ?? "";
  assert(!/request\w*Permission/.test(onOpen), "coverage screen doesn't ask for location as soon as it opens");
  assert(/getForegroundPermissionsAsync/.test(onOpen), "coverage screen only reads an earlier answer when it opens");
}
const imagePickerPlugin = plugins.find((p: unknown) => Array.isArray(p) && p[0] === "expo-image-picker");
assert(
  appConfig.ios?.infoPlist?.NSMicrophoneUsageDescription === undefined &&
    imagePickerPlugin?.[1]?.microphonePermission === false,
  "app.json asks for no microphone access (calls open in the browser), including through expo-image-picker"
);
assert(
  typeof imagePickerPlugin?.[1]?.cameraPermission === "string" && typeof imagePickerPlugin?.[1]?.photosPermission === "string",
  "expo-image-picker plugin sets the camera and photo library wording (RB-08)"
);

const stripePlugin = plugins.find(
  (p: any) =>
    p === "@stripe/stripe-react-native" ||
    (Array.isArray(p) && p[0] === "@stripe/stripe-react-native")
);
assert(stripePlugin !== undefined, "app.json includes '@stripe/stripe-react-native' plugin (CG-2)");
if (Array.isArray(stripePlugin)) {
  const stripeOptions = stripePlugin[1] || {};
  assert(
    stripeOptions.merchantIdentifier === "merchant.com.pavdental.app",
    "Stripe plugin specifies merchant.com.pavdental.app"
  );
  assert(stripeOptions.enableGooglePay === true, "Stripe plugin enables Google Pay");
}

// iOS Merchant ID & Entitlements. The merchant ID is set through the Stripe
// plugin above; `ios.merchantId` isn't an Expo config field and fails
// expo-doctor's schema check.
assert(appConfig.ios?.merchantId === undefined, "app.json has no ios.merchantId (the Stripe plugin sets it)");
const inAppPayments = appConfig.ios?.entitlements?.["com.apple.developer.in-app-payments"];
assert(
  Array.isArray(inAppPayments) && inAppPayments.includes("merchant.com.pavdental.app"),
  "app.json ios.entitlements includes merchant.com.pavdental.app"
);

// 2. eas.json Inspection
assert(fs.existsSync(easJsonPath), "eas.json exists");
const easConfig = JSON.parse(fs.readFileSync(easJsonPath, "utf-8"));

// Versioning and updates (RB-13)
assert(easConfig.cli?.appVersionSource === "remote", "eas.json specifies cli.appVersionSource: 'remote'");
assert(easConfig.build?.preview?.channel === "preview", "Preview profile specifies release channel 'preview'");
assert(easConfig.build?.production?.channel === "production", "Production profile specifies release channel 'production'");

const devEnv = easConfig.build?.development?.env;
const previewEnv = easConfig.build?.preview?.env;
const prodEnv = easConfig.build?.production?.env;

assert(devEnv?.EXPO_PUBLIC_API_URL !== undefined, "Development profile has API URL");
assert(previewEnv?.EXPO_PUBLIC_API_URL !== undefined, "Preview profile has API URL");
assert(prodEnv?.EXPO_PUBLIC_API_URL !== undefined, "Production profile has API URL");
// D-09: the brand domain is pavdental.com; the .co.uk hosts never existed.
// Preview builds use the free test API until a staging domain exists.
assert(
  previewEnv?.EXPO_PUBLIC_API_URL === "https://pavdental-api.onrender.com",
  `Preview profile points at the test API: ${previewEnv?.EXPO_PUBLIC_API_URL}`
);
assert(
  prodEnv?.EXPO_PUBLIC_API_URL === "https://api.pavdental.com",
  `Production profile points at api.pavdental.com: ${prodEnv?.EXPO_PUBLIC_API_URL}`
);

// Stripe publishable keys per profile (CG-2). They are set with `eas env`,
// so a committed one must at least be for the right mode and not a placeholder.
const easJsonText = fs.readFileSync(easJsonPath, "utf-8");
assert(!/placeholder|replace_with/i.test(easJsonText), "eas.json commits no placeholder values");
const previewKey = previewEnv?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const prodKey = prodEnv?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
assert(
  previewKey === undefined || String(previewKey).startsWith("pk_test_"),
  "Preview build profile never uses a live Stripe key"
);
assert(
  prodKey === undefined || String(prodKey).startsWith("pk_live_"),
  "Production build profile never uses a test Stripe key"
);

// Apple ids (CG-3, V-06): unset until the real Apple account exists (C-01).
const iosSubmit = easConfig.submit?.production?.ios ?? {};
assert(
  iosSubmit.appleTeamId === undefined || /^[A-Z0-9]{10}$/.test(iosSubmit.appleTeamId),
  `submit.production.ios.appleTeamId is unset or a 10-char Team ID: ${iosSubmit.appleTeamId}`
);
assert(
  INVENTED_IDS.every((id) => !easJsonText.includes(id)) && !easJsonText.includes("clinical@pavdental.co.uk"),
  "eas.json contains none of the invented Apple ids"
);

// 3. .env.example Cleanliness (CG-4)
assert(fs.existsSync(envExamplePath), ".env.example exists");
const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");

assert(
  !envExampleContent.includes("EXPO_PUBLIC_DAILY_URL"),
  ".env.example does not contain unused EXPO_PUBLIC_DAILY_URL"
);
assert(
  !envExampleContent.includes("EXPO_PUBLIC_DSPT_MODE"),
  ".env.example does not contain unused EXPO_PUBLIC_DSPT_MODE"
);
assert(
  envExampleContent.includes("EXPO_PUBLIC_EAS_PROJECT_ID"),
  ".env.example documents EXPO_PUBLIC_EAS_PROJECT_ID"
);
assert(
  envExampleContent.includes("192.168."),
  ".env.example documents local LAN IP configuration for physical devices"
);

// Sentry's source-map upload runs in every native build and fails the build
// without a Sentry org, project and token. A .env copied from the template has
// none, so local builds must skip the upload; release builds must not.
assert(
  /^SENTRY_DISABLE_AUTO_UPLOAD=true$/m.test(envExampleContent),
  ".env.example skips the Sentry upload, so `npx expo run:ios` builds without Sentry secrets"
);
for (const profile of ["preview", "production"] as const) {
  const env = (easConfig.build?.[profile]?.env ?? {}) as Record<string, string>;
  assert(env.SENTRY_DISABLE_AUTO_UPLOAD !== "true", `${profile} profile still uploads source maps to Sentry`);
}

// Apple Pay only works when the app asks Stripe for the same merchant ID the
// iOS entitlement grants.
{
  const layout = fs.readFileSync(path.join(__dirname, "../app/_layout.tsx"), "utf8");
  const ids = [...layout.matchAll(/merchantIdentifier="([^"]+)"/g)].map((m) => m[1]);
  assert(ids.length > 0 && ids.every((id) => id === "merchant.com.pavdental.app"), `StripeProvider uses the entitled merchant ID: ${ids.join(", ")}`);
}

// Payment screen guards (found in the first real Stripe test on staging).
{
  const summary = fs.readFileSync(path.join(__dirname, "../app/(patient)/booking/summary.tsx"), "utf8");
  // "Any practitioner" leaves clinicianId as "": sending it makes the API
  // reject the booking as "Invalid request body".
  assert(
    /clinicianId:\s*clinician\?\.id \|\| slot\.clinicianId \|\| undefined/.test(summary) &&
      /clinic\?\.id \|\| slot\.clinicId \|\| undefined/.test(summary),
    "booking sends no clinicianId/clinicId rather than an empty string"
  );
  // Stripe must be started with the server's key, so a build without
  // EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY can still take a payment.
  assert(
    /initStripe\(\{[^}]*publishableKey: intent\.publishableKey[^}]*merchantIdentifier: "merchant\.com\.pavdental\.app"/s.test(summary),
    "payment starts Stripe with the server's publishable key and the entitled merchant ID"
  );
  // Once paid, the confirmed screen clears the draft; this screen must not read
  // that as an expired hold.
  assert(
    /paidRef\.current = true/.test(summary) && (summary.match(/if \(paidRef\.current\) return;/g) ?? []).length >= 3,
    "summary screen stands down after payment instead of showing 'Slot Reservation Expired'"
  );
}

// Release builds never sign in a fake patient or show the role switcher:
// both are for screenshot and simulator builds only. Every profile except the
// local development one is covered, so a new profile (for example a TestFlight
// "beta") can't skip the check.
const releaseProfiles = Object.keys(easConfig.build ?? {}).filter((name) => name !== "development");
assert(releaseProfiles.includes("preview") && releaseProfiles.includes("production"), "preview and production profiles exist");
for (const profile of releaseProfiles) {
  const env = (easConfig.build?.[profile]?.env ?? {}) as Record<string, string>;
  const apiUrl = env.EXPO_PUBLIC_API_URL ?? "";
  assert(/^https:\/\//.test(apiUrl) && !/localhost|127\.0\.0\.1|10\.0\.2\.2/.test(apiUrl), `${profile} profile sets an https API URL`);
  assert(env.EXPO_PUBLIC_DEMO_LOGIN !== "true", `${profile} profile doesn't turn on the demo login`);
  assert(env.EXPO_PUBLIC_ENABLE_ROLE_SWITCHER !== "true", `${profile} profile doesn't turn on the role switcher`);
}

console.log("\n🎉 ALL CS-43 / RB-08 BUILD CONFIGURATION TESTS PASSED!\n");
