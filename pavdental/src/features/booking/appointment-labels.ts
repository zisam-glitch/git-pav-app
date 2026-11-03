type BookingLike = {
  channel?: string | null;
  clinic?: { name?: string | null } | null;
  van?: { name?: string | null } | null;
  clinician?: { fullName?: string | null } | null;
};

/**
 * Where an appointment happens, by channel. A van visit used to fall through
 * to "Video Consultation" whenever the booking had no clinic name.
 */
export function appointmentLocation(booking: BookingLike): string {
  if (booking.channel === "video") return "Video consult";
  if (booking.channel === "van") return booking.van?.name || "Dental van at your address";
  return booking.clinic?.name || booking.van?.name || "Clinic to be confirmed";
}

/** Who the appointment is with; never an invented name. */
export function appointmentClinician(booking: BookingLike): string {
  return booking.clinician?.fullName || "Dentist to be confirmed";
}
