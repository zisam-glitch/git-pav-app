import { plainBookingError } from "../payment/payment-errors";

/**
 * What happens when a patient answers a treatment plan, as plain functions with
 * their dependencies passed in, so each path is tested without a phone.
 * "Accepting" only records that the patient read the plan: consent to treatment
 * is taken in person (decisions log D-06).
 */

export type PlanDecision = "accepted" | "declined" | null;

/** The answer a plan already carries, so it shows that and not the buttons again. */
export function decisionFromStatus(status: string | undefined | null): PlanDecision {
  if (status === "accepted") return "accepted";
  if (status === "declined") return "declined";
  return null;
}

export function planBadge(decision: PlanDecision): { label: string; variant: "success" | "danger" | "warning" } {
  if (decision === "accepted") return { label: "Read", variant: "success" };
  if (decision === "declined") return { label: "Declined", variant: "danger" };
  return { label: "Awaiting review", variant: "warning" };
}

/** "Dr Example · Dentist, GDC 12345", from the clinician's record; never a made-up number. */
export function prescribedBy(clinician: { fullName?: string; roleTitle?: string; gdcNumber?: string } | null | undefined): string {
  const name = clinician?.fullName || "Your clinician";
  const credentials = [clinician?.roleTitle, clinician?.gdcNumber && `GDC ${clinician.gdcNumber}`].filter(Boolean).join(", ");
  return credentials ? `${name} · ${credentials}` : name;
}

/** Only a plan the screen was opened for; never "the first plan in the list". */
export function findPlan<T extends { id: string }>(plans: T[] | undefined | null, id: string | undefined): T | null {
  if (!id || !Array.isArray(plans)) return null;
  return plans.find((p) => p.id === id) ?? null;
}

export function signerNameFor(user: { firstName?: string; lastName?: string; email?: string } | null | undefined): string {
  return user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email || "Authenticated Patient";
}

export type SignOutcome =
  | { kind: "signed"; signerName: string; signedAt: string | null; hash: string }
  | { kind: "not-verified" }
  | { kind: "failed"; message: string; error: unknown };

export interface SignDeps {
  /** "unavailable" when the phone has no biometrics or the check cannot run (web). */
  verifyIdentity(): Promise<"verified" | "cancelled" | "unavailable">;
  sign(input: { planId: string; signerName: string; signatureData: string }): Promise<{ signatureHash?: string; signedAt?: string } | undefined>;
}

export async function signPlan(
  deps: SignDeps,
  planId: string,
  user: Parameters<typeof signerNameFor>[0]
): Promise<SignOutcome> {
  const identity = await deps.verifyIdentity().catch(() => "unavailable" as const);
  if (identity === "cancelled") return { kind: "not-verified" };

  const signerName = signerNameFor(user);
  try {
    const res = await deps.sign({ planId, signerName, signatureData: `read-confirmation:${signerName}` });
    // Only the server's own signature hash and time are shown; nothing is made up here.
    return { kind: "signed", signerName, signedAt: res?.signedAt ?? null, hash: res?.signatureHash ?? "" };
  } catch (error) {
    return { kind: "failed", message: plainBookingError(error), error };
  }
}

export type DeclineOutcome = { kind: "declined" } | { kind: "failed"; message: string; error: unknown };

export async function declinePlan(deps: { decline(planId: string): Promise<unknown> }, planId: string): Promise<DeclineOutcome> {
  try {
    await deps.decline(planId);
    return { kind: "declined" };
  } catch (error) {
    return { kind: "failed", message: plainBookingError(error), error };
  }
}
