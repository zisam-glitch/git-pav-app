import {
  EMAIL_CODE_LENGTH,
  EMAIL_CODE_MAX_ATTEMPTS,
  EMAIL_CODE_VALID_SECONDS,
  formatEmailCode,
  generateEmailCode,
  hashEmailCode,
  normaliseEmailCode,
} from "../lib/email-code";

describe("email verification codes", () => {
  it("makes six digit codes, zero padded", () => {
    for (let i = 0; i < 500; i++) {
      expect(generateEmailCode()).toMatch(/^\d{6}$/);
    }
  });

  it("does not repeat one value (it is random, not a counter)", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateEmailCode()));
    expect(seen.size).toBeGreaterThan(150);
  });

  it("accepts digits with spaces or dashes and rejects anything else", () => {
    expect(normaliseEmailCode("483921")).toBe("483921");
    expect(normaliseEmailCode(" 483 921 ")).toBe("483921");
    expect(normaliseEmailCode("483-921")).toBe("483921");
    expect(normaliseEmailCode("004821")).toBe("004821");
    expect(normaliseEmailCode("12345")).toBeNull();
    expect(normaliseEmailCode("1234567")).toBeNull();
    expect(normaliseEmailCode("12345a")).toBeNull();
    expect(normaliseEmailCode("4de7868aa541ca88bd7367f546ee6dd4")).toBeNull();
    expect(normaliseEmailCode(483921)).toBeNull();
    expect(normaliseEmailCode(undefined)).toBeNull();
  });

  it("ties the stored hash to the user, so the same digits differ per person", () => {
    const a = hashEmailCode("user-a", "123456");
    const b = hashEmailCode("user-b", "123456");
    expect(a).not.toBe(b);
    expect(a).toBe(hashEmailCode("user-a", "123456"));
    expect(a).not.toContain("123456");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("formats a code for the email body", () => {
    expect(formatEmailCode("483921")).toBe("483 921");
  });

  it("keeps the limits tight: short life, few guesses", () => {
    expect(EMAIL_CODE_LENGTH).toBe(6);
    expect(EMAIL_CODE_VALID_SECONDS).toBeLessThanOrEqual(30 * 60);
    expect(EMAIL_CODE_MAX_ATTEMPTS).toBeLessThanOrEqual(5);
  });
});
