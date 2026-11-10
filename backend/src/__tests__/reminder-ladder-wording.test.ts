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
    expect(video.map((s) => s.hoursBefore)).toEqual([48, 24, 2]);
    for (const step of video) {
      const text = `${step.title} ${step.body}`.toLowerCase();
      expect(text).not.toContain("arrive");
      expect(text).not.toContain("directions");
      expect(text).not.toContain("check-in");
      expect(text).toContain("video");
    }
  });

  it("keeps the clinic wording for clinic visits", () => {
    const clinic = buildReminderLadder({ ...base, channel: "clinic" });
    expect(clinic[1].body).toContain("arrive 10 minutes early");
    expect(clinic[2].body).toContain("directions");
  });
});
