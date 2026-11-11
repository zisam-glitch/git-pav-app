// D-21: while a van operator is on shift, the van's position keeps reaching
// the backend when the app is in the background or the phone is in a dock
// running a sat-nav app. Android shows an ongoing notification for as long as
// it runs; iOS shows the blue location indicator. Tracking stops when the
// shift ends or the operator signs out.
//
// If the operator declines "Allow all the time", tracking falls back to the
// app being open (use-operator-location.ts).

import { Platform } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useAuthStore } from "../auth/auth-store";
import { sendLocationPing } from "./van-api";

export const SHIFT_LOCATION_TASK = "pav-van-shift-location";
const INTERVAL_MS = 20_000; // same cadence as the foreground pings

// Defined when this module loads (it's imported from the root layout), so the
// OS can find the task when it wakes the app in the background.
if (Platform.OS !== "web") {
  TaskManager.defineTask(
    SHIFT_LOCATION_TASK,
    async ({
      data,
      error,
    }: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
      if (error || !data?.locations?.length) return;
    // Signed out, or someone else signed in: stop rather than send.
    if (useAuthStore.getState().user?.role !== "operator") {
      await stopShiftBackgroundLocation();
      return;
    }
    const last = data.locations[data.locations.length - 1];
    try {
      await sendLocationPing({
        lat: last.coords.latitude,
        lng: last.coords.longitude,
        accuracyM: last.coords.accuracy ?? undefined,
        recordedAt: new Date(last.timestamp).toISOString(),
      });
    } catch {
      // Non-fatal: the next update tries again.
    }
  });
}

/** Starts background updates; false when the operator didn't allow it. */
export async function startShiftBackgroundLocation(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  let permission = await Location.getBackgroundPermissionsAsync();
  if (!permission.granted && permission.canAskAgain) permission = await Location.requestBackgroundPermissionsAsync();
  if (!permission.granted) return false;
  if (await Location.hasStartedLocationUpdatesAsync(SHIFT_LOCATION_TASK)) return true;
  await Location.startLocationUpdatesAsync(SHIFT_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: INTERVAL_MS,
    distanceInterval: 25,
    deferredUpdatesInterval: INTERVAL_MS,
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.AutomotiveNavigation,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Shift in progress",
      notificationBody: "Sharing the van's location with today's patients until you end your shift.",
      notificationColor: "#0D9488",
    },
  });
  return true;
}

export async function stopShiftBackgroundLocation(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    if (await Location.hasStartedLocationUpdatesAsync(SHIFT_LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(SHIFT_LOCATION_TASK);
    }
  } catch {
    // Already stopped, or the task was never registered.
  }
}
