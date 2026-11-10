import { buildReminderLadder } from "../lib/background-jobs";

const base = {
  dateFormatted: "Tue 10 Nov",
  timeFormatted: "10:30",
  personName: "Dr. Vee Dental",
  clinicName: "Pav Dental",
};

describe("reminder ladder wording (V3)", () => {
  it("never tells a video patient to arrive early or to get directions", () => {
    const video = buildReminderLadder({ ...base, channel: "video" });
    expect(video.map((s) => s.minutesBefore)).toEqual([24 * 60, 60, 10]);
    for (const step of video) {
      const text = `${step.title} ${step.body}`.toLowerCase();
      expect(text).not.toContain("arrive");
      expect(text).not.toContain("directions");
      expect(text).not.toContain("check-in");
      expect(text).toContain("video");
    }
  });

  it("makes the last video reminder open the waiting room", () => {
    const video = buildReminderLadder({ ...base, channel: "video" });
    expect(video[2].screen).toBe("waiting_room");
    expect(video[0].screen).toBeUndefined();
  });

  it("keeps the clinic wording for clinic visits", () => {
    const clinic = buildReminderLadder({ ...base, channel: "clinic" });
    expect(clinic[1].body).toContain("arrive 10 minutes early");
    expect(clinic[2].body).toContain("directions");
  });
});

import { buildAppointmentPush } from "../lib/patient-email-content";

describe("booking change pushes (V1)", () => {
  const start = new Date("2026-11-10T10:30:00Z");
  it("says video consultation for a video visit, and never names the treatment", () => {
    for (const kind of ["booked", "rescheduled", "cancelled"] as const) {
      const video = buildAppointmentPush({ kind, startTimeUtc: start, channel: "video" });
      expect(video.body).toContain("video consultation");
      expect(video.body).toContain("10:30");
      const clinic = buildAppointmentPush({ kind, startTimeUtc: start, channel: "clinic" });
      expect(clinic.body).toContain("appointment");
      expect(clinic.body).not.toContain("video");
    }
  });
});
