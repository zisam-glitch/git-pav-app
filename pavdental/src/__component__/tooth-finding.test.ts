import { toothFinding } from "@/features/records/tooth-finding";

describe("toothFinding", () => {
  it("says nothing is recorded when the tooth has no record", () => {
    expect(toothFinding([], 3)).toBe("Nothing is recorded for this tooth.");
    expect(toothFinding([{ toothNumber: 4, condition: "decay" }], 3)).toBe("Nothing is recorded for this tooth.");
  });
  it("words healthy differently from nothing recorded", () => {
    expect(toothFinding([{ toothNumber: 3, condition: "healthy" }], 3)).toBe("Recorded as healthy.");
  });
  it("gives the condition and the clinician's note", () => {
    expect(toothFinding([{ toothNumber: 3, condition: "decay", notes: " Mesial surface " }], 3)).toBe("Decay. Mesial surface");
  });
  it("gives the condition alone when the note is blank", () => {
    expect(toothFinding([{ toothNumber: 3, condition: "crown", notes: "  " }], 3)).toBe("Crown.");
  });
});
