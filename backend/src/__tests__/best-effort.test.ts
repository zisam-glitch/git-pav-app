import { logFailure } from "../lib/best-effort";

describe("logFailure", () => {
  it("logs what failed instead of swallowing it, with personal data scrubbed", () => {
    const logged = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      logFailure("audit write appointment.completed")(new Error("no row for shopper@example.test"));

      expect(logged).toHaveBeenCalledTimes(1);
      const output = JSON.stringify(logged.mock.calls[0]);
      expect(output).toContain("audit write appointment.completed");
      expect(output).not.toContain("shopper@example.test");
    } finally {
      logged.mockRestore();
    }
  });

  it("never throws, so it can't fail the request it protects", () => {
    const logged = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      expect(() => logFailure("reminder cancellation")("not an error object")).not.toThrow();
    } finally {
      logged.mockRestore();
    }
  });
});
