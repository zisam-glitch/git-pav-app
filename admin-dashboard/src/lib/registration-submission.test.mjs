// Run with `npm test`.

import { isPlausibleBirthDate, LIMITS, validateRegistration } from "./registration-submission.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const today = new Date("2026-11-24T12:00:00Z");

const good = () => ({
  fullName: "Jane Example",
  email: "jane@example.test",
  mobilePhone: "07700 900123",
  dateOfBirth: "1990-04-17",
  consent: true,
  consentVersion: "2026-11-24",
  sections: [
    {
      title: "Personal info",
      items: [
        { label: "Full name", value: "Jane Example" },
        { label: "Date of birth", value: "17 April 1990" },
      ],
    },
    { title: "Medical history", items: [{ label: "Are you allergic to any medications or substances?", value: "No" }] },
  ],
});

describe("validateRegistration", () => {
  it("accepts a complete registration and returns the cleaned values", () => {
    const result = validateRegistration({ ...good(), fullName: "  Jane Example  " }, today);
    assert.equal(result.ok, true);
    assert.equal(result.value.fullName, "Jane Example");
    assert.equal(result.value.sections.length, 2);
    assert.deepEqual(result.value.sections[0].items[0], { label: "Full name", value: "Jane Example" });
  });

  it("requires the fields staff need to reach the patient and match the record", () => {
    for (const [field, bad] of [
      ["fullName", ""],
      ["fullName", "J"],
      ["email", "not-an-email"],
      ["email", ""],
      ["mobilePhone", "abc"],
      ["mobilePhone", "12"],
      ["dateOfBirth", ""],
      ["dateOfBirth", "17/04/1990"],
    ]) {
      const result = validateRegistration({ ...good(), [field]: bad }, today);
      assert.equal(result.ok, false, `${field}=${bad}`);
    }
  });

  it("requires consent to be given, exactly", () => {
    for (const consent of [false, undefined, "true", 1, null]) {
      assert.equal(validateRegistration({ ...good(), consent }, today).ok, false, String(consent));
    }
    assert.equal(validateRegistration({ ...good(), consentVersion: "" }, today).ok, false);
  });

  it("refuses anything that is not an object, or has no answers", () => {
    for (const body of [null, undefined, "text", 5, [], { ...good(), sections: [] }, { ...good(), sections: "x" }]) {
      assert.equal(validateRegistration(body, today).ok, false);
    }
  });

  it("refuses answers of the wrong shape", () => {
    const badSections = [
      [{ title: "", items: [] }],
      [{ title: "Medical history", items: "none" }],
      [{ title: "Medical history", items: [{ label: "Q", value: 5 }] }],
      [{ title: "Medical history", items: [{ label: "", value: "x" }] }],
      [{ title: "Medical history", items: ["x"] }],
      ["x"],
    ];
    for (const sections of badSections) {
      assert.equal(validateRegistration({ ...good(), sections }, today).ok, false, JSON.stringify(sections));
    }
  });

  it("limits how much one registration can hold", () => {
    const long = "x".repeat(LIMITS.value + 1);
    assert.equal(
      validateRegistration({ ...good(), sections: [{ title: "A", items: [{ label: "Q", value: long }] }] }, today).ok,
      false,
    );
    const many = Array.from({ length: LIMITS.items + 1 }, (_, i) => ({ label: `Q${i}`, value: "No" }));
    const sections = [];
    for (let i = 0; i < many.length; i += LIMITS.itemsPerSection) {
      sections.push({ title: `S${i}`, items: many.slice(i, i + LIMITS.itemsPerSection) });
    }
    assert.equal(validateRegistration({ ...good(), sections }, today).ok, false);
    const tooManySections = Array.from({ length: LIMITS.sections + 1 }, (_, i) => ({ title: `S${i}`, items: [] }));
    assert.equal(validateRegistration({ ...good(), sections: tooManySections }, today).ok, false);
  });

  it("stores plain text: control characters are dropped, line breaks kept", () => {
    const result = validateRegistration(
      { ...good(), sections: [{ title: "A", items: [{ label: "Q", value: "line one\nline\u0007 two\u0000" }] }] },
      today,
    );
    assert.equal(result.ok, true);
    assert.equal(result.value.sections[0].items[0].value, "line one\nline two");
  });
});

describe("isPlausibleBirthDate", () => {
  it("accepts real dates from 1900 up to today", () => {
    assert.equal(isPlausibleBirthDate("1900-01-01", today), true);
    assert.equal(isPlausibleBirthDate("2024-02-29", today), true);
    assert.equal(isPlausibleBirthDate("2026-11-24", today), true);
  });

  it("refuses impossible, future and too-old dates", () => {
    for (const value of ["2026-11-25", "2025-02-29", "1899-12-31", "2000-13-01", "2000-00-10", "2000-1-1", "", "x"]) {
      assert.equal(isPlausibleBirthDate(value, today), false, value);
    }
  });
});
