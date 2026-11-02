// backend/src/lib/van-eta.ts
// ETA computation for live van dispatch (Pav Dental).
//
// Travel times come from a real road-routing provider when one is configured:
//
//   GOOGLE_ROUTES_API_KEY (or GOOGLE_MAP_API) → Google Routes API
//   MAPBOX_TOKEN  → Mapbox Directions Matrix API
//   OSRM_BASE_URL → self-hosted / public OSRM Table API
//
// With neither set (or when the provider errors / rate-limits), travel time
// degrades to the haversine × urban-speed model — so availability and dispatch
// always work, just with rougher ETAs. Provider failures trip a short circuit
// breaker so a Mapbox outage cannot add latency to every request.
//
// Durations are cached per origin/destination pair for a short TTL: the van's
// position changes every GPS ping, but the road network does not, and the
// matrix API is billed per element.

import { haversineMetres } from "./geo";

// Shared point type re-exported from lib/geo (single source of truth)
export type { Point } from "./geo";
import type { Point } from "./geo";

const URBAN_SPEED_MS = 20_000 / 3600; // 20 km/h in m/s (fallback model)
const ROAD_FACTOR = 1.4; // straight-line is shorter than roads

// ─── Provider configuration ────────────────────────────────────────────────

export type RoutingProvider = "google" | "mapbox" | "osrm" | "haversine";

// Server-side key, restricted to the Routes API. GOOGLE_MAP_API is accepted as
// the name the owner first used.
const GOOGLE_ROUTES_API_KEY = (process.env.GOOGLE_ROUTES_API_KEY ?? process.env.GOOGLE_MAP_API)?.trim() || "";
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN?.trim() || "";
const OSRM_BASE_URL = process.env.OSRM_BASE_URL?.trim()?.replace(/\/$/, "") || "";

export function getRoutingProvider(): RoutingProvider {
  if (GOOGLE_ROUTES_API_KEY) return "google";
  if (MAPBOX_TOKEN) return "mapbox";
  if (OSRM_BASE_URL) return "osrm";
  return "haversine";
}

// ─── Circuit breaker ───────────────────────────────────────────────────────
// After ROUTING_FAILURE_THRESHOLD consecutive provider failures, skip the
// network entirely for ROUTING_BREAKER_COOLDOWN_MS and use the fallback.

let consecutiveFailures = 0;
let breakerOpenUntil = 0;

const FAILURE_THRESHOLD = parseInt(process.env.VAN_ROUTING_FAILURE_THRESHOLD ?? "3", 10);
const BREAKER_COOLDOWN_MS = parseInt(process.env.VAN_ROUTING_BREAKER_COOLDOWN_MS ?? "60000", 10);

function breakerIsOpen(): boolean {
  return Date.now() < breakerOpenUntil;
}

function recordProviderSuccess(): void {
  consecutiveFailures = 0;
  breakerOpenUntil = 0;
}

function recordProviderFailure(err: unknown): void {
  consecutiveFailures += 1;
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    breakerOpenUntil = Date.now() + BREAKER_COOLDOWN_MS;
    consecutiveFailures = 0;
    console.error(
      `[VAN ETA] Routing provider failed ${FAILURE_THRESHOLD}× — opening circuit breaker for ${BREAKER_COOLDOWN_MS / 1000}s:`,
      err instanceof Error ? err.message : err
    );
  }
}

// ─── Duration cache ────────────────────────────────────────────────────────
// Key: rounded lat/lng pair (~110 m grid). Short TTL keeps results fresh
// enough for a moving van without hammering the provider.

const CACHE_TTL_MS = parseInt(process.env.VAN_ROUTING_CACHE_TTL_MS ?? "60000", 10); // 60s
const CACHE_MAX_ENTRIES = 500;

const durationCache = new Map<string, { seconds: number; expiresAt: number }>();
const multiMatrixCache = new Map<string, { matrix: number[][]; expiresAt: number }>();

function cacheKey(a: Point, b: Point): string {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return `${round(a.lat)},${round(a.lng)}|${round(b.lat)},${round(b.lng)}`;
}

function multiMatrixCacheKey(points: Point[]): string {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return points.map((p) => `${round(p.lat)},${round(p.lng)}`).join(";");
}

function getCached(a: Point, b: Point): number | null {
  const hit = durationCache.get(cacheKey(a, b));
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    durationCache.delete(cacheKey(a, b));
    return null;
  }
  return hit.seconds;
}

function setCached(a: Point, b: Point, seconds: number): void {
  if (durationCache.size >= CACHE_MAX_ENTRIES) {
    // Evict the oldest entry (Map preserves insertion order).
    const oldest = durationCache.keys().next().value;
    if (oldest !== undefined) durationCache.delete(oldest);
  }
  durationCache.set(cacheKey(a, b), { seconds, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Provider clients ──────────────────────────────────────────────────────

const HTTP_TIMEOUT_MS = parseInt(process.env.VAN_ROUTING_TIMEOUT_MS ?? "4000", 10);

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`routing provider ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Mapbox Directions Matrix: durations in seconds, elements in row-major order. */
async function mapboxDurations(points: Point[]): Promise<number[][] | null> {
  const coords = points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
  const url =
    `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coords}` +
    `?approaches=curb&annotations=duration&access_token=${encodeURIComponent(MAPBOX_TOKEN)}`;
  const data = await fetchJson(url);
  if (data?.code !== "Ok" || !Array.isArray(data.durations)) return null;
  return data.durations as number[][];
}

/** OSRM Table service: durations in seconds, row-major. */
async function osrmDurations(points: Point[]): Promise<number[][] | null> {
  const coords = points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
  const url = `${OSRM_BASE_URL}/table/v1/driving/${coords}?annotations=duration`;
  const data = await fetchJson(url);
  if (data?.code !== "Ok" || !Array.isArray(data.durations)) return null;
  return data.durations as number[][];
}

const GOOGLE_ROUTES_URL = "https://routes.googleapis.com";

async function googlePost(path: string, body: unknown, fieldMask: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(`${GOOGLE_ROUTES_URL}${path}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_ROUTES_API_KEY,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`routing provider ${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const googleWaypoint = (p: Point) => ({
  waypoint: { location: { latLng: { latitude: p.lat, longitude: p.lng } } },
});

/** "123s" → 123 */
function parseGoogleSeconds(value: unknown): number | null {
  if (typeof value !== "string" || !value.endsWith("s")) return null;
  const n = Number(value.slice(0, -1));
  return Number.isFinite(n) ? n : null;
}

/** Google Routes computeRouteMatrix: durations in seconds, row-major. */
async function googleDurations(points: Point[]): Promise<number[][] | null> {
  const waypoints = points.map(googleWaypoint);
  const data = (await googlePost(
    "/distanceMatrix/v2:computeRouteMatrix",
    { origins: waypoints, destinations: waypoints, travelMode: "DRIVE", routingPreference: "TRAFFIC_AWARE" },
    "originIndex,destinationIndex,duration,condition"
  )) as { originIndex?: number; destinationIndex?: number; duration?: string; condition?: string }[] | null;
  if (!Array.isArray(data)) return null;
  const matrix = points.map((_, i) => points.map((__, j) => (i === j ? 0 : Number.NaN)));
  for (const el of data) {
    const seconds = parseGoogleSeconds(el?.duration);
    if (typeof el?.originIndex !== "number" || typeof el?.destinationIndex !== "number") continue;
    if (el.condition && el.condition !== "ROUTE_EXISTS") continue;
    if (seconds !== null) matrix[el.originIndex][el.destinationIndex] = seconds;
  }
  return matrix;
}

/**
 * Fetch an n×n driving-duration matrix (seconds) for the given points.
 * Returns null when no provider is configured or the breaker is open.
 */
async function getDurationMatrix(points: Point[]): Promise<number[][] | null> {
  const provider = getRoutingProvider();
  if (provider === "haversine") return null;
  if (breakerIsOpen()) return null;

  const key = multiMatrixCacheKey(points);
  const cachedHit = multiMatrixCache.get(key);
  if (cachedHit && Date.now() < cachedHit.expiresAt) {
    return cachedHit.matrix;
  }

  try {
    const matrix =
      provider === "google"
        ? await googleDurations(points)
        : provider === "mapbox"
          ? await mapboxDurations(points)
          : await osrmDurations(points);
    if (!matrix) throw new Error("provider returned no duration matrix");
    recordProviderSuccess();

    // VE-3: Cache multi-point matrix and populate pairwise durationCache
    multiMatrixCache.set(key, { matrix, expiresAt: Date.now() + CACHE_TTL_MS });
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        if (i !== j && matrix[i]?.[j] != null && Number.isFinite(matrix[i][j])) {
          setCached(points[i], points[j], matrix[i][j]);
        }
      }
    }

    return matrix;
  } catch (err) {
    recordProviderFailure(err);
    return null;
  }
}

/** Cached pairwise duration (seconds); matrix hit or null to signal fallback. */
async function pairwiseDuration(from: Point, to: Point): Promise<number | null> {
  const cached = getCached(from, to);
  if (cached != null) return cached;

  const matrix = await getDurationMatrix([from, to]);
  const seconds = matrix?.[0]?.[1];
  if (seconds == null || !Number.isFinite(seconds)) return null;

  setCached(from, to, seconds);
  return seconds;
}

// ─── ETA model ─────────────────────────────────────────────────────────────

/**
 * Road-network travel time in seconds between two points.
 * Uses the configured routing provider; falls back to haversine × urban
 * speed with a road factor when no provider is available.
 */
export async function travelSeconds(from: Point, to: Point): Promise<number> {
  const routed = await pairwiseDuration(from, to);
  if (routed != null) return Math.round(routed);

  const dist = haversineMetres(from, to);
  return Math.round((dist * ROAD_FACTOR) / URBAN_SPEED_MS);
}

/**
 * How many seconds of treatment remain for this stop.
 * - queued / en_route / on_site → full block
 * - in_treatment → elapsed time subtracted, clamped to a minimum positive duration (VE-1)
 * - completed / cancelled → 0
 */
export function remainingTreatmentSeconds(stop: QueueStop, now = new Date()): number {
  const full = stop.treatmentMinutes * 60;
  if (stop.phase === "in_treatment" && stop.treatmentStartedAt) {
    const elapsed = (now.getTime() - stop.treatmentStartedAt.getTime()) / 1000;
    // VE-1: Clamp overrun to a small positive minimum (5 min = 300s).
    // An overrun must never be allowed to go negative, which would erroneously
    // reduce subsequent patients' ETAs.
    return Math.max(300, Math.round(full - elapsed));
  }
  if (stop.phase === "completed" || stop.phase === "cancelled") return 0;
  return full;
}

export type QueueStop = {
  lat: number;
  lng: number;
  phase: string; // VanStopPhase string values
  treatmentStartedAt: Date | null;
  treatmentMinutes: number; // service durationMinutes or 45 default
  bufferMinutes: number; // 10 default
};

/**
 * Compute ETA in seconds from van's current position to a new patient at `target`.
 * Queue is ordered accepted+in_progress stops only.
 *
 * The whole chain (van → each queued stop → target) is computed in ONE matrix
 * request when a provider is configured — n+1 network calls become 1, and the
 * result is charged once. Fallback model computes the same chain pairwise.
 *
 * ETA chain formula (per spec):
 *   For each stop before target: travel_to_stop + remaining_treatment + buffer
 *   Then: travel from last stop (or van) to target
 */
export async function etaSecondsToNewPatient(
  van: Point,
  queue: QueueStop[],
  target: Point,
): Promise<number> {
  // Waypoint order: [van, stop1, …, stopN, target]. All travel legs
  // (van→s1, s1→s2, …, last→target) come from ONE matrix request.
  const waypoints: Point[] = [van, ...queue.map((s) => ({ lat: s.lat, lng: s.lng })), target];
  const matrix = await getDurationMatrix(waypoints);

  // VE-2: If matrix is null (provider down/failed), compute direct haversine
  // fallback per leg without triggering repeated pairwise network calls with timeouts.
  const legByIndex = (fromIdx: number, toIdx: number): number => {
    if (matrix) {
      const seconds = matrix[fromIdx]?.[toIdx];
      if (seconds != null && Number.isFinite(seconds)) return Math.round(seconds);
    }
    const dist = haversineMetres(waypoints[fromIdx], waypoints[toIdx]);
    return Math.round((dist * ROAD_FACTOR) / URBAN_SPEED_MS);
  };

  let t = 0;
  let cursorIdx = 0; // van

  for (let i = 0; i < queue.length; i++) {
    const stop = queue[i];
    const stopIdx = i + 1;
    // Skip travel if already on_site or in_treatment (van is already there)
    if (stop.phase !== "on_site" && stop.phase !== "in_treatment") {
      t += legByIndex(cursorIdx, stopIdx);
    }
    t += remainingTreatmentSeconds(stop);
    t += stop.bufferMinutes * 60;
    cursorIdx = stopIdx;
  }

  t += legByIndex(cursorIdx, waypoints.length - 1);
  return Math.round(t);
}

/**
 * Format ETA seconds into a patient-friendly band string.
 * e.g. 1500s → "20–30 min", 90s → "< 5 min", 7200s → "~2 hr"
 */
export function formatEtaLabel(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 5) return "< 5 min";
  if (minutes <= 60) {
    // Round to nearest 5, give a ±5 min band
    const lo = Math.max(5, Math.floor(minutes / 5) * 5);
    const hi = lo + 10;
    return `${lo}–${hi} min`;
  }
  // Fix hour formatting to use decimal hours properly
  const hours = Math.round((seconds / 3600) * 10) / 10;
  return `~${hours} hr`;
}

// ─── Multi-stop route optimization ─────────────────────────────────────────

/**
 * Optimal visiting order for `stops` starting from `van`.
 * Returns indices into `stops` in visiting order.
 *
 * Exact (permutation search) for ≤ 8 stops — the dispatch queue is capped at
 * MAX_QUEUE_DEPTH (5) anyway — nearest-neighbour beyond. Uses the routing
 * matrix when a provider is configured (ONE request for the whole problem);
 * haversine-based otherwise. Cost is total driving time, not straight-line
 * distance, so the order reflects real road topology.
 */
export async function optimizeStopOrder(van: Point, stops: Point[]): Promise<number[]> {
  const n = stops.length;
  if (n <= 1) return stops.map((_, i) => i);

  const matrix = await getDurationMatrix([van, ...stops]);

  const legCost = (from: number, to: number): number => {
    // `from === -1` is the van (matrix index 0); stops are offset by 1.
    if (matrix) {
      const seconds = matrix[from + 1]?.[to + 1];
      if (seconds != null && Number.isFinite(seconds)) return seconds;
    }
    const a = from === -1 ? van : stops[from];
    const b = stops[to];
    return (haversineMetres(a, b) * ROAD_FACTOR) / URBAN_SPEED_MS;
  };

  const routeCost = (order: number[]): number => {
    let cost = 0;
    let prev = -1;
    for (const idx of order) {
      cost += legCost(prev, idx);
      prev = idx;
    }
    return cost;
  };

  let bestOrder: number[];
  if (n <= 8) {
    // Exact search over all permutations (8! = 40 320 — trivial one-off cost).
    bestOrder = stops.map((_, i) => i);
    let bestCost = routeCost(bestOrder);
    const permute = (prefix: number[], rest: number[]): void => {
      if (rest.length === 0) {
        const cost = routeCost(prefix);
        if (cost < bestCost) {
          bestCost = cost;
          bestOrder = prefix.slice();
        }
        return;
      }
      for (let i = 0; i < rest.length; i++) {
        permute([...prefix, rest[i]], [...rest.slice(0, i), ...rest.slice(i + 1)]);
      }
    };
    permute([], stops.map((_, i) => i));
  } else {
    // Nearest-neighbour heuristic for oversized queues.
    const remaining = new Set(stops.map((_, i) => i));
    bestOrder = [];
    let prev = -1;
    while (remaining.size > 0) {
      let nearest = -1;
      let nearestCost = Infinity;
      for (const idx of remaining) {
        const cost = legCost(prev, idx);
        if (cost < nearestCost) {
          nearestCost = cost;
          nearest = idx;
        }
      }
      bestOrder.push(nearest);
      remaining.delete(nearest);
      prev = nearest;
    }
  }

  return bestOrder;
}

/** Max accepted queue depth (patients) */
export const MAX_QUEUE_DEPTH = parseInt(process.env.VAN_MAX_QUEUE_DEPTH ?? "5", 10);

/** Request timeout in milliseconds */
export const REQUEST_TIMEOUT_MS =
  parseInt(process.env.VAN_REQUEST_TIMEOUT_MINUTES ?? "4", 10) * 60 * 1000;

/** Max ETA in seconds to show to new patients (beyond this: "Queue full / try later") */
export const MAX_ETA_SECONDS = 4 * 60 * 60; // 4 hours

// ─── Road route for the patient's map ──────────────────────────────────────

export type RoadRoute = {
  /** Google encoded polyline (precision 5) of the driving route. */
  encodedPolyline: string;
  distanceMeters: number;
  durationSeconds: number;
};

const ROUTE_CACHE_TTL_MS = 60_000;
const routeCache = new Map<string, { route: RoadRoute | null; expiresAt: number }>();

/** ~100 m grid, so small GPS jitter reuses the same route. */
const routeKey = (from: Point, to: Point) =>
  `${from.lat.toFixed(3)},${from.lng.toFixed(3)}>${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;

/**
 * The driving route from the van to the patient, for drawing on the map.
 * Only Google gives a route here; with another provider, none configured, the
 * breaker open or an error, it's null and the app draws a straight line.
 * Cached briefly so every patient refresh doesn't buy a new route.
 */
export async function roadRoute(from: Point, to: Point): Promise<RoadRoute | null> {
  if (getRoutingProvider() !== "google" || breakerIsOpen()) return null;
  const key = routeKey(from, to);
  const hit = routeCache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.route;

  let route: RoadRoute | null = null;
  try {
    const data = (await googlePost(
      "/directions/v2:computeRoutes",
      {
        origin: googleWaypoint(from).waypoint,
        destination: googleWaypoint(to).waypoint,
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        polylineEncoding: "ENCODED_POLYLINE",
      },
      "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration"
    )) as {
      routes?: { polyline?: { encodedPolyline?: unknown }; distanceMeters?: number; duration?: string }[];
    } | null;
    const first = data?.routes?.[0];
    const seconds = parseGoogleSeconds(first?.duration);
    if (typeof first?.polyline?.encodedPolyline === "string" && seconds !== null) {
      route = {
        encodedPolyline: first.polyline.encodedPolyline as string,
        distanceMeters: Number(first.distanceMeters ?? 0),
        durationSeconds: seconds,
      };
    }
    recordProviderSuccess();
  } catch (err) {
    recordProviderFailure(err);
  }

  if (routeCache.size >= CACHE_MAX_ENTRIES) {
    const oldest = routeCache.keys().next().value;
    if (oldest !== undefined) routeCache.delete(oldest);
  }
  routeCache.set(key, { route, expiresAt: Date.now() + ROUTE_CACHE_TTL_MS });
  return route;
}

/** Test hook: forget cached routes. */
export function clearRouteCache(): void {
  routeCache.clear();
}
