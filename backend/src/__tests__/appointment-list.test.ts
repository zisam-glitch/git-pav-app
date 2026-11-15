import { toPatientListItem } from "../lib/appointment-list";

describe("The patient's appointment list (I4)", () => {
  const visit = {
    id: "a1",
    status: "confirmed",
    startTimeUtc: new Date("2026-12-01T10:00:00Z"),
    service: { name: "Check-up", durationMinutes: 30 },
    triageData: { iv: "x", ciphertext: "y" },
    accessDetails: { iv: "x", ciphertext: "z" },
  };

  it("leaves out the encrypted triage answers and access details", () => {
    const item = toPatientListItem(visit);
    expect(item).not.toHaveProperty("triageData");
    expect(item).not.toHaveProperty("accessDetails");
  });

  it("keeps everything else the screens show", () => {
    expect(toPatientListItem(visit)).toEqual({
      id: "a1",
      status: "confirmed",
      startTimeUtc: visit.startTimeUtc,
      service: visit.service,
    });
  });

  it("does not change the visit it was given", () => {
    toPatientListItem(visit);
    expect(visit.triageData).toBeDefined();
  });
});
