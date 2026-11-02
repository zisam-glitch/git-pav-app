import type { VanServiceRequest } from "./van-types";

export type LatLng = { latitude: number; longitude: number };

/**
 * Decodes a Google encoded polyline (precision 5) into map coordinates.
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const next = (): number | null => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      if (index >= encoded.length) return null;
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    const dLat = next();
    const dLng = next();
    if (dLat === null || dLng === null) break;
    lat += dLat;
    lng += dLng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export type TrackingView = {
  /** The patient's address. */
  home: LatLng;
  /** The van, only while it's coming to this patient and they may see it. */
  van: LatLng | null;
  /** What to draw between them: the road route, or a straight line. */
  path: LatLng[];
  isRoadRoute: boolean;
};

/**
 * What the patient's map shows. The van appears only once an operator has
 * accepted and is driving to, or parked at, this patient, and only when the
 * server sent its position (it does for the patient who's next).
 */
export function trackingView(request: Pick<VanServiceRequest, "status" | "phase" | "patientLat" | "patientLng" | "shift" | "route">): TrackingView {
  const home = { latitude: request.patientLat, longitude: request.patientLng };
  const lat = request.shift?.lastLat;
  const lng = request.shift?.lastLng;
  const coming =
    (request.status === "accepted" || request.status === "in_progress") &&
    (request.phase === "en_route" || request.phase === "on_site");
  const van = coming && lat != null && lng != null ? { latitude: lat, longitude: lng } : null;

  if (!van || request.phase !== "en_route") return { home, van, path: [], isRoadRoute: false };
  const road = request.route?.encodedPolyline ? decodePolyline(request.route.encodedPolyline) : [];
  return road.length >= 2
    ? { home, van, path: road, isRoadRoute: true }
    : { home, van, path: [van, home], isRoadRoute: false };
}
