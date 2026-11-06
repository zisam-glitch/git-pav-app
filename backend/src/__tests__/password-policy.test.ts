import { createHash } from "crypto";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  PASSWORD_BREACHED,
  PASSWORD_PERSONAL,
  PASSWORD_TOO_COMMON,
  PASSWORD_TOO_LONG,
  PASSWORD_TOO_SHORT,
  breachCountFromRange,
  checkPasswordGuessable,
  checkPasswordLength,
  isBreachedPassword,
  validateNewPassword,
} from "../lib/password-policy";

const sha1 = (value: string) => createHash("sha1").update(value).digest("hex").toUpperCase();

/** The breach service answers with "SUFFIX:COUNT" lines for every hash sharing a prefix. */
function rangeReply(password: string, count: number): typeof fetch {
  const suffix = sha1(password).slice(5);
  return (async () =>
    new Response(`0018A45C4D1DEF81644B54AB7F969B88D65:3\r\n${suffix}:${count}\r\nFFFF0000000000000000000000000000000:0`)) as unknown as typeof fetch;
}

describe("password policy", () => {
  describe("length", () => {
    it("asks for 15 characters, allows up to 128", () => {
      expect(MIN_PASSWORD_LENGTH).toBe(15);
      expect(MAX_PASSWORD_LENGTH).toBe(128);
      expect(checkPasswordLength("a".repeat(14))).toBe(PASSWORD_TOO_SHORT);
      expect(checkPasswordLength("a".repeat(15))).toBeNull();
      expect(checkPasswordLength("a".repeat(128))).toBeNull();
      expect(checkPasswordLength("a".repeat(129))).toBe(PASSWORD_TOO_LONG);
      expect(checkPasswordLength(undefined)).toBe(PASSWORD_TOO_SHORT);
    });

    it("has no composition rules: a lowercase passphrase is fine", () => {
      expect(checkPasswordLength("correct horse battery staple")).toBeNull();
      expect(checkPasswordGuessable("correct horse battery staple")).toBeNull();
      // spaces and symbols are allowed, so password managers and passphrases work
      expect(checkPasswordLength("tea  &  biscuits  ☕ 2026")).toBeNull();
    });
  });

  describe("guessable passwords", () => {
    it("refuses the usual suspects, even padded to length", () => {
      expect(checkPasswordGuessable("123456789012345")).toBe(PASSWORD_TOO_COMMON);
      expect(checkPasswordGuessable("1234567890123456")).toBe(PASSWORD_TOO_COMMON);
      expect(checkPasswordGuessable("aaaaaaaaaaaaaaaa")).toBe(PASSWORD_TOO_COMMON);
      expect(checkPasswordGuessable("abcdabcdabcdabcd")).toBe(PASSWORD_TOO_COMMON);
    });

    it("sees through the usual swaps", () => {
      expect(checkPasswordGuessable("P@ssw0rd")).toBe(PASSWORD_TOO_COMMON);
      expect(checkPasswordGuessable("Passw0rd")).toBe(PASSWORD_TOO_COMMON);
      expect(checkPasswordGuessable("PASSWORD123")).toBe(PASSWORD_TOO_COMMON);
    });

    it("refuses a password that is little more than the person's own details", () => {
      const context = { email: "jane.smithers@example.test", firstName: "Jane", lastName: "Smithers" };
      expect(checkPasswordGuessable("JaneSmithers2026!", context)).toBe(PASSWORD_PERSONAL);
      expect(checkPasswordGuessable("janesmithers", context)).toBe(PASSWORD_PERSONAL);
      // the same name inside a long, unrelated passphrase is fine
      expect(checkPasswordGuessable("jane drinks tea beside the harbour wall", context)).toBeNull();
    });
  });

  describe("breach check", () => {
    const original = process.env.NODE_ENV;
    beforeEach(() => {
      // The check is off under jest so tests never touch the network; turn it on here.
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      delete process.env.PASSWORD_BREACH_CHECK;
    });
    afterEach(() => {
      (process.env as Record<string, string | undefined>).NODE_ENV = original;
      delete process.env.PASSWORD_BREACH_CHECK;
    });

    it("reads the suffix count out of the range reply, ignoring padding rows", () => {
      expect(breachCountFromRange("AAA:5\r\nBBB:0\r\nCCC:12", "ccc")).toBe(12);
      expect(breachCountFromRange("AAA:5\r\nBBB:0", "BBB")).toBe(0);
      expect(breachCountFromRange("", "BBB")).toBe(0);
    });

    it("flags a password that appears in a breach", async () => {
      expect(await isBreachedPassword("hunter2-hunter2-hunter2", rangeReply("hunter2-hunter2-hunter2", 4821))).toBe(true);
    });

    it("passes a password that does not", async () => {
      const reply = (async () => new Response("0018A45C4D1DEF81644B54AB7F969B88D65:3")) as unknown as typeof fetch;
      expect(await isBreachedPassword("a-fresh-unique-passphrase", reply)).toBe(false);
    });

    it("sends only the first five characters of the hash", async () => {
      let url = "";
      const spy = (async (input: unknown) => {
        url = String(input);
        return new Response("");
      }) as unknown as typeof fetch;
      await isBreachedPassword("some secret passphrase", spy);
      expect(url).toBe(`https://api.pwnedpasswords.com/range/${sha1("some secret passphrase").slice(0, 5)}`);
      expect(url).not.toContain("secret");
    });

    it("lets the password through when the service is down or slow", async () => {
      const down = (async () => {
        throw new Error("offline");
      }) as unknown as typeof fetch;
      const broken = (async () => new Response("nope", { status: 503 })) as unknown as typeof fetch;
      expect(await isBreachedPassword("whatever passphrase here", down)).toBe(false);
      expect(await isBreachedPassword("whatever passphrase here", broken)).toBe(false);
    });

    it("can be switched off", async () => {
      process.env.PASSWORD_BREACH_CHECK = "off";
      expect(await isBreachedPassword("hunter2-hunter2-hunter2", rangeReply("hunter2-hunter2-hunter2", 99))).toBe(false);
    });

    it("validateNewPassword runs length, guessable, then breaches", async () => {
      expect(await validateNewPassword("short")).toEqual({ ok: false, error: PASSWORD_TOO_SHORT });
      expect(await validateNewPassword("123456789012345")).toEqual({ ok: false, error: PASSWORD_TOO_COMMON });
      expect(
        await validateNewPassword("hunter2-hunter2-hunter2", {}, rangeReply("hunter2-hunter2-hunter2", 10))
      ).toEqual({ ok: false, error: PASSWORD_BREACHED });
      const clean = (async () => new Response("")) as unknown as typeof fetch;
      expect(await validateNewPassword("harbour lights at midnight", {}, clean)).toEqual({ ok: true });
    });
  });
});
