import { publicFetch } from "../auth/auth-api";
import { CANCELLATION_SHEET_MESSAGE } from "./cancellation-policy";

/**
 * The booking rules, as the server sends them (checklist A1). The server is the one place these numbers
 * live; the app shows what it sends. Until it has heard (first launch, offline) the built-in text below is used.
 */
export interface BookingPolicies {
  cancellation: { fullRefundHours: number; halfRefundHours: number; message: string };
  rescheduleMinNoticeHours: number;
  checkInOpensHours: number;
  checkInClosesHours: number;
  waitingRoomOpensMinutes: number;
}

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;

/** The policies from the server's answer, or null if it is not what we expect: a bad answer must never blank the screen. */
export function parsePolicies(raw: unknown): BookingPolicies | null {
  const r = raw as Partial<BookingPolicies> | null;
  const c = r?.cancellation;
  if (
    !r ||
    !c ||
    typeof c.message !== "string" ||
    c.message.trim() === "" ||
    !isNumber(c.fullRefundHours) ||
    !isNumber(c.halfRefundHours) ||
    !isNumber(r.rescheduleMinNoticeHours) ||
    !isNumber(r.checkInOpensHours) ||
    !isNumber(r.checkInClosesHours) ||
    !isNumber(r.waitingRoomOpensMinutes)
  ) {
    return null;
  }
  return r as BookingPolicies;
}

let current: BookingPolicies | null = null;

/** What the patient is told when they are about to cancel: the server's wording once known, else the built-in. */
export function cancellationSheetMessage(): string {
  return current?.cancellation.message ?? CANCELLATION_SHEET_MESSAGE;
}

/** The policies the server last sent, or null before then. */
export function currentPolicies(): BookingPolicies | null {
  return current;
}

/** Asks the server once. Any failure keeps what we had: the app works without it. */
export async function loadBookingPolicies(): Promise<void> {
  try {
    const res = await publicFetch("/api/public/policies");
    if (!res.ok) return;
    const parsed = parsePolicies(await res.json());
    if (parsed) current = parsed;
  } catch {
    // Offline or a blip: keep the built-in text.
  }
}

/** For tests: forget what the server sent. */
export function resetPoliciesForTest(): void {
  current = null;
}
