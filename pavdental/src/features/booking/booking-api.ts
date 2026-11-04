import { authFetch, publicFetch } from "../auth/auth-api";
import type { ApiHoldSlotResponse, ApiSlot } from "../api-contract.gen";
import { DentalService, ClinicLocation, Clinician, TimeSlot } from "./booking-types";
import { ukDayLabel, ukDate, ukTime } from "./uk-time";

// ─── Services ─────────────────────────────────────────────────────────────────
export async function fetchServices(): Promise<DentalService[]> {
  const res = await publicFetch(`/api/services`);
  if (!res.ok) throw new Error("Could not load services");
  return res.json();
}

// ─── Clinics ──────────────────────────────────────────────────────────────────
export async function fetchClinics(): Promise<ClinicLocation[]> {
  const res = await publicFetch(`/api/services/clinics`);
  if (!res.ok) throw new Error("Could not load clinics");
  return res.json();
}

// ─── Clinicians ───────────────────────────────────────────────────────────────
export async function fetchClinicians(channel?: string): Promise<Clinician[]> {
  const qs = channel ? `?channel=${channel}` : "";
  const res = await publicFetch(`/api/services/clinicians${qs}`);
  if (!res.ok) throw new Error("Could not load clinicians");
  return res.json();
}

// ─── Slots ────────────────────────────────────────────────────────────────────
export async function fetchSlots(params: {
  clinicianId?: string;
  clinicId?: string;
  serviceId?: string;
  date: string; // YYYY-MM-DD, UK calendar date
  channel?: string;
}): Promise<TimeSlot[]> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)) as Record<string, string>
  ).toString();
  const res = await authFetch(`/api/booking/slots?${qs}`);
  if (!res.ok) throw new Error("Could not load slots");
  const raw: ApiSlot[] = await res.json();

  // Normalise to TimeSlot shape, shown in UK time (the clinic's hours).
  return raw.map((s) => ({
    id: s.id,
    clinicianId: params.clinicianId ?? "",
    clinicId: params.clinicId ?? "",
    startTimeUtc: s.startTimeUtc,
    endTimeUtc: s.endTimeUtc,
    displayTime: ukTime(new Date(s.startTimeUtc)),
    dateFormatted: ukDayLabel(ukDate(new Date(s.startTimeUtc))),
    channel: params.channel as any ?? "clinic",
    isAvailable: s.available,
  }));
}

// ─── Hold Slot (Redis SET NX) ─────────────────────────────────────────────────
export async function holdSlot(slotId: string): Promise<ApiHoldSlotResponse> {
  const res = await authFetch("/api/booking/hold-slot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slotId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Slot already taken");
  }
  return res.json();
}

// ─── Create Appointment ────────────────────────────────────────────────────────
export async function createAppointment(data: {
  serviceId: string;
  channel: string;
  clinicianId?: string;
  clinicId?: string;
  vanId?: string;
  // Booking for the guardian's child (decisions log #17).
  dependantId?: string;
  startTimeUtc: string;
  endTimeUtc: string;
  slotId?: string;
  accessDetails?: Record<string, unknown>;
  triageData?: Record<string, unknown>;
}, idempotencyKey?: string) {
  const res = await authFetch("/api/booking/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Same key for the same booking attempt, so a retried request after a
      // dropped connection gets the same hold back.
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Booking failed");
  }
  return res.json();
}

/** A fresh key for one booking attempt (letters, digits and dashes). */
export function newBookingAttemptKey(): string {
  return `booking-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

// ─── List Appointments ────────────────────────────────────────────────────────
export async function fetchMyAppointments(params?: { scope?: string; date?: string }) {
  const query = new URLSearchParams();
  if (params?.scope) query.set("scope", params.scope);
  if (params?.date) query.set("date", params.date);
  const qs = query.toString();
  const res = await authFetch(`/api/booking/appointments${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Could not load appointments");
  return res.json();
}

// ─── Payment intent ──────────────────────────────────────────────────────────
// Amount and confirmation are server-controlled; a verified Stripe webhook is
// the only path that changes an appointment to confirmed.
export async function createPaymentIntent(appointmentId: string, voucherCode?: string) {
  const res = await authFetch("/api/payments/create-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voucherCode ? { appointmentId, voucherCode } : { appointmentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Could not prepare payment");
  }
  return res.json() as Promise<{
    clientSecret: string | null;
    paymentIntentId: string;
    publishableKey: string;
    amountPence: number;
    discountPence: number;
    // The patient's Stripe Customer, so the sheet can show saved cards.
    customerId: string | null;
    customerEphemeralKeySecret: string | null;
    isMock: boolean;
  }>;
}

// ─── Confirm Appointment ──────────────────────────────────────────────────────
// Asks the server to confirm the booking once the deposit is paid. The server
// checks the payment itself (with Stripe, or the mock intent in local dev),
// and the Stripe webhook confirms the same way, so calling this is always safe:
// whichever arrives first wins and the other is a no-op.
export async function confirmAppointment(appointmentId: string, stripePaymentId: string) {
  const res = await authFetch(`/api/booking/appointments/${encodeURIComponent(appointmentId)}/confirm`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stripePaymentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Could not confirm your booking");
  }
  return res.json() as Promise<{ id: string; appointmentStatus: string; depositPaidPence: number }>;
}

// ─── Cancel Appointment ───────────────────────────────────────────────────────
export interface CancellationResult {
  appointmentId: string;
  refundAmountPence: number;
  refundPercentage: number;
  policyNotice: string;
}

// The one cancel path: the server applies the deposit refund policy.
export async function cancelAppointment(appointmentId: string): Promise<CancellationResult> {
  const res = await authFetch(`/api/booking/appointments/${appointmentId}/cancel-with-refund`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Cancellation failed");
  }
  return res.json();
}

// ─── Van coverage check ────────────────────────────────────────────────────────
export async function checkVanCoverage(params: { lat?: number; lng?: number; postcode?: string }) {
  const res = await publicFetch(`/api/public/van/coverage-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Coverage check failed");
  }
  return res.json();
}

// ─── Helper: format pence to GBP ─────────────────────────────────────────────
export function formatGbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}
