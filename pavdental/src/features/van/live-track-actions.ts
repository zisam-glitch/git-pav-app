/**
 * What the van tracking screen says and does, as plain functions so every case
 * is tested without a phone or Stripe. The screen only shows the results.
 */

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
