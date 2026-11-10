/**
 * Screens do not go stale (R7).
 *
 * Data counts as fresh for 30 seconds (it was 5 minutes), the main patient
 * screens can be pulled down to refresh, and messages poll.
 */

import { readFileSync } from "fs";
import { join } from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log("\n🔄 FRESH DATA (R7)\n");

const read = (p: string) => readFileSync(join(__dirname, "..", p), "utf8");

const client = read("lib/query-client.ts");
assert(/staleTime:\s*30\s*\*\s*1000/.test(client), "Data is fresh for 30 seconds, not 5 minutes");

const api = read("features/hooks/use-dental-api.ts");
const threads = api.slice(api.indexOf("export function useMessageThreads"), api.indexOf("export function useCreateMessageThreadMutation"));
assert(/refetchInterval:\s*30\s*\*\s*1000/.test(threads), "Message threads poll every 30 seconds");

for (const screen of ["home", "appointments", "messages", "records"]) {
  const src = read(`app/(patient)/(tabs)/${screen}.tsx`);
  assert(src.includes("usePullToRefresh()") && src.includes("<RefreshControl"), `${screen} can be pulled down to refresh`);
}

const hook = read("lib/pull-to-refresh.ts");
assert(hook.includes('refetchQueries({ type: "active" })'), "Pulling down refetches what the screens are showing");

console.log("\n🎉 ALL FRESH DATA TESTS PASSED!\n");
