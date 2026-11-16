import { communicationService } from "./communication-service";
import { prisma } from "./prisma";
import { logger } from "./structured-logging";

// BE-09: Expo's send call only says it accepted a message. Its receipt, ready
// a few minutes later, says whether Apple or Google took it, and a
// DeviceNotRegistered receipt means the app was removed from that phone, so
// the token is switched off and stops being sent to.

/** Expo's guidance is to wait about 15 minutes before asking for receipts. */
export const RECEIPT_DELAY_MS = 15 * 60 * 1000;
/** Expo keeps receipts for about a day; older tickets can't be checked. */
export const RECEIPT_TTL_MS = 24 * 60 * 60 * 1000;
const BATCH_SIZE = 1000;

export async function checkPushReceipts(now = new Date()): Promise<{ checked: number; settled: number; deactivated: number }> {
  await prisma.pushTicket.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - RECEIPT_TTL_MS) } } });

  const due = await prisma.pushTicket.findMany({
    where: { createdAt: { lte: new Date(now.getTime() - RECEIPT_DELAY_MS) } },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
  });
  if (due.length === 0) return { checked: 0, settled: 0, deactivated: 0 };

  const result = await communicationService.checkExpoReceipts(
    due.map((t) => t.id),
    Object.fromEntries(due.map((t) => [t.id, t.token])),
  );
  // Tickets without a receipt yet stay for the next run, until they expire.
  if (result.settledTicketIds.length > 0) {
    await prisma.pushTicket.deleteMany({ where: { id: { in: result.settledTicketIds } } });
  }
  if (result.errorCount > 0) {
    // Codes only (for example InvalidCredentials, which stops every push).
    logger.error("[Push] Receipt errors", undefined, { errorsByCode: result.errorsByCode });
  }
  return { checked: due.length, settled: result.settledTicketIds.length, deactivated: result.deactivatedTokens.length };
}
