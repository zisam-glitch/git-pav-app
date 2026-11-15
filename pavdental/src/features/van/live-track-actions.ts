/**
 * What the van tracking screen says and does, as plain functions so every case
 * is tested without a phone or Stripe. The screen only shows the results.
 */

import type { VanServiceRequest } from "./van-types";

/**
 * Build the van booking draft from a finished or cancelled request so the
 * patient can retry or rebook in one tap without re-typing their address.
 */
export function rebookDraftFromRequest(request: VanServiceRequest) {
  const access = request.accessDetails;
  const hasConfirmData = Boolean(
    request.serviceId && access?.addressLine1?.trim() && access?.postcode?.trim(),
  );
  return {
    pathname: (hasConfirmData ? "/(patient)/van/confirm" : "/(patient)/van/service-area") as
      | "/(patient)/van/confirm"
      | "/(patient)/van/service-area",
    locationCoverage: {
      postcode: access?.postcode ?? "",
      lat: access?.lat ?? request.patientLat,
      lng: access?.lng ?? request.patientLng,
      isCovered: true,
      availability: null,
    },
    service: {
      serviceId: request.serviceId,
      serviceName: request.service?.name ?? "Dental visit",
      servicePricePence: request.service?.pricePence ?? 0,
      serviceDurationMinutes: request.service?.durationMinutes ?? 30,
      serviceDepositPence: request.service?.depositPence ?? null,
    },
    accessDetails: {
      postcode: access?.postcode ?? "",
      addressLine1: access?.addressLine1 ?? "",
      addressLine2: access?.addressLine2 ?? "",
      city: access?.city ?? "",
      parkingType: access?.parkingType ?? ("private_driveway" as const),
      gateCode: access?.gateCode ?? "",
      accessNotes: access?.accessNotes ?? "",
    },
  };
}

/** Label for the one-tap rebook button when a van visit ends before completion. */
export function rebookButtonLabel(status: string): string {
  return status === "cancelled" ? "Book another van visit" : "Try again";
}

const TERMINAL_VAN_STATUSES = new Set(["declined", "expired", "completed", "cancelled"]);

/**
 * Smart polling interval for patient van tracking (N29):
 * 5s only while the van is driving to this patient, 30s otherwise, and paused
 * in the background or once the visit reaches a terminal state.
 */
export function trackingPollIntervalMs(
  request: { status?: string | null; phase?: string | null } | null | undefined,
  isForeground: boolean,
): number | false {
  if (!isForeground) return false;
  if (request?.status && TERMINAL_VAN_STATUSES.has(request.status)) return false;
  return request?.phase === "en_route" ? 5000 : 30_000;
}

type RequestLike = { phase?: string | null };

/** The question asked before cancelling. The wording depends on whether the van is already moving. */
export function cancelPrompt(request: RequestLike): { title: string; message: string } {
  const onItsWay = request.phase === "en_route" || request.phase === "on_site";
  return {
    title: "Cancel van request",
    message: onItsWay
      ? "The van is already on its way, so your deposit will be kept to cover the call-out. Cancel anyway?"
      : "Are you sure you want to cancel your mobile dental van request? Your deposit will be returned.",
  };
}

/** What the patient is told once the request is cancelled. */
export function cancelDoneMessage(result: { depositRetained?: boolean }): string {
  const depositLine = result.depositRetained
    ? " The van was already on its way, so your deposit has been kept to cover the call-out."
    : "";
  return `Your van visit request has been cancelled.${depositLine}`;
}

/** Whole seconds left for a van to accept, or null when there is no deadline. */
export function secondsUntil(expiresAt: string | null | undefined, now: number = Date.now()): number | null {
  if (!expiresAt) return null;
  const t = new Date(expiresAt).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((t - now) / 1000));
}

/** 4:05 */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export const NO_SHOW_WAIT_MINUTES = 10;

/** Live 10-minute on-site wait label before a no-show can be marked (N23). */
export function onSiteWaitLabel(
  arrivedAt: string | null | undefined,
  now: number = Date.now(),
): { ready: boolean; label: string } | null {
  if (!arrivedAt) return null;
  const arrivedMs = new Date(arrivedAt).getTime();
  if (Number.isNaN(arrivedMs)) return null;
  const deadlineMs = arrivedMs + NO_SHOW_WAIT_MINUTES * 60_000;
  const remainingSeconds = Math.max(0, Math.ceil((deadlineMs - now) / 1000));
  if (remainingSeconds === 0) {
    return {
      ready: true,
      label: "10-minute wait complete — no-show allowed once message & call are logged.",
    };
  }
  return {
    ready: false,
    label: `On-site wait: ${formatCountdown(remainingSeconds)} left before no-show is allowed`,
  };
}

export type AuthorizeOutcome =
  /** The server already has the hold; just refresh the request. */
  | { kind: "already" }
  /** The patient authorised in the sheet. */
  | { kind: "authorized" }
  /** The patient closed the sheet: say nothing, the banner stays. */
  | { kind: "closed" }
  | { kind: "failed"; message: string; error: unknown };

export interface AuthorizeDeps {
  retry(requestId: string): Promise<{ alreadyAuthorized?: boolean; clientSecret?: string | null }>;
  presentSheet(clientSecret: string, retry: unknown): Promise<unknown>;
  isClosedByPatient(error: unknown): boolean;
}

/**
 * Ask the server for a fresh payment secret and show the deposit sheet, for a
 * pending request whose first attempt was closed or declined.
 */
export async function authorizeDeposit(deps: AuthorizeDeps, requestId: string): Promise<AuthorizeOutcome> {
  try {
    const retry = await deps.retry(requestId);
    if (retry.alreadyAuthorized || !retry.clientSecret) return { kind: "already" };
    await deps.presentSheet(retry.clientSecret, retry);
    return { kind: "authorized" };
  } catch (err) {
    if (deps.isClosedByPatient(err)) return { kind: "closed" };
    return { kind: "failed", message: "We couldn't authorize the deposit. You have not been charged.", error: err };
  }
}
