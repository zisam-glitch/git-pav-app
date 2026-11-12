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

/**
 * Closest the live map zooms, on the phone and on the web: street level. Fitting
 * the van and the address when the van is a street away would otherwise zoom
 * in to a single building.
 */
export const MAP_MAX_ZOOM = 17;

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

/** Only these requests have a van to name: pending, declined, expired and cancelled-before-accept show none of its details. */
export function vanIsAssigned(status: VanServiceRequest["status"]): boolean {
  return status === "accepted" || status === "in_progress" || status === "completed";
}

export type SheetTone = "waiting" | "moving" | "arrived" | "treating" | "done" | "stopped";

export type TrackingSheet = {
  /** The big line at the top of the sheet. */
  title: string;
  /** One line under it. */
  subtitle: string;
  /** Minutes until the van arrives: only while it's queued or driving. */
  etaMinutes: number | null;
  /** Fallback ETA text from the server ("5–15 min") when there are no minutes. */
  etaText: string | null;
  /** True before an operator accepts: the time is a dispatch estimate, no van is on its way yet. */
  etaIsEstimate?: boolean;
  /** 0 request, 1 queued, 2 driving, 3 arrived, 4 treating, 5 done. */
  step: number;
  tone: SheetTone;
};

type SheetInput = Pick<
  VanServiceRequest,
  "status" | "phase" | "queuePosition" | "route" | "etaSeconds" | "etaSecondsSnapshot" | "etaLabel"
>;

const minutes = (seconds: number | null | undefined) =>
  seconds != null && seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : null;

/**
 * What the live-tracking sheet says at each stage. The arrival time shows
 * only before the van gets there: once it's parked, a countdown means nothing.
 */
export function trackingSheet(request: SheetInput): TrackingSheet {
  const { status, phase } = request;
  const base = { etaMinutes: null, etaText: null };

  if (status === "declined") {
    return { ...base, title: "No van could take this visit", subtitle: "Any deposit hold has been released.", step: 0, tone: "stopped" };
  }
  if (status === "expired") {
    return { ...base, title: "Request timed out", subtitle: "No van accepted in time. Any deposit hold has been released.", step: 0, tone: "stopped" };
  }
  if (status === "cancelled") {
    return { ...base, title: "Visit cancelled", subtitle: "This van visit won't go ahead.", step: 0, tone: "stopped" };
  }
  if (status === "completed") {
    return { ...base, title: "Visit complete", subtitle: "Thanks for choosing Pav Dental.", step: 5, tone: "done" };
  }
  if (status === "pending") {
    return {
      title: "Finding your van",
      subtitle: "The van team is reviewing your request.",
      etaMinutes: minutes(request.etaSecondsSnapshot),
      etaText: request.etaLabel ?? null,
      etaIsEstimate: true,
      step: 0,
      tone: "waiting",
    };
  }
  if (phase === "en_route") {
    const eta = minutes(request.route?.durationSeconds) ?? minutes(request.etaSeconds) ?? minutes(request.etaSecondsSnapshot);
    return {
      title: eta ? `Arriving in ${eta} min` : "Your van is on its way",
      subtitle: "Please keep the parking space clear.",
      etaMinutes: eta,
      etaText: eta ? null : request.etaLabel ?? null,
      step: 2,
      tone: "moving",
    };
  }
  if (phase === "on_site") {
    return { ...base, title: "Your van is here", subtitle: "Please meet the clinician outside or answer the door.", step: 3, tone: "arrived" };
  }
  if (phase === "in_treatment") {
    return { ...base, title: "Treatment in progress", subtitle: "We'll let you know when you're all done.", step: 4, tone: "treating" };
  }
  const position = request.queuePosition ?? 1;
  return {
    title: position > 1 ? `Van accepted · you're #${position} in line` : "Van accepted · you're next",
    subtitle: position > 1 ? "The van will head to you after its current visits." : "The van will head to you shortly.",
    etaMinutes: minutes(request.etaSeconds) ?? minutes(request.etaSecondsSnapshot),
    etaText: request.etaLabel ?? null,
    step: 1,
    tone: "waiting",
  };
}

/**
 * How old the van's last position is, for the patient's map (N19). Nothing for
 * the first two minutes (the van reports every 20 seconds, so that is normal),
 * then "Last seen 3 min ago", so a frozen marker is not mistaken for a live one.
 */
export function positionAgeLabel(lastLocationAt: string | Date | null | undefined, now = new Date()): string | null {
  if (!lastLocationAt) return null;
  const then = new Date(lastLocationAt).getTime();
  if (!Number.isFinite(then)) return null;
  const minutes = Math.floor((now.getTime() - then) / 60_000);
  if (minutes < 2) return null;
  if (minutes >= 60) return "Last seen over an hour ago";
  return `Last seen ${minutes} min ago`;
}
