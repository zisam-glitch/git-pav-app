import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Constants from "expo-constants";
import { AppIcon } from "@/components";
import { colors, radius } from "@/theme";
import type { TrackingView } from "./tracking";

type Props = {
  view: TrackingView;
  /** Shown instead of the map where it can't be drawn (Android build without a key). */
  fallback: React.ReactNode;
};

/** Whether this build was given a Google Maps key (set in app.config.js). */
function hasGoogleKey(): boolean {
  const flags = (Constants.expoConfig?.extra as { googleMaps?: { android?: boolean; ios?: boolean } } | undefined)
    ?.googleMaps;
  return Platform.OS === "android" ? Boolean(flags?.android) : Boolean(flags?.ios);
}

/**
 * The patient's live map: their address, the van while it's coming to them,
 * and the road route (or a dashed straight line when there's no route).
 * Google Maps when the build has a key; Apple Maps on iPhone otherwise.
 */
export function VanTrackingMap({ view, fallback }: Props) {
  const mapRef = useRef<MapView>(null);
  const google = hasGoogleKey();
  const { home, van, path, isRoadRoute } = view;

  // Keep the van, the address and the route in view as the van moves.
  const fitKey = van ? `${van.latitude.toFixed(4)},${van.longitude.toFixed(4)}:${path.length}` : "home";
  useEffect(() => {
    const points = [home, ...(van ? [van] : []), ...path];
    if (points.length < 2) return;
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
      animated: true,
    });
    // Re-fit only when fitKey changes: the van moved noticeably or the route changed.
  }, [fitKey]);

  if (Platform.OS === "android" && !google) return <>{fallback}</>;

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={google ? PROVIDER_GOOGLE : undefined}
      initialRegion={{ ...home, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
      showsUserLocation={false}
      toolbarEnabled={false}
      accessibilityLabel={van ? "Map showing the dental van on its way to your address" : "Map showing your address"}
    >
      {path.length >= 2 ? (
        <Polyline
          coordinates={path}
          strokeColor={colors.ink}
          strokeWidth={4}
          lineDashPattern={isRoadRoute ? undefined : [8, 8]}
        />
      ) : null}
      <Marker coordinate={home} title="Your address" anchor={{ x: 0.5, y: 0.5 }}>
        <View style={[styles.bubble, styles.homeBubble]}>
          <AppIcon name="mapPin" size={18} color={colors.ink} />
        </View>
      </Marker>
      {van ? (
        <Marker coordinate={van} title="Dental van" anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.bubble}>
            <AppIcon name="truck" size={18} color={colors.onInk} />
          </View>
        </Marker>
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderColor: colors.systemBackground,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  homeBubble: {
    backgroundColor: colors.systemBackground,
    borderColor: colors.ink,
  },
});
