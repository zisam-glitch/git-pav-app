// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  describeAlertTarget,
  isValidEmail,
  MAX_RECIPIENTS,
  parseRecipients,
  readSettingsValue,
} from "./email-alert-settings.ts";

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    for (const ok of ["reception@pavdental.com", "a.b+tag@sub.example.co.uk", "x@y.io"]) assert.equal(isValidEmail(ok), true, ok);
  });

  it("refuses typos, spaces and anything that could add headers or recipients", () => {
    for (const bad of ["", "no-at-sign", "a@b", "a@b.c", "a b@example.test", "a@example.test\r\nBcc: x@y.test", "a@x.test,b@x.test", "<a@x.test>", null, 42]) {
      assert.equal(isValidEmail(bad), false, String(bad));
    }
  });
});

describe("parseRecipients", () => {
  it("reads commas, semicolons, spaces and new lines, lower-cases and drops repeats", () => {
    const result = parseRecipients("Reception@Example.test, dr@example.test;\nreception@example.test  office@example.test");
    assert.deepEqual(result, { ok: true, recipients: ["reception@example.test", "dr@example.test", "office@example.test"] });
  });

  it("takes an array too, and an empty box means no addresses", () => {
    assert.deepEqual(parseRecipients(["A@example.test"]), { ok: true, recipients: ["a@example.test"] });
    assert.deepEqual(parseRecipients(""), { ok: true, recipients: [] });
    assert.deepEqual(parseRecipients(undefined), { ok: true, recipients: [] });
  });

  it("names the address it cannot use", () => {
    const result = parseRecipients("good@example.test, oops");
    assert.equal(result.ok, false);
    assert.match(result.error, /"oops" is not a valid email address/);
  });

  it(`allows at most ${MAX_RECIPIENTS} addresses`, () => {
    const many = Array.from({ length: MAX_RECIPIENTS + 1 }, (_, i) => `p${i}@example.test`);
    assert.equal(parseRecipients(many.slice(0, MAX_RECIPIENTS)).ok, true);
    const over = parseRecipients(many);
    assert.equal(over.ok, false);
    assert.match(over.error, /at most 5/);
  });
});

describe("readSettingsValue", () => {
  it("reads what the dashboard writes, and treats a missing switch as on", () => {
    assert.deepEqual(readSettingsValue({ enabled: false, recipients: ["a@example.test"] }), { enabled: false, recipients: ["a@example.test"] });
    assert.deepEqual(readSettingsValue({ recipients: ["a@example.test"] }), { enabled: true, recipients: ["a@example.test"] });
  });

  it("ignores a value that is not the shape we write", () => {
    assert.equal(readSettingsValue(null), null);
    assert.equal(readSettingsValue("text"), null);
    assert.equal(readSettingsValue({ recipients: ["not an address"] }), null);
  });
});

describe("describeAlertTarget", () => {
  const saved = { enabled: true, recipients: ["a@example.test"] };

  it("prefers the saved addresses over the server's default", () => {
    assert.deepEqual(describeAlertTarget(saved, "env@example.test"), { source: "dashboard", recipients: ["a@example.test"], enabled: true });
  });

  it("falls back to the server's default when nothing is saved or the list is empty", () => {
    assert.deepEqual(describeAlertTarget(null, "env@example.test"), { source: "environment", recipients: ["env@example.test"], enabled: true });
    assert.deepEqual(describeAlertTarget({ enabled: true, recipients: [] }, "env@example.test").source, "environment");
  });

  it("says alerts are off when staff switched them off, whatever the default is", () => {
    assert.deepEqual(describeAlertTarget({ enabled: false, recipients: [] }, "env@example.test"), { source: "dashboard", recipients: [], enabled: false });
  });

  it("says nobody gets them when there is no saved or default address", () => {
    assert.deepEqual(describeAlertTarget(null, null), { source: "none", recipients: [], enabled: false });
  });
});
