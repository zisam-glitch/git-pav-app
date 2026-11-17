import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { enquiryPayload, readEnquiryFields } from "./enquiry.ts";

describe("enquiryPayload", () => {
  it("sends the patient's details with a subject naming the service", () => {
    assert.deepEqual(
      enquiryPayload("Root canal", {
        name: " Jane Example ",
        email: "jane@example.test",
        phone: "07700 900123",
        message: "Pain when chewing.",
      }),
      {
        name: "Jane Example",
        email: "jane@example.test",
        phone: "07700 900123",
        subject: "Root canal enquiry",
        message: "Pain when chewing.",
      },
    );
  });

  it("keeps a subject the patient typed and puts their chosen option before the message", () => {
    const payload = enquiryPayload("Teeth whitening", {
      name: "Jane Example",
      email: "jane@example.test",
      subject: "Wedding in June",
      interest: "Custom Home Suite (£295)",
      message: "I have one crown.",
    });
    assert.equal(payload.subject, "Wedding in June");
    assert.equal(payload.message, "Interested in: Custom Home Suite (£295)\n\nI have one crown.");
  });

  it("never sends an empty message, which the dashboard would reject", () => {
    const payload = enquiryPayload("Dentures", { name: "Jane Example", email: "jane@example.test" });
    assert.equal(payload.message, "Dentures enquiry from the website.");
    assert.equal(payload.phone, undefined);
  });
});

describe("readEnquiryFields", () => {
  const reader = (values: Record<string, string>) => (name: string) => values[name] ?? "";

  it("reads the fields by input name", () => {
    assert.deepEqual(
      readEnquiryFields(reader({ name: "Jane", email: "jane@example.test", phone: "1", subject: "s", message: "m" })),
      { name: "Jane", email: "jane@example.test", phone: "1", subject: "s", message: "m", interest: "" },
    );
  });

  it("joins a first and last name, and accepts fullName", () => {
    assert.equal(readEnquiryFields(reader({ firstName: "Jane", lastName: "Example" })).name, "Jane Example");
    assert.equal(readEnquiryFields(reader({ fullName: "Jane Example" })).name, "Jane Example");
  });

  it("combines two option fields", () => {
    assert.equal(readEnquiryFields(reader({ interest: "Top 6 Teeth", interest2: "14k Rose Gold" })).interest, "Top 6 Teeth, 14k Rose Gold");
  });
});
