import {
  APPOINTMENT_STATUS,
  CARE_CHANNELS,
  USER_ROLES,
  isActiveAppointment,
  isAdmin,
  isCancelled,
  isClinicChannel,
  isClinician,
  isCompleted,
  isConfirmed,
  isDraftHold,
  isInProgress,
  isNoShow,
  isOperator,
  isPatient,
  isVanChannel,
  isVideoChannel,
} from "@/lib/domain-enums";

describe("domain-enums", () => {
  it("identifies care channels", () => {
    expect(isClinicChannel(CARE_CHANNELS.CLINIC)).toBe(true);
    expect(isVanChannel(CARE_CHANNELS.VAN)).toBe(true);
    expect(isVideoChannel(CARE_CHANNELS.VIDEO)).toBe(true);
    expect(isVideoChannel("clinic")).toBe(false);
    expect(isClinicChannel(null)).toBe(false);
  });

  it("identifies appointment statuses case-insensitively", () => {
    expect(isDraftHold({ status: APPOINTMENT_STATUS.DRAFT_HOLD })).toBe(true);
    expect(isConfirmed({ status: APPOINTMENT_STATUS.CONFIRMED })).toBe(true);
    expect(isInProgress({ status: APPOINTMENT_STATUS.IN_PROGRESS })).toBe(true);
    expect(isInProgress({ status: "IN_PROGRESS" })).toBe(true);
    expect(isCompleted({ status: APPOINTMENT_STATUS.COMPLETED })).toBe(true);
    expect(isCancelled({ status: APPOINTMENT_STATUS.CANCELLED })).toBe(true);
    expect(isNoShow({ status: APPOINTMENT_STATUS.NO_SHOW })).toBe(true);
    expect(isActiveAppointment({ status: APPOINTMENT_STATUS.CONFIRMED })).toBe(true);
    expect(isActiveAppointment({ status: APPOINTMENT_STATUS.IN_PROGRESS })).toBe(true);
    expect(isActiveAppointment({ status: APPOINTMENT_STATUS.CANCELLED })).toBe(false);
  });

  it("identifies user roles", () => {
    expect(isPatient({ role: USER_ROLES.PATIENT })).toBe(true);
    expect(isClinician({ role: USER_ROLES.CLINICIAN })).toBe(true);
    expect(isOperator({ role: USER_ROLES.OPERATOR })).toBe(true);
    expect(isAdmin({ role: USER_ROLES.ADMIN })).toBe(true);
    expect(isOperator({ role: "patient" })).toBe(false);
    expect(isPatient(undefined)).toBe(false);
  });
});
