import type { KeyValueStore } from "@/features/van/offline-notes-queue";
import {
  enqueuePhaseChange,
  flushPhaseQueue,
  isOfflinePhaseError,
  readPhaseQueue,
} from "@/features/van/offline-phase-queue";

function memoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    get: async (k) => map.get(k) ?? null,
    set: async (k, v) => {
      map.set(k, v);
    },
    remove: async (k) => {
      map.delete(k);
    },
  };
}

describe("offline-phase-queue (N17)", () => {
  it("enqueues phase changes in FIFO order and skips consecutive duplicates per stop", async () => {
    const store = memoryStore();
    await enqueuePhaseChange(store, { stopId: "s1", phase: "en_route", queuedAt: "t1", userId: "op1" });
    await enqueuePhaseChange(store, { stopId: "s1", phase: "en_route", queuedAt: "t2", userId: "op1" });
    await enqueuePhaseChange(store, { stopId: "s1", phase: "on_site", queuedAt: "t3", userId: "op1" });

    const q = await readPhaseQueue(store);
    expect(q.map((x) => x.phase)).toEqual(["en_route", "on_site"]);
  });

  it("flushes in strict FIFO order and blocks later steps on the same stop when an earlier step needs retry", async () => {
    const store = memoryStore();
    await enqueuePhaseChange(store, { stopId: "s1", phase: "en_route", queuedAt: "t1", userId: "op1" });
    await enqueuePhaseChange(store, { stopId: "s1", phase: "on_site", queuedAt: "t2", userId: "op1" });
    await enqueuePhaseChange(store, { stopId: "s2", phase: "en_route", queuedAt: "t3", userId: "op1" });
    await enqueuePhaseChange(store, { stopId: "s3", phase: "en_route", queuedAt: "t4", userId: "op2" });

    const sent: string[] = [];
    const remaining = await flushPhaseQueue(store, "op1", async (item) => {
      sent.push(`${item.stopId}:${item.phase}`);
      if (item.stopId === "s1" && item.phase === "en_route") return "retry";
      return "sent";
    });

    expect(sent).toEqual(["s1:en_route", "s2:en_route"]);
    expect(remaining).toBe(2); // s1:en_route and s1:on_site remain; s2 sent; op2 kept untouched
    const q = await readPhaseQueue(store);
    expect(q.map((x) => `${x.userId}:${x.stopId}:${x.phase}`)).toEqual([
      "op1:s1:en_route",
      "op1:s1:on_site",
      "op2:s3:en_route",
    ]);
  });

  it("drops 4xx items so stale transitions do not block the queue", async () => {
    const store = memoryStore();
    await enqueuePhaseChange(store, { stopId: "s1", phase: "en_route", queuedAt: "t1", userId: "op1" });
    await enqueuePhaseChange(store, { stopId: "s1", phase: "on_site", queuedAt: "t2", userId: "op1" });

    const remaining = await flushPhaseQueue(store, "op1", async (item) =>
      item.phase === "en_route" ? "drop" : "sent",
    );
    expect(remaining).toBe(0);
    expect(await readPhaseQueue(store)).toEqual([]);
  });

  it("classifies network/5xx errors as offline-retryable and 4xx validation errors as not", () => {
    expect(isOfflinePhaseError(new TypeError("Network request failed"))).toBe(true);
    expect(isOfflinePhaseError(Object.assign(new Error("Bad gateway"), { status: 502 }))).toBe(true);
    expect(isOfflinePhaseError(new Error("Request timed out"))).toBe(true);
    expect(isOfflinePhaseError(Object.assign(new Error("Illegal phase transition"), { status: 409 }))).toBe(false);
  });
});
