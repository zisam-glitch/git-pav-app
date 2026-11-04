import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme";
import { MAP_MAX_ZOOM, type LatLng, type TrackingView } from "./tracking";
import { loadGoogleMaps, onMapsAuthFailure, type GoogleMapsApi, type MapsLatLng, type MapsMap, type MapsMarker, type MapsPolyline } from "./google-maps-web";

type Props = {
  view: TrackingView;
  /** Height of the sheet covering the bottom of the map, so the route stays above it. */
  bottomInset?: number;
  /** Shown where no map can be drawn: no web key, or Google refused it. */
  fallback: React.ReactNode;
};

/**
 * Browser key for the Maps JavaScript API. It ends up in the page, so it must
 * be a separate key restricted to the site's domains (see docs/PRODUCTION-CHECKLIST.md).
 */
const WEB_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY?.trim() ?? "";

const ANIMATION_MS = 1200;

const toLatLng = (p: LatLng): MapsLatLng => ({ lat: p.latitude, lng: p.longitude });

function markerIcon(kind: "van" | "home"): string {
  // The van: a dark disc with a simple van outline. Home: a white disc with a pin.
  const svg =
    kind === "van"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="${colors.ink}" stroke="#fff" stroke-width="3"/><path d="M12 16h13v10H12zM25 19h4l3 3.5V26h-7z" fill="#fff"/><circle cx="16" cy="27.5" r="2.2" fill="#fff"/><circle cx="28" cy="27.5" r="2.2" fill="#fff"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fff" stroke="${colors.ink}" stroke-width="3"/><path d="M20 11a6 6 0 0 0-6 6c0 4.5 6 11 6 11s6-6.5 6-11a6 6 0 0 0-6-6zm0 8.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z" fill="${colors.ink}"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * The patient's live map in a browser: their address, the van while it's
 * coming, and the road route (dashed straight line when there's no route).
 * The van glides between position updates instead of jumping.
 */
export function VanTrackingMap({ view, fallback, bottomInset = 0 }: Props) {
  const container = useRef<View>(null);
  const map = useRef<MapsMap | null>(null);
  const api = useRef<GoogleMapsApi | null>(null);
  const vanMarker = useRef<MapsMarker | null>(null);
  const homeMarker = useRef<MapsMarker | null>(null);
  const line = useRef<MapsPolyline | null>(null);
  const vanAt = useRef<MapsLatLng | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">(WEB_KEY ? "loading" : "failed");

  // Load the API and create the map once.
  useEffect(() => {
    if (!WEB_KEY) return;
    let cancelled = false;
    const unsubscribe = onMapsAuthFailure(() => !cancelled && setState("failed"));
    loadGoogleMaps(WEB_KEY)
      .then((maps) => {
        if (cancelled) return;
        const el = container.current as unknown as HTMLElement | null;
        if (!el) return;
        api.current = maps;
        map.current = new maps.Map(el, {
          center: toLatLng(view.home),
          zoom: 14,
          // Don't zoom to street furniture when the van is parked at the door.
          maxZoom: MAP_MAX_ZOOM,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          clickableIcons: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });
        setState("ready");
      })
      .catch(() => !cancelled && setState("failed"));
    return () => {
      cancelled = true;
      unsubscribe();
    };
    // The map is created once; later changes are applied by the effect below.
  }, []);

  // Draw the address, van and route, and keep them framed above the sheet.
  const { home, van, path, isRoadRoute } = view;
  const pathKey = path.map((p) => `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`).join(";");
  useEffect(() => {
    const maps = api.current;
    const m = map.current;
    if (state !== "ready" || !maps || !m) return;

    if (!homeMarker.current) {
      homeMarker.current = new maps.Marker({
        map: m,
        position: toLatLng(home),
        title: "Your address",
        icon: { url: markerIcon("home"), scaledSize: new maps.Size(40, 40), anchor: new maps.Point(20, 20) },
        zIndex: 1,
      });
    } else {
      homeMarker.current.setPosition(toLatLng(home));
    }

    line.current?.setMap(null);
    line.current = null;
    if (path.length >= 2) {
      line.current = new maps.Polyline({
        map: m,
        path: path.map(toLatLng),
        strokeColor: colors.ink,
        strokeOpacity: isRoadRoute ? 0.9 : 0,
        strokeWeight: 5,
        icons: isRoadRoute
          ? []
          : [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeWeight: 3, scale: 3 }, offset: "0", repeat: "14px" }],
      });
    }

    let frame = 0;
    if (van) {
      const target = toLatLng(van);
      if (!vanMarker.current) {
        vanMarker.current = new maps.Marker({
          map: m,
          position: target,
          title: "Dental van",
          icon: { url: markerIcon("van"), scaledSize: new maps.Size(44, 44), anchor: new maps.Point(22, 22) },
          zIndex: 2,
        });
        vanAt.current = target;
      } else {
        // Glide from where the van was drawn to its new position.
        const from = vanAt.current ?? target;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / ANIMATION_MS);
          const ease = t * (2 - t);
          const at = { lat: from.lat + (target.lat - from.lat) * ease, lng: from.lng + (target.lng - from.lng) * ease };
          vanMarker.current?.setPosition(at);
          vanAt.current = at;
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      }
    } else {
      vanMarker.current?.setMap(null);
      vanMarker.current = null;
      vanAt.current = null;
    }

    // Frame everything in the part of the map above the sheet. With only the
    // address, frame a small area around it (about 300 m each way).
    const points = van || path.length ? [home, ...(van ? [van] : []), ...path] : [
      { latitude: home.latitude - 0.003, longitude: home.longitude - 0.004 },
      { latitude: home.latitude + 0.003, longitude: home.longitude + 0.004 },
    ];
    const bounds = new maps.LatLngBounds();
    points.forEach((p) => bounds.extend(toLatLng(p)));
    m.fitBounds(bounds, { top: 90, right: 50, bottom: bottomInset + 40, left: 50 });
    return () => cancelAnimationFrame(frame);
    // pathKey and the rounded positions stand in for the arrays.
  }, [
    state,
    home.latitude,
    home.longitude,
    van?.latitude,
    van?.longitude,
    pathKey,
    isRoadRoute,
    Math.round(bottomInset),
  ]);

  // Separate keyed wrappers: React must not reuse the map's element for the
  // fallback, or Google's own error page stays on screen behind it.
  if (state === "failed") {
    return (
      <View key="fallback" style={styles.map}>
        {fallback}
      </View>
    );
  }

  return (
    <View
      key="google-map"
      ref={container}
      style={styles.map}
      accessibilityLabel={van ? "Map showing the dental van on its way to your address" : "Map showing your address"}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: colors.inkSubtle,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
