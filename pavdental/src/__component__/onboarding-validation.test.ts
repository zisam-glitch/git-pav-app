import { normalisePostcode, isPlausiblePhone, onboardingSaveError } from "@/features/onboarding/validation";

describe("normalisePostcode", () => {
  it.each([
    ["SW1A 1AA", "SW1A 1AA"],
    ["sw1a1aa", "SW1A 1AA"],
    ["  m1  1ae ", "M1 1AE"],
    ["B338TH", "B33 8TH"],
    ["EC1A1BB", "EC1A 1BB"],
  ])("%s becomes %s", (input, expected) => expect(normalisePostcode(input)).toBe(expected));

  it.each(["", "12345", "SW1A", "hello world", "SW1A 1AAA", "1AA SW1A"])("rejects %s", (input) =>
    expect(normalisePostcode(input)).toBeNull(),
  );
});

describe("isPlausiblePhone", () => {
  it("accepts empty (optional) and real numbers", () => {
    expect(isPlausiblePhone("")).toBe(true);
    expect(isPlausiblePhone("+44 7123 456789")).toBe(true);
    expect(isPlausiblePhone("(020) 7946-0000")).toBe(true);
  });
  it("rejects short or non-numbers", () => {
    expect(isPlausiblePhone("123")).toBe(false);
    expect(isPlausiblePhone("call me maybe")).toBe(false);
  });
});

describe("onboardingSaveError", () => {
  it("never shows the server's raw validation message", () => {
    expect(onboardingSaveError("Invalid request body")).toContain("check your postcode");
    expect(onboardingSaveError(undefined)).toContain("check your postcode");
  });
  it("keeps a specific message from the server", () => {
    expect(onboardingSaveError("Session expired")).toBe("Session expired");
  });
});
