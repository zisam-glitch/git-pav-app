// Run with `npm test`. Node strips the types from pav-prescriptions.ts when it is imported.

import {
  PRESCRIPTIONS_PAGE_SIZE,
  PRESCRIPTION_STATE_LABEL,
  prescriptionState,
  prescriptionsPath,
} from "./pav-prescriptions.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const ID = "6b1c7f3e-2a4d-4e8b-9c0a-1d2e3f4a5b6c";

describe("prescriptionsPath", () => {
  it("sends only the filters that are set", () => {
    assert.equal(
      prescriptionsPath({ clinicianId: "", from: "", to: "" }),
      `prescriptions?page=1&limit=${PRESCRIPTIONS_PAGE_SIZE}`,
    );
    assert.equal(
      prescriptionsPath({ clinicianId: ID, from: "2031-03-11", to: "2031-03-12" }, 3),
      `prescriptions?page=3&limit=${PRESCRIPTIONS_PAGE_SIZE}&clinicianId=${ID}&from=2031-03-11&to=2031-03-12`,
    );
  });

  it("drops anything malformed instead of sending it on", () => {
    assert.equal(
      prescriptionsPath({ clinicianId: "not-an-id", from: "11/03/2031", to: "2031-03-12; drop" }),
      `prescriptions?page=1&limit=${PRESCRIPTIONS_PAGE_SIZE}`,
    );
  });

  it("never asks for a page below 1", () => {
    assert.match(prescriptionsPath({ clinicianId: "", from: "", to: "" }, 0), /page=1&/);
    assert.match(prescriptionsPath({ clinicianId: "", from: "", to: "" }, -4), /page=1&/);
  });
});

describe("prescriptionState", () => {
  it("separates sent, signed-not-sent and unsigned", () => {
    assert.equal(prescriptionState({ signed: true, dispatchedAt: "2031-03-11T10:00:00.000Z" }), "sent");
    assert.equal(prescriptionState({ signed: true, dispatchedAt: null }), "signed");
    assert.equal(prescriptionState({ signed: false, dispatchedAt: null }), "unsigned");
  });

  it("treats an unsigned prescription as unsigned even if it has a sent date", () => {
    assert.equal(prescriptionState({ signed: false, dispatchedAt: "2031-03-11T10:00:00.000Z" }), "unsigned");
  });

  it("has words for every state", () => {
    assert.deepEqual(Object.keys(PRESCRIPTION_STATE_LABEL).sort(), ["sent", "signed", "unsigned"]);
  });
});
