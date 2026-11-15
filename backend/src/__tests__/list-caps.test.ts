import { LIST_CAPS } from "../lib/list-caps";

describe("Caps on a patient's lists (I2)", () => {
  it("every list has a positive whole-number cap", () => {
    for (const [name, cap] of Object.entries(LIST_CAPS)) {
      expect(Number.isInteger(cap) && cap > 0).toBe(true);
      expect(cap).toBeLessThanOrEqual(500);
      expect(name.length).toBeGreaterThan(0);
    }
  });
});
