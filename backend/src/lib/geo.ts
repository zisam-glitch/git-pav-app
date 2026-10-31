import { safeError } from "./log-safety";
/**
 * Geospatial utilities for van coverage checking
 * Using Turf.js-like logic for point-in-polygon checks
 */

export interface Point {
  lat: number;
  lng: number;
}

/**
 * Convert UK postcode to coordinates using postcodes.io API
 * Real geocoding service for accurate UK postcode coordinates
 *
 * Hard 3s timeout: this is called in the create-request hot path, and a slow
 * upstream must not stall dispatch (on timeout/HTTP error the postcode
 * consistency check is skipped rather than blocking the request).
 */
const POSTCODE_GEOCODE_TIMEOUT_MS = 3_000;

export async function postcodeToCoordinates(postcode: string): Promise<Point | null> {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`,
      { signal: AbortSignal.timeout(POSTCODE_GEOCODE_TIMEOUT_MS) }
    );
    const data = await response.json() as { status: number; result?: { latitude: number; longitude: number } };
    
    if (data.status === 200 && data.result) {
      return {
        lat: data.result.latitude,
        lng: data.result.longitude
      };
    }
    
    return null;
  } catch (error) {
    console.error('Postcode geocoding error:', safeError(error));
    return null;
  }
}

/**
 * Nearest UK postcode to a GPS point (postcodes.io reverse lookup), in the
 * standard spaced form ("SW1A 1AA"). Same 3s budget as the forward lookup;
 * null when there is no postcode nearby or the lookup fails.
 */
export async function coordinatesToPostcode(point: Point): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes?lon=${encodeURIComponent(point.lng)}&lat=${encodeURIComponent(point.lat)}&limit=1`,
      { signal: AbortSignal.timeout(POSTCODE_GEOCODE_TIMEOUT_MS) }
    );
    const data = (await response.json()) as { status: number; result?: { postcode?: string }[] | null };
    const postcode = data.status === 200 ? data.result?.[0]?.postcode : undefined;
    return postcode ? formatUkPostcode(postcode) : null;
  } catch (error) {
    console.error("Reverse postcode lookup error:", safeError(error));
    return null;
  }
}

/** "sw1a1aa" / "SW1A 1AA" → "SW1A 1AA". */
export function formatUkPostcode(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s/g, "");
  return cleaned.length >= 5 ? `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}` : cleaned;
}

export interface Polygon {
  type: "Polygon";
  coordinates: number[][][]; // GeoJSON format: [outerRing, ...holeRings]
}

export interface MultiPolygon {
  type: "MultiPolygon";
  coordinates: number[][][][]; // GeoJSON format: [[[outerRing, ...holes]], ...]
}

export type GeoJsonPolygon = Polygon | MultiPolygon;

function isPointInLinearRing(point: Point, ring: number[][]): boolean {
  if (!ring || ring.length < 3) return false;
  const [x, y] = [point.lng, point.lat];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygonCoords(point: Point, rings: number[][][]): boolean {
  if (!rings || rings.length === 0 || !rings[0] || rings[0].length === 0) return false;
  // Exterior ring: point must be inside
  if (!isPointInLinearRing(point, rings[0])) {
    return false;
  }
  // VC-4: Interior rings (holes): point must NOT be inside any hole
  for (let i = 1; i < rings.length; i++) {
    if (isPointInLinearRing(point, rings[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Check if a point is inside a polygon or multipolygon using ray casting algorithm.
 * VC-4: Handles interior rings (holes) and MultiPolygon features.
 */
export function pointInPolygon(point: Point, geometry: Polygon | MultiPolygon): boolean {
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygonCoords) => pointInPolygonCoords(point, polygonCoords));
  }
  return pointInPolygonCoords(point, geometry.coordinates);
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function haversineMetres(point1: Point, point2: Point): number {
  const R = 6_371_000; // Earth's radius in meters
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the centroid of a polygon or multipolygon (for distance calculations).
 * VC-4: Uses the primary exterior boundary ring.
 */
export function getPolygonCentroid(geometry: Polygon | MultiPolygon): Point {
  const rings =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates[0]?.[0] || []
      : geometry.coordinates[0] || [];

  if (rings.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let sumX = 0, sumY = 0;
  for (const [x, y] of rings) {
    sumX += x;
    sumY += y;
  }
  return {
    lng: sumX / rings.length,
    lat: sumY / rings.length,
  };
}