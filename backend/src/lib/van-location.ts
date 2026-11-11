// backend/src/lib/van-location.ts
// Which van position reports to believe, and when a van has gone quiet.
//
// Position reports come from an operator's phone over a mobile connection, so
// they can arrive late, twice, out of order or with a poor fix. The checks
// follow the ones Traccar applies before it stores a position (old, in the
// future, inaccurate, out of order, impossible speed since the last fix).
// Pure functions: the route and the availability search call them.

import { haversineMetres } from "./geo";

/** A van that has not reported for this long is not offered to new patients (N14). */
export const POSITION_STALE_MS =
  parseInt(process.env.VAN_POSITION_STALE_SECONDS ?? "180", 10) * 1000;

/** A report older than this when it arrives is ignored. */
const MAX_REPORT_AGE_MS = 5 * 60 * 1000;
/** A phone clock this far ahead is treated as "now" rather than believed. */
const CLOCK_SKEW_MS = 60 * 1000;
/** Fixes worse than this are too rough to move the van's marker or its ETAs. */
export const MAX_ACCURACY_M = 200;
/** About 200 km/h: faster than a van can drive, so the fix is wrong. */
const MAX_SPEED_MS = 55;
/** Below this a "jump" is ordinary GPS noise, whatever the elapsed time. */
const MIN_JUMP_M = 500;

export type PingVerdict =
  | { accept: true; recordedAt: Date }
  | { accept: false; reason: "inaccurate" | "too_old" | "out_of_order" | "impossible_speed" };

export type PreviousFix = { lat: number; lng: number; at: Date | null };
export type IncomingFix = { lat: number; lng: number; accuracyM?: number | null; recordedAt?: Date | null };

/**
 * Whether a report should be stored as the van's latest position. The time is
 * the phone's own (when sent), so a report held up in a tunnel is not mistaken
 * for a fresh one.
 */
export function judgePing(previous: PreviousFix | null, ping: IncomingFix, now = new Date()): PingVerdict {
  let recordedAt = ping.recordedAt ?? now;
  if (recordedAt.getTime() > now.getTime() + CLOCK_SKEW_MS) recordedAt = now;
  if (recordedAt.getTime() > now.getTime()) recordedAt = now;

  if (now.getTime() - recordedAt.getTime() > MAX_REPORT_AGE_MS) return { accept: false, reason: "too_old" };
  if (ping.accuracyM != null && ping.accuracyM > MAX_ACCURACY_M) return { accept: false, reason: "inaccurate" };

  if (previous?.at) {
    const seconds = (recordedAt.getTime() - previous.at.getTime()) / 1000;
    if (seconds <= 0) return { accept: false, reason: "out_of_order" };
    const metres = haversineMetres({ lat: previous.lat, lng: previous.lng }, { lat: ping.lat, lng: ping.lng });
    if (metres > MIN_JUMP_M && metres / seconds > MAX_SPEED_MS) return { accept: false, reason: "impossible_speed" };
  }
  return { accept: true, recordedAt };
}

/**
 * True when a shift's last report is old enough that nobody should be promised
 * that van. A shift with no timestamp is not called stale: it has no position
 * at all and is skipped elsewhere.
 */
export function isPositionStale(lastLocationAt: Date | null | undefined, now = new Date()): boolean {
  if (!lastLocationAt) return false;
  return now.getTime() - lastLocationAt.getTime() > POSITION_STALE_MS;
}
