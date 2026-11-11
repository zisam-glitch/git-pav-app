import { authFetch } from "../auth/auth-api";
import { colors } from "@/theme";
import {
  VanShift,
  VanServiceRequest,
  VanAvailability,
  VanAccessDetails,
  VanStopPhase,
  Service,
  CreateVanRequestResponse,
  DepositRetryResponse,
} from "./van-types";

/** Thrown when the patient dismisses the deposit PaymentSheet (distinct from a decline) */
export class DepositCanceledError extends Error {
  constructor() {
    super("Deposit authorization was cancelled");
    this.name = "DepositCanceledError";
  }
}

// ─── Patient endpoints ────────────────────────────────────────────────────────

/** Fetch available services for a specific channel (e.g., van) */
export async function fetchServices(channel?: string): Promise<Service[]> {
  const url = channel ? `/api/services?channel=${channel}` : "/api/services";
  const res = await authFetch(url);
  if (!res.ok) throw new Error("Could not load services");
  return res.json();
}

/** Check live van availability and ETA for a GPS point */
export async function fetchVanAvailability(lat: number, lng: number): Promise<VanAvailability> {
  const res = await authFetch(`/api/van/availability?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error("Could not check van availability");
  return res.json();
}

/** Create a new van visit request (returns deposit PaymentSheet details) */
export async function createVanRequest(data: {
  serviceId: string;
  accessDetails: VanAccessDetails;
}): Promise<CreateVanRequestResponse> {
  const res = await authFetch("/api/van/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Could not request van visit");
  }
  return res.json();
}

/**
 * Fetch the deposit authorization details for a pending request so the
 * patient can (re-)present PaymentSheet after a dismissed/failed attempt.
 */
export async function retryDepositAuthorization(
  id: string
): Promise<DepositRetryResponse> {
  const res = await authFetch(`/api/van/requests/${id}/payment-retry`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Could not load deposit authorization");
  }
  return res.json();
}

/** Shared PaymentSheet presentation for the van deposit hold */
export async function presentVanDepositSheet(
  clientSecret: string,
  stripe: {
    initPaymentSheet: (params: {
      merchantDisplayName: string;
      paymentIntentClientSecret: string;
      customerId?: string;
      customerEphemeralKeySecret?: string;
      returnURL?: string;
      allowsDelayedPaymentMethods?: boolean;
      appearance?: { colors?: Record<string, string> };
    }) => Promise<{ error?: { message?: string } | null }>;
    presentPaymentSheet: () => Promise<{
      error?: { code?: string; message?: string } | null;
    }>;
  },
  // The patient's saved cards, and the option to save this one (decisions log #15).
  customer?: { customerId?: string; customerEphemeralKeySecret?: string }
): Promise<void> {
  const { error: initError } = await stripe.initPaymentSheet({
    merchantDisplayName: "Pav Dental",
    paymentIntentClientSecret: clientSecret,
    ...(customer?.customerId && customer.customerEphemeralKeySecret
      ? { customerId: customer.customerId, customerEphemeralKeySecret: customer.customerEphemeralKeySecret }
      : {}),
    returnURL: "pavdental://stripe-return",
    allowsDelayedPaymentMethods: true,
    appearance: {
      colors: {
        primary: colors.ink as string,
        background: colors.systemBackground as string,
        componentBackground: colors.secondaryBackground as string,
        componentText: colors.label as string,
        placeholderText: colors.secondaryLabel as string,
      },
    },
  });

  if (initError) throw new Error(initError.message || "Payment setup failed");

  const { error: presentError } = await stripe.presentPaymentSheet();
  if (presentError) {
    if (presentError.code === "Canceled") {
      throw new DepositCanceledError();
    }
    throw new Error(presentError.message || "Deposit authorization failed");
  }

  // Present resolves once the sheet completes; authorization itself is
  // confirmed server-side via the amount_capturable_updated webhook.
}

/** Fetch a van request by ID (for live tracking) */
export async function fetchVanRequest(id: string): Promise<VanServiceRequest> {
  const res = await authFetch(`/api/van/requests/${id}`);
  if (!res.ok) throw new Error("Could not load van request");
  return res.json();
}

/** Fetch patient's currently active van request */
export async function fetchActiveVanRequest(): Promise<VanServiceRequest | null> {
  const res = await authFetch("/api/van/requests/mine/active");
  if (!res.ok) throw new Error("Could not load active request");
  return res.json();
}

/** Cancel a van request */
export async function cancelVanRequest(id: string): Promise<VanServiceRequest & { depositRetained?: boolean }> {
  const res = await authFetch(`/api/van/requests/${id}/cancel`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Could not cancel request");
  }
  return res.json();
}

// ─── Operator endpoints ───────────────────────────────────────────────────────

async function parseErrorAndThrow(res: Response, fallbackMsg: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error(
    (body as any).error || (body as any).message || `${fallbackMsg} (${res.status})`
  );
}

/** Start van shift (put van online) */
export async function startShift(location?: {
  lat?: number;
  lng?: number;
  accuracyM?: number;
}): Promise<VanShift> {
  const res = await authFetch("/api/van/shift/start", {
    method: "POST",
    body: JSON.stringify(location ?? {}),
  });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/** Pause accepting new requests */
export async function pauseShift(): Promise<VanShift> {
  const res = await authFetch("/api/van/shift/pause", { method: "POST" });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/** Resume accepting new requests */
export async function resumeShift(): Promise<VanShift> {
  const res = await authFetch("/api/van/shift/resume", { method: "POST" });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/** End van shift (blocks if stops remain open) */
export async function endShift(): Promise<VanShift> {
  const res = await authFetch("/api/van/shift/end", { method: "POST" });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/** Send GPS location ping */
export async function sendLocationPing(data: {
  lat: number;
  lng: number;
  accuracyM?: number;
  /** When the phone took the fix (ISO 8601): a report held up in a tunnel isn't mistaken for a fresh one. */
  recordedAt?: string;
}): Promise<void> {
  const res = await authFetch("/api/van/shift/location", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
}

/** Get operator dashboard data (shift, van, queue, incoming) */
export async function fetchCurrentShift(): Promise<{
  shift: VanShift | null;
  van?: { name: string; registrationPlate: string };
  queue?: VanServiceRequest[];
  incoming?: VanServiceRequest[];
}> {
  const res = await authFetch("/api/van/shift/current");
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/** Accept an incoming request */
export async function acceptRequest(id: string): Promise<VanServiceRequest> {
  const res = await authFetch(`/api/van/requests/${id}/accept`, { method: "POST" });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/** Decline an incoming request */
export async function declineRequest(id: string): Promise<VanServiceRequest> {
  const res = await authFetch(`/api/van/requests/${id}/decline`, { method: "POST" });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/**
 * Ask the backend to reorder the operator's queued stops into the
 * minimum-driving-time order (server-side routing-matrix optimization).
 */
export async function optimizeRoute(): Promise<{
  reordered: number;
  order: string[];
  message: string;
}> {
  const res = await authFetch("/api/van/shift/optimize", { method: "POST" });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/**
 * Apply a manual queue ordering (full permutation of the queued stops).
 * Rejects with a 409 (message included) if the queue changed underneath.
 */
export async function reorderQueue(order: string[]): Promise<{ success: true; order: string[] }> {
  const res = await authFetch("/api/van/shift/queue/reorder", {
    method: "POST",
    body: JSON.stringify({ order }),
  });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

/** Advance stop phase */
export async function updatePhase(
  id: string,
  phase: VanStopPhase | "no_show",
  notes?: string
): Promise<VanServiceRequest> {
  const res = await authFetch(`/api/van/requests/${id}/phase`, {
    method: "POST",
    body: JSON.stringify({ phase, notes }),
  });
  if (!res.ok) return parseErrorAndThrow(res, "Request failed");
  return res.json();
}

