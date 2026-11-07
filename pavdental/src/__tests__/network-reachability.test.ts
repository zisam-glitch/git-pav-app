/**
 * The app decides it is "offline" from the OS reachability check, and when it
 * does its data layer pauses every request. That check must not depend on a
 * third-party address: it probes our own API, and any answer counts as online.
 */
import { REACHABILITY_CONFIG } from "../lib/network";
import { API_URL } from "../config/api";

let failures = 0;
function assert(condition: boolean, message: string) {
  if (condition) console.log(`✓ PASSED: ${message}`);
  else {
    failures += 1;
    console.error(`✗ FAILED: ${message}`);
  }
}

assert(REACHABILITY_CONFIG.reachabilityUrl === `${API_URL}/health`, "reachability probes our own API's /health");
assert(!/google|gstatic|apple\.com/i.test(REACHABILITY_CONFIG.reachabilityUrl), "reachability does not depend on a third-party address");

(async () => {
  for (const status of [200, 204, 401, 404, 500, 503]) {
    const online = await REACHABILITY_CONFIG.reachabilityTest({ status } as unknown as Response);
    assert(online === true, `HTTP ${status} from our API still means the network works`);
  }
  assert(
    REACHABILITY_CONFIG.reachabilityShortTimeout <= 10_000 && REACHABILITY_CONFIG.reachabilityLongTimeout >= 20_000,
    "short timeout when online, longer when recovering (free-tier hosts wake slowly)"
  );
  if (failures > 0) {
    console.error(`\n${failures} reachability test(s) failed`);
    process.exit(1);
  }
  console.log("\n🎉 ALL NETWORK REACHABILITY TESTS PASSED!");
})();
