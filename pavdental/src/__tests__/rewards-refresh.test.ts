// Stale perks balance: a persisted/cached old balance must be replaced by a fresh fetch.
import { QueryClient, QueryObserver, focusManager } from "@tanstack/react-query";
import { rewardsQueryOptions, REWARDS_QUERY_KEY } from "../features/records/rewards-query";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

async function run() {
  console.log("\n🎁 RUNNING REWARDS REFRESH TESTS...\n");
  // Same defaults as src/lib/query-client.ts (30 second staleTime).
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 30 * 1000, retry: false } } });

  client.mount(); // subscribes to focusManager, as QueryClientProvider does

  // Old balance restored from a previous session, only a minute old.
  client.setQueryData(REWARDS_QUERY_KEY, { pointsBalance: 120 }, { updatedAt: Date.now() - 60_000 });

  let calls = 0;
  const observer = new QueryObserver(
    client,
    rewardsQueryOptions(async () => {
      calls++;
      return { pointsBalance: 450 };
    }),
  );
  const seen: number[] = [];
  const unsubscribe = observer.subscribe((r) => {
    if (r.data) seen.push((r.data as { pointsBalance: number }).pointsBalance);
  });
  assert(seen[0] === 120, "Old balance is shown immediately as a placeholder");

  await new Promise((r) => setTimeout(r, 20));
  assert(calls === 1, "Mounting refetches even though the cached value is inside the default staleTime");
  assert(client.getQueryData<{ pointsBalance: number }>(REWARDS_QUERY_KEY)?.pointsBalance === 450, "Fresh balance replaces the old one");
  assert(seen[seen.length - 1] === 450, "Observer ends on the fresh balance");

  // Returning to the foreground revalidates too.
  focusManager.setFocused(false);
  focusManager.setFocused(true);
  await new Promise((r) => setTimeout(r, 20));
  assert(calls === 2, "App returning to foreground refetches the balance");

  unsubscribe();
  client.unmount();
  client.clear();
}
run();
