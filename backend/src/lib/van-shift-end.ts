import { prisma } from "./prisma";
import { releaseVanDeposit } from "./van-payments";
import { sendPatientNotification } from "./patient-push";
import { recordVanEvent } from "./van-dispatch";

export type EndVanShiftResult =
  | { ended: true; shift: Awaited<ReturnType<typeof prisma.vanShift.update>>; expiredRequests: number; failedReleases: string[] }
  | { ended: false; openStops: number };

/**
 * Ends a van shift. One path for the operator ending their own shift and for
 * staff ending one that was left running, so the rules can't drift apart.
 *
 * Stops already accepted or under way block it: those patients are waiting
 * with a deposit taken, so someone has to complete or cancel them first.
 * Pending requests are expired one at a time under the accept lock, so each
 * deposit hold is released and no accept can race with the shift ending
 * (CS-49). A failed release is reported but never blocks the end; the expiry
 * sweeper retries it on its next pass.
 */
export async function endVanShift(shift: { id: string }): Promise<EndVanShiftResult> {
  const openStops = await prisma.vanServiceRequest.count({
    where: { shiftId: shift.id, status: { in: ["accepted", "in_progress"] } },
  });
  if (openStops > 0) return { ended: false, openStops };

  const failedReleases: string[] = [];
  let expiredRequests = 0;
  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`van-accept:${shift.id}`}))`;
      const pendingRequests = await tx.vanServiceRequest.findMany({
        where: { shiftId: shift.id, status: "pending" },
        select: { id: true, patientId: true, paymentIntentId: true },
      });
      for (const pending of pendingRequests) {
        let releaseStatus: string | null = null;
        let releasedAt: Date | null = null;
        if (pending.paymentIntentId) {
          const release = await releaseVanDeposit(pending.paymentIntentId, "shift_ended");
          releaseStatus = release.status;
          if (release.status === "failed") {
            failedReleases.push(pending.id);
          } else if (["released", "already_released", "refunded"].includes(release.status)) {
            releasedAt = new Date();
          }
        }
        await tx.vanServiceRequest.update({
          where: { id: pending.id },
          data: {
            status: "expired",
            depositReleaseStatus: releaseStatus as any,
            depositReleasedAt: releasedAt,
          },
        });
        await recordVanEvent(tx, { requestId: pending.id, type: "shift_ended", actorRole: "system" });
        expiredRequests += 1;
        const message =
          releaseStatus === "failed"
            ? "The van has ended its shift before accepting your request. We are releasing your deposit hold."
            : "The van has ended its shift before accepting your request. No deposit was taken — please try again later.";
        await sendPatientNotification(pending.patientId, "Van Went Offline", message, {
          requestId: pending.id,
          status: "expired",
        }).catch(() => {});
      }
    },
    { maxWait: 10_000, timeout: 30_000 },
  );
  if (failedReleases.length > 0) {
    console.error(`[VAN SHIFT END] Failed to release deposits for requests: ${failedReleases.join(", ")}`);
  }

  const updated = await prisma.vanShift.update({
    where: { id: shift.id },
    data: { status: "offline", endedAt: new Date() },
  });
  return { ended: true, shift: updated, expiredRequests, failedReleases };
}
