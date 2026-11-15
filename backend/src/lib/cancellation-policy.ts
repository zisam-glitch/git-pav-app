// backend/src/lib/cancellation-policy.ts
// Single source of truth for appointment and van cancellation refund policy (CS-18).
// Closes BK-6 and VR-7.
//
// Owner Decisions:
// - Decision #6: Van refund after accept (Before en route: full refund; once en route or on site: deposit kept).
// - Decision #8: Retire legacy no-refund PATCH /cancel.

export type CancellationChannel = "clinic" | "video" | "van";

export interface CancellationPolicyResult {
  refundPercentage: number;
  policyNotice: string;
  keepsDeposit: boolean;
}

/**
 * Derives refund percentage, policy notice, and whether the deposit is retained
 * based on the channel, notice given (hours), and van phase.
 */
/** Notice for a full deposit refund, and for half. Below the second the deposit is kept. */
export const FULL_REFUND_HOURS = 48;
export const HALF_REFUND_HOURS = 24;

export function getCancellationPolicy(params: {
  channel: CancellationChannel;
  hoursUntilVisit?: number;
  phase?: string | null;
}): CancellationPolicyResult {
  if (params.channel === "van") {
    // Decision #6: Before en route (e.g. queued, accepted): 100% refund;
    // once en route or on site: deposit kept to cover dispatch call-out.
    return vanCancellationPolicy(vanCancellationKeepsDeposit(params.phase));
  }

  // Clinic and Video visits (notice-based tiers)
  const hours = params.hoursUntilVisit ?? 0;
  if (hours >= FULL_REFUND_HOURS) {
    return {
      refundPercentage: 100,
      policyNotice: "Full deposit refund issued (>48 hours notice given).",
      keepsDeposit: false,
    };
  }
  if (hours >= HALF_REFUND_HOURS) {
    return {
      refundPercentage: 50,
      policyNotice: "50% deposit refund issued (24-48 hours notice given).",
      keepsDeposit: false,
    };
  }
  return {
    refundPercentage: 0,
    policyNotice: "Deposit retained to cover reserved clinical chair time (<24 hours notice).",
    keepsDeposit: true,
  };
}

/**
 * The van policy once it is known whether the deposit is kept. A cancel that
 * has happened passes what was decided under the shift lock, and whether the
 * refund has reached Stripe yet, so the notice never claims more than is true.
 */
export function vanCancellationPolicy(keepsDeposit: boolean, refundPending = false): CancellationPolicyResult {
  if (keepsDeposit) {
    return {
      refundPercentage: 0,
      policyNotice: "Deposit retained to cover dispatch call-out (van is en route or on site).",
      keepsDeposit: true,
    };
  }
  return {
    refundPercentage: 100,
    policyNotice: refundPending
      ? "Full deposit refund is on its way (cancelled before van was en route)."
      : "Full deposit refund issued (cancelled before van was en route).",
    keepsDeposit: false,
  };
}

/**
 * Backward-compatible helper for clinic and video visits.
 */
export function appointmentRefundPolicy(hoursUntilVisit: number): { refundPercentage: number; policyNotice: string } {
  const result = getCancellationPolicy({ channel: "clinic", hoursUntilVisit });
  return {
    refundPercentage: result.refundPercentage,
    policyNotice: result.policyNotice,
  };
}

/**
 * Backward-compatible helper for van cancellation deposit retention.
 */
export function vanCancellationKeepsDeposit(phase: string | null | undefined): boolean {
  // Decision #6: before en route the deposit is refunded in full; once en
  // route or on site it is kept to cover the dispatch call-out.
  return phase === "en_route" || phase === "on_site";
}
