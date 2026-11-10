/**
 * What we tell a patient about cancelling and refunds. One text, so the
 * bookings list, the appointment screen and the "cancelled" screen agree with
 * each other and with the server's policy (full, half or none by notice).
 */

export const CANCELLATION_SHEET_MESSAGE =
  "Your slot will be released immediately. Cancelling 48 hours or more ahead refunds your deposit in full, 24 to 48 hours ahead refunds half, and under 24 hours the deposit is kept.";

export const REFUND_TIMING = "Banks usually take 5 to 10 working days to show it.";
