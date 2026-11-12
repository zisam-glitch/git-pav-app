// Shared GPS tracking for the operator portals.
//
// Replaces the mock drift loop that previously fed location pings: while the
// operator is on shift, the device's real position is watched via
// expo-location and pushed to the backend with `sendLocationPing`. The last
// fix is also exposed so the route screen can origin-anchor turn-by-turn
// deep links.
//
// Permission is requested once per hook lifetime; a denial is reported
// through `error` and pinging is simply disabled (dispatch still works, but
// patient ETAs degrade to the van's last known position).
//
// D-21: once the foreground permission is granted it also asks for
// background location and, if allowed, starts background updates
// (background-location.ts), which then send the pings instead of the timer
// here. Background updates outlive this hook: they stop when the shift ends
// (enabled turns false) or the operator signs out, not when a screen closes.

import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { sendLocationPing } from "./van-api";
import { startShiftBackgroundLocation, stopShiftBackgroundLocation } from "./background-location";
import { PRACTICE_CONFIG } from "@/config/practice";

export type OperatorFix = { lat: number; lng: number; accuracyM?: number; at?: number };

const PING_INTERVAL_MS = 20_000; // matches the previous ping cadence
const WATCH_ACCURACY = Location.Accuracy.Balanced;

export function useOperatorLocation(options: { enabled: boolean }) {
  const { enabled } = options;

  const [fix, setFix] = useState<OperatorFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestFixRef = useRef<OperatorFix | null>(null);
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    // Only a shift that was on and has now ended stops background updates;
    // a screen mounting before the shift has loaded doesn't.
    if (!enabled) {
      if (wasEnabledRef.current) void stopShiftBackgroundLocation();
      wasEnabledRef.current = false;
      return;
    }
    wasEnabledRef.current = true;

    let cancelled = false;

    async function start() {
      // In simulator / development environments, avoid native OS modal blocks
      if (__DEV__) {
        // Development builds have no GPS: stand in for one at the practice.
        const devFix = { ...PRACTICE_CONFIG.location };
        latestFixRef.current = devFix;
        setFix(devFix);
        setGpsActive(true);
        setError(null);
        return;
      }

      try {
        let status = "granted";
        try {
          const perm = await Location.getForegroundPermissionsAsync();
          if (perm.status === "granted") {
            status = "granted";
          } else if (perm.canAskAgain) {
            const req = await Location.requestForegroundPermissionsAsync();
            status = req.status;
          }
        } catch {
          // fallback in simulator
        }

        if (status !== "granted") {
          setGpsActive(false);
          setError("Location permission denied");
          return;
        }

        const subscription = await Location.watchPositionAsync(
          { accuracy: WATCH_ACCURACY, timeInterval: PING_INTERVAL_MS, distanceInterval: 25 },
          (position) => {
            const next: OperatorFix = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracyM: position.coords.accuracy ?? undefined,
              at: position.timestamp,
            };
            latestFixRef.current = next;
            setFix(next);
            setGpsActive(true);
            setError(null);
          }
        );
        if (cancelled) {
          subscription.remove();
          return;
        }
        watchRef.current = subscription;

        // Background updates send their own pings; otherwise ping from here.
        let background = false;
        try {
          background = await startShiftBackgroundLocation();
        } catch {
          // Not available (for example Expo Go): foreground pings only.
        }
        if (cancelled || background) return;

        // Periodic server ping with the latest fix (independent of the watch
        // callbacks so a stationary van still reports liveness).
        pingTimerRef.current = setInterval(async () => {
          const current = latestFixRef.current;
          if (!current) return; // no fix yet — skip silently
          try {
            await sendLocationPing({
              lat: current.lat,
              lng: current.lng,
              accuracyM: current.accuracyM,
              recordedAt: current.at ? new Date(current.at).toISOString() : undefined,
            });
          } catch {
            // Location ping errors are non-fatal
          }
        }, PING_INTERVAL_MS);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Could not start location tracking");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      setGpsActive(false);
    };
  }, [enabled]);

  return { fix, error, gpsActive };
}
