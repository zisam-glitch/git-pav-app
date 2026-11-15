/**
 * Over-the-air updates (ADR-0005): expo-updates is installed, and the update
 * address is built only from a real EAS project id, never an invented one.
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`PASSED: ${message}`);
}

type Built = { updates?: { enabled?: boolean; url?: string; checkAutomatically?: string; fallbackToCacheTimeout?: number }; runtimeVersion?: { policy?: string } };
const build = createRequire(__filename)("../../app.config.js") as (ctx: { config: Record<string, unknown> }) => Built;
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8"));

assert(typeof pkg.dependencies?.["expo-updates"] === "string", "expo-updates is a dependency");

const noId = build({ config: { runtimeVersion: { policy: "appVersion" } } });
assert(noId.updates?.enabled === false, "with no EAS project id, updates are off");
assert(noId.updates?.url === undefined, "with no EAS project id, there is no update address");

const withId = build({ config: { extra: { eas: { projectId: "11111111-2222-3333-4444-555555555555" } } } });
assert(withId.updates?.enabled === true, "with an EAS project id, updates are on");
assert(withId.updates?.url === "https://u.expo.dev/11111111-2222-3333-4444-555555555555", "the update address is built from the project id");
assert(withId.updates?.checkAutomatically === "ON_LOAD", "the app checks for an update when it opens");
assert(withId.updates?.fallbackToCacheTimeout === 0, "the first screen never waits for an update");

const appJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../app.json"), "utf-8")).expo;
assert(appJson.runtimeVersion?.policy === "appVersion", "updates only reach builds of the same app version");
console.log("\nOTA update config tests passed.");
