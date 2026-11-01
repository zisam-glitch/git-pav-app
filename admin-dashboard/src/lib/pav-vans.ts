// Van service areas and operator assignments in the staff dashboard. The data
// lives in the app backend (/api/admin/vans, /api/admin/operators); this file
// only reads what staff paste and shapes what the screen shows.

export type Position = [number, number];
export interface AreaPolygon {
  type: "Polygon";
  coordinates: Position[][];
}

export interface VanArea {
  id: string;
  sectorName: string;
  polygonGeoJson: AreaPolygon;
  createdAt: string;
}

export interface VanAssignment {
  id: string;
  operatorId: string;
  startsAt: string;
  endsAt: string | null;
  operator: { fullName: string; phone: string | null };
}

export interface AdminVan {
  id: string;
  name: string;
  registrationPlate: string;
  vehicleModel: string;
  isActive: boolean;
  servicePolygons: VanArea[];
  assignments: VanAssignment[];
}

export interface AdminOperator {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
  isActive: boolean;
  currentAssignment: { id: string; vanId: string; vanName: string; startsAt: string; endsAt: string | null } | null;
}

export type ParsedAreas = { ok: true; polygons: AreaPolygon[] } | { ok: false; error: string };

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function readRing(raw: unknown, where: string): Position[] | string {
  if (!Array.isArray(raw)) return `${where} isn't a list of points`;
  const ring: Position[] = [];
  for (const point of raw) {
    if (!Array.isArray(point) || !isNumber(point[0]) || !isNumber(point[1])) {
      return `${where} has a point that isn't [longitude, latitude]`;
    }
    const [lng, lat] = point;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return `${where} has a point outside the map ([${lng}, ${lat}]); check longitude comes first`;
    }
    ring.push([lng, lat]);
  }
  // Close the ring if the last point doesn't repeat the first.
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) ring.push([first[0], first[1]]);
  if (ring.length < 4) return `${where} needs at least three distinct points`;
  return ring;
}

function readPolygon(coordinates: unknown, where: string): AreaPolygon | string {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return `${where} has no outline`;
  const rings: Position[][] = [];
  for (const [i, raw] of coordinates.entries()) {
    const ring = readRing(raw, i === 0 ? `${where}'s outline` : `${where}'s hole ${i}`);
    if (typeof ring === "string") return ring;
    rings.push(ring);
  }
  return { type: "Polygon", coordinates: rings };
}

/**
 * Reads pasted GeoJSON (for example from geojson.io): a Polygon, a
 * MultiPolygon, a Feature, or a FeatureCollection of those. Each polygon
 * becomes its own service area. Open rings are closed for you.
 */
export function parseAreaGeoJson(text: string): ParsedAreas {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "That isn't valid GeoJSON (it couldn't be read as JSON)." };
  }

  const geometries: unknown[] = [];
  const collect = (node: unknown): string | null => {
    if (!node || typeof node !== "object") return "Expected a GeoJSON object.";
    const { type } = node as { type?: unknown };
    if (type === "FeatureCollection") {
      const features = (node as { features?: unknown }).features;
      if (!Array.isArray(features) || features.length === 0) return "The FeatureCollection has no features.";
      for (const f of features) {
        const err = collect(f);
        if (err) return err;
      }
      return null;
    }
    if (type === "Feature") return collect((node as { geometry?: unknown }).geometry);
    if (type === "Polygon" || type === "MultiPolygon") {
      geometries.push(node);
      return null;
    }
    return `Only areas can be used (Polygon or MultiPolygon), not ${typeof type === "string" ? type : "this shape"}.`;
  };
  const err = collect(data);
  if (err) return { ok: false, error: err };

  const polygons: AreaPolygon[] = [];
  for (const geometry of geometries) {
    const { type, coordinates } = geometry as { type: string; coordinates: unknown };
    let parts: unknown[] = [coordinates];
    if (type === "MultiPolygon") parts = Array.isArray(coordinates) ? coordinates : [];
    for (const part of parts) {
      const polygon = readPolygon(part, `Area ${polygons.length + 1}`);
      if (typeof polygon === "string") return { ok: false, error: polygon };
      polygons.push(polygon);
    }
  }
  if (polygons.length === 0) return { ok: false, error: "No areas found." };
  return { ok: true, polygons };
}

/**
 * An SVG path for a preview of the given areas, fitted into a box of the given
 * size. Latitude is flipped so north is up; longitude is scaled by cos(latitude)
 * so shapes aren't stretched.
 */
export function previewPaths(polygons: AreaPolygon[], size = 160): string[] {
  const points = polygons.flatMap((p) => p.coordinates.flat());
  if (points.length === 0) return [];
  const lats = points.map((p) => p[1]);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);
  const xs = points.map((p) => p[0] * kx);
  const ys = lats.map((lat) => -lat);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY) || 1;
  const pad = size * 0.05;
  const scale = (size - pad * 2) / span;
  const fmt = (n: number) => Number(n.toFixed(2));
  return polygons.map((polygon) =>
    polygon.coordinates
      .map(
        (ring) =>
          `${ring
            .map(
              ([lng, lat], i) =>
                `${i === 0 ? "M" : "L"}${fmt(pad + (lng * kx - minX) * scale)} ${fmt(pad + (-lat - minY) * scale)}`,
            )
            .join(" ")} Z`,
      )
      .join(" "),
  );
}

/** The van's current assignments (started, not ended), newest first. A van can have more than one operator. */
export function currentAssignments(van: Pick<AdminVan, "assignments">, now = new Date()): VanAssignment[] {
  return van.assignments
    .filter((a) => new Date(a.startsAt) <= now && (a.endsAt === null || new Date(a.endsAt) > now))
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
}
