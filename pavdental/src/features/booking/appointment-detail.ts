/**
 * Small, pure helpers for the appointment screen, so what it says about a
 * visit comes from the booking and can be tested without rendering.
 */

type Clinic = { name?: string | null; address?: string | null; postcode?: string | null };

/** The server opens check-in this long before the visit. */
export const CHECK_IN_OPENS_HOURS = 48;

/** Check-in is for a confirmed clinic or van visit, not yet done, inside the server's window. */
export function canCheckIn(
  booking: {
    status: string;
    channel: string;
    startTimeUtc: string;
    accessDetails?: { checkedIn?: boolean } | null;
  },
  now: number = Date.now()
): boolean {
  if (booking.status !== "confirmed" || booking.channel === "video") return false;
  if (booking.accessDetails?.checkedIn) return false;
  const until = new Date(booking.startTimeUtc).getTime() - now;
  return until > 0 && until < CHECK_IN_OPENS_HOURS * 60 * 60 * 1000;
}

/** "Name, street, postcode", leaving out whatever the server didn't send. */
export function clinicAddressLine(clinic: Clinic | null | undefined): string | null {
  if (!clinic) return null;
  const parts = [clinic.name, clinic.address, clinic.postcode].filter((p): p is string => !!p);
  return parts.length ? parts.join(", ") : null;
}

/** Who the visit is for: the child it was booked for, or the patient. */
export function visitFor(booking: {
  dependant?: { firstName?: string | null; lastName?: string | null } | null;
}): string {
  const d = booking.dependant;
  if (!d) return "You";
  return [d.firstName, d.lastName].filter(Boolean).join(" ") || "You";
}

const pounds = (pence: number) => `£${(pence / 100).toFixed(2)}`;

export function priceLabel(totalPricePence: number | null | undefined): string | null {
  return typeof totalPricePence === "number" ? pounds(totalPricePence) : null;
}

/** What is still to pay in person. Nothing for a cancelled visit. */
export function balanceLabel(booking: {
  totalPricePence?: number | null;
  depositPaidPence?: number | null;
  status: string;
}): string | null {
  if (booking.status === "cancelled" || typeof booking.totalPricePence !== "number") return null;
  return pounds(Math.max(0, booking.totalPricePence - (booking.depositPaidPence ?? 0)));
}

/** A maps link for the clinic's address; opens in whichever maps app the phone prefers. */
export function directionsUrl(clinic: Clinic | null | undefined): string | null {
  if (!clinic?.address) return null;
  const query = [clinic.address, clinic.postcode].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
