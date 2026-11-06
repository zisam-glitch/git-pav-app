/**
 * A release build must never quietly talk to localhost (TestFlight plan, phase 2).
 */
import { resolveApiUrl } from "../config/api-url";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

function throws(fn: () => unknown) {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
}

assert(resolveApiUrl({}, true) === "http://localhost:3000", "development falls back to the local backend");
assert(resolveApiUrl({ url: "http://192.168.1.5:3000" }, true) === "http://192.168.1.5:3000", "development accepts a LAN address");
assert(resolveApiUrl({ url: "https://api.example.test/" }, false) === "https://api.example.test", "release keeps an https URL and drops the trailing slash");
assert(throws(() => resolveApiUrl({}, false)), "release build with no URL fails");
assert(throws(() => resolveApiUrl({ url: "  " }, false)), "release build with a blank URL fails");
assert(throws(() => resolveApiUrl({ url: "http://localhost:3000" }, false)), "release build pointing at localhost fails");
assert(throws(() => resolveApiUrl({ url: "http://10.0.2.2:3000" }, false)), "release build pointing at the Android emulator host fails");
assert(throws(() => resolveApiUrl({ url: "http://api.example.test" }, false)), "release build over plain http fails");

console.log("\n🎉 ALL API URL TESTS PASSED!");
