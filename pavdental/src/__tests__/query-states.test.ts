// Tests for CS-37: Loading, error, empty, and offline states (MA-4)
import { resolveQueryState } from "../lib/query-state-resolver";
import { useNetworkStore } from "../lib/network";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("\n📱 RUNNING QUERY STATE & OFFLINE RESILIENCE TESTS (CS-37, MA-4)...\n");

  // ─── Test 1: Network store state ─────────────────────────────────────────────
  useNetworkStore.getState().setNetworkState({ isConnected: true, isInternetReachable: true });
  assert(useNetworkStore.getState().isConnected === true, "Network is online when connected and reachable");

  useNetworkStore.getState().setNetworkState({ isConnected: false, isInternetReachable: false });
  assert(useNetworkStore.getState().isConnected === false, "Network store accurately tracks offline state");

  // ─── Test 2: Representative Screen 1 - Patient Appointments List ─────────────
  // 2a: Offline without cached data
  const apptOffline = resolveQueryState({
    isOnline: false,
    isLoading: false,
    data: null,
  });
  assert(apptOffline === "offline", "Appointments resolves to 'offline' when device is offline without cached data");

  // 2b: Loading state
  const apptLoading = resolveQueryState({
    isOnline: true,
    isLoading: true,
    data: null,
  });
  assert(apptLoading === "loading", "Appointments resolves to 'loading' skeleton state while fetching");

  // 2c: Error state
  const apptError = resolveQueryState({
    isOnline: true,
    isLoading: false,
    isError: true,
    data: null,
  });
  assert(apptError === "error", "Appointments resolves to 'error' state on network/API failure");

  // 2d: Empty state
  const apptEmpty = resolveQueryState({
    isOnline: true,
    isLoading: false,
    data: [],
  });
  assert(apptEmpty === "empty", "Appointments resolves to 'empty' state when patient has no appointments");

  // 2e: Success state
  const apptSuccess = resolveQueryState({
    isOnline: true,
    isLoading: false,
    data: [{ id: "appt_1", title: "Hygiene appointment" }],
  });
  assert(apptSuccess === "success", "Appointments resolves to 'success' state when appointments exist");

  // ─── Test 3: Representative Screen 2 - Clinician Schedule ────────────────────
  // Clinician schedule failure must resolve to error, NEVER false 'empty' (0 patients)
  const scheduleError = resolveQueryState({
    isOnline: true,
    isLoading: false,
    isError: true,
    error: new Error("500 Internal Server Error"),
    data: null,
  });
  assert(scheduleError === "error", "Clinician schedule resolves to 'error' on API failure (never false 0 patients)");

  const scheduleLoading = resolveQueryState({
    isOnline: true,
    isLoading: true,
    data: null,
  });
  assert(scheduleLoading === "loading", "Clinician schedule resolves to 'loading' while fetching rota/appointments");

  const scheduleEmpty = resolveQueryState({
    isOnline: true,
    isLoading: false,
    data: [],
  });
  assert(scheduleEmpty === "empty", "Clinician schedule resolves to 'empty' when clinician has no booked visits today");

  // ─── Test 4: Representative Screen 3 - Patient Prescriptions ─────────────────
  const rxEmpty = resolveQueryState({
    isOnline: true,
    isLoading: false,
    data: [],
  });
  assert(rxEmpty === "empty", "Prescriptions resolves to 'empty' without fabricated default medicines");

  const rxError = resolveQueryState({
    isOnline: true,
    isLoading: false,
    isError: true,
    data: null,
  });
  assert(rxError === "error", "Prescriptions resolves to 'error' on server fault");

  const rxOfflineWithCache = resolveQueryState({
    isOnline: false,
    isLoading: false,
    data: [{ id: "rx_1", medicationName: "Amoxicillin" }],
  });
  assert(rxOfflineWithCache === "success", "Prescriptions serves cached data when offline if previously loaded");

  // ─── Test 5: Clinic picker (offline must not read as "No clinics available") ──
  const clinicsOffline = resolveQueryState({ isOnline: false, isLoading: false, isError: false, data: undefined });
  assert(clinicsOffline === "offline", "Clinic picker resolves to 'offline' (not 'empty') when the fetch is paused offline");

  const clinicsFailed = resolveQueryState({ isOnline: true, isLoading: false, isError: true, data: undefined });
  assert(clinicsFailed === "error", "Clinic picker resolves to 'error' when the clinics fetch fails");

  const clinicsEmpty = resolveQueryState({ isOnline: true, isLoading: false, isError: false, data: [] });
  assert(clinicsEmpty === "empty", "Clinic picker keeps 'empty' for a successful empty response");

  const fs = await import("fs");
  const picker = fs.readFileSync("src/app/(patient)/booking/clinic-picker.tsx", "utf8");
  assert(
    picker.includes("resolveQueryState") && picker.includes('view === "offline"') && picker.includes("onRetry"),
    "Clinic picker screen renders an error state with retry for offline/failed loads"
  );

  console.log("\n🎉 ALL QUERY STATE & OFFLINE RESILIENCE TESTS PASSED SUCCESSFULLY!\n");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
