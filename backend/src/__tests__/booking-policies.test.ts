import fs from "fs";
import path from "path";
import { bookingPolicies, cancellationMessage, CHECK_IN_OPENS_HOURS } from "../lib/booking-policies";
import { getCancellationPolicy } from "../lib/cancellation-policy";
import { RESCHEDULE_MIN_NOTICE_HOURS } from "../lib/reschedule-policy";
import { WAITING_ROOM_OPENS_MINUTES } from "../lib/video-triage";

describe("Booking policies sent to the app (A1)", () => {
  const policies = bookingPolicies();

  it("carries the numbers the server enforces", () => {
    expect(policies.rescheduleMinNoticeHours).toBe(RESCHEDULE_MIN_NOTICE_HOURS);
    expect(policies.waitingRoomOpensMinutes).toBe(WAITING_ROOM_OPENS_MINUTES);
    expect(policies.checkInOpensHours).toBe(CHECK_IN_OPENS_HOURS);
  });

  it("describes the refund tiers the cancellation code actually applies", () => {
    const { fullRefundHours: full, halfRefundHours: half } = policies.cancellation;
    const pct = (hoursUntilVisit: number) => getCancellationPolicy({ channel: "clinic", hoursUntilVisit }).refundPercentage;
    expect(pct(full)).toBe(100);
    expect(pct(full - 0.01)).toBe(50);
    expect(pct(half)).toBe(50);
    expect(pct(half - 0.01)).toBe(0);
  });

  it("words the message from those same numbers", () => {
    expect(policies.cancellation.message).toBe(cancellationMessage(48, 24));
    expect(cancellationMessage(72, 12)).toContain("72 hours or more");
    expect(cancellationMessage(72, 12)).toContain("12 to 72 hours");
    expect(cancellationMessage(72, 12)).toContain("under 12 hours");
  });

  it("matches the text the app shows before it has heard from the server", () => {
    const appFile = path.resolve(__dirname, "../../../pavdental/src/features/booking/cancellation-policy.ts");
    const source = fs.readFileSync(appFile, "utf8");
    expect(source).toContain(policies.cancellation.message);
  });
});
