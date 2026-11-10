import { buildAppointmentEmail } from "../lib/patient-email-content";

describe("appointment emails", () => {
  const start = new Date("2026-11-20T10:30:00Z");

  it("confirms a booking with date, time and place, and no treatment", () => {
    const e = buildAppointmentEmail({ kind: "booked", startTimeUtc: start, channel: "clinic", placeLine: "Pav Dental, 786 Leeds Road, BD3 9TY" });
    expect(e.subject).toBe("Your Pav Dental appointment is confirmed");
    expect(e.text).toContain("Friday 20 November at 10:30 (UK time)");
    expect(e.text).toContain("Pav Dental, 786 Leeds Road, BD3 9TY");
  });

  it("uses UK time in summer", () => {
    const e = buildAppointmentEmail({ kind: "booked", startTimeUtc: new Date("2026-07-01T10:30:00Z"), channel: "clinic", placeLine: null });
    expect(e.text).toContain("11:30 (UK time)");
  });

  it("says a video visit is joined from the app", () => {
    const e = buildAppointmentEmail({ kind: "booked", startTimeUtc: start, channel: "video", placeLine: null });
    expect(e.text).toContain("video consultation");
  });

  it("says when the appointment has moved", () => {
    const e = buildAppointmentEmail({ kind: "rescheduled", startTimeUtc: start, channel: "clinic", placeLine: null });
    expect(e.subject).toBe("Your Pav Dental appointment has moved");
  });

  it("states the refund on a cancellation, or that there is none", () => {
    const refunded = buildAppointmentEmail({ kind: "cancelled", startTimeUtc: start, channel: "clinic", placeLine: null, refundPence: 2500 });
    expect(refunded.text).toContain("£25.00 is being refunded");
    const kept = buildAppointmentEmail({ kind: "cancelled", startTimeUtc: start, channel: "clinic", placeLine: null, refundPence: 0 });
    expect(kept.text).toContain("No deposit is being refunded");
  });

  it("escapes HTML in the place", () => {
    const e = buildAppointmentEmail({ kind: "booked", startTimeUtc: start, channel: "clinic", placeLine: "<script>x</script>" });
    expect(e.html).not.toContain("<script>");
  });
});
