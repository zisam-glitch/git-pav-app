// Backend-free helpers for operator van navigation.
//
// Turn-by-turn is delegated to the platform's native maps app via universal
// links — no embedded SDK, no API key on the client, and the operator gets
// the full navigation experience (live traffic, voice guidance) they already
// trust. Apple Maps on iOS (maps:// scheme with an https fallback), Google
// Maps on Android (universal link opens the app when installed).

import { Linking, Platform } from "react-native";
import { reportCaughtError } from "../../lib/caught-errors";

export type LatLng = { lat: number; lng: number };

/**
 * Open the platform maps app with driving directions to a destination.
 * When `origin` is provided it is anchored as the start point (needed when
 * the device GPS is unavailable or permission is denied); otherwise the
 * maps app uses the device's current location.
 */
export async function openDrivingDirections(
  destination: LatLng,
  destinationLabel: string | undefined,
  origin?: LatLng
): Promise<void> {
  const dLat = destination.lat.toFixed(6);
  const dLng = destination.lng.toFixed(6);
  const label = encodeURIComponent(destinationLabel ?? "Destination");

  let url: string;
  if (Platform.OS === "ios") {
    // Apple Maps with driving directions. Prefer the maps:// scheme so the
    // native app opens directly; the https form covers devices/menus where
    // custom schemes are blocked.
    const o = origin
      ? `saddr=${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}`
      : "saddr=Current%20Location";
    url = `maps://?daddr=${dLat},${dLng}&${o}&dirflg=d&q=${label}`;
  } else {
    // Google Maps universal link — opens the app on Android when installed,
    // otherwise falls back to the browser and still navigates.
    const o = origin
      ? `&origin=${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}`
      : "";
    url = `https://www.google.com/maps/dir/?api=1&destination=${dLat},${dLng}&travelmode=driving${o}`;
  }

  const supported = await Linking.canOpenURL(url).catch(() => false);
  const fallback = Platform.OS === "ios" && !supported
    ? `https://maps.apple.com/?daddr=${dLat},${dLng}&dirflg=d`
    : url;

  await Linking.openURL(fallback).catch((err) => {
    reportCaughtError(err, "nav-links openURL");
    throw new Error("Could not open the maps app");
  });
}
