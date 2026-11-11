import { visitOutcomeCopy, recordVisitOutcome, failedPartsMessage } from "@/features/clinician/visit-outcome";

describe("visitOutcomeCopy", () => {
  it("names the patient and says it can't be undone", () => {
    const c = visitOutcomeCopy("no_show", "Pat Example");
    expect(c.message).toContain("Pat Example");
    expect(c.message).toContain("can't be changed");
    expect(c.confirmLabel).toBe("Mark no-show");
  });
  it("falls back to 'this patient' for the screen's placeholder title or no name", () => {
    expect(visitOutcomeCopy("complete").message).toContain("this patient");
    expect(visitOutcomeCopy("complete", "Patient Record").message).toContain("this patient");
  });
});

describe("recordVisitOutcome", () => {
  const deps = () => ({ complete: jest.fn().mockResolvedValue({}), noShow: jest.fn().mockResolvedValue({}) });

  it("completes through the complete call only", async () => {
    const d = deps();
    expect(await recordVisitOutcome(d, "complete", "a1")).toEqual({ ok: true });
    expect(d.complete).toHaveBeenCalledWith("a1");
    expect(d.noShow).not.toHaveBeenCalled();
  });
  it("marks a no-show through the no-show call only", async () => {
    const d = deps();
    await recordVisitOutcome(d, "no_show", "a1");
    expect(d.noShow).toHaveBeenCalledWith("a1");
    expect(d.complete).not.toHaveBeenCalled();
  });
  it("returns the server's reason when it refuses", async () => {
    const d = deps();
    d.complete.mockRejectedValue(new Error("Appointment cannot be completed from its current status"));
    expect(await recordVisitOutcome(d, "complete", "a1")).toEqual({
      ok: false,
      message: "Appointment cannot be completed from its current status",
    });
  });
  it("uses plain wording when the failure has no message", async () => {
    const d = deps();
    d.noShow.mockRejectedValue("boom");
    expect(await recordVisitOutcome(d, "no_show", "a1")).toEqual({ ok: false, message: "Couldn't mark the no-show." });
  });
});

describe("failedPartsMessage", () => {
  it("says nothing when everything loaded", () => {
    expect(failedPartsMessage([])).toBeNull();
  });
  it("lists what is missing and warns it may be incomplete", () => {
    expect(failedPartsMessage(["dental chart"])).toContain("the dental chart.");
    expect(failedPartsMessage(["dental chart", "treatment plans"])).toContain("dental chart and treatment plans");
    expect(failedPartsMessage(["a", "b", "c"])).toContain("a, b and c");
    expect(failedPartsMessage(["a"])).toContain("incomplete");
  });
});
