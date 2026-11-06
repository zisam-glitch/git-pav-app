import { isValidBootstrapEmail } from "../lib/bootstrap-admin";

describe("first admin bootstrap", () => {
  it("accepts a normal address and rejects anything else", () => {
    expect(isValidBootstrapEmail("pav@below2000.com")).toBe(true);
    expect(isValidBootstrapEmail("  pav@below2000.com ")).toBe(true);
    expect(isValidBootstrapEmail("")).toBe(false);
    expect(isValidBootstrapEmail(undefined)).toBe(false);
    expect(isValidBootstrapEmail("not-an-email")).toBe(false);
    expect(isValidBootstrapEmail("a b@c.d")).toBe(false);
  });
});
