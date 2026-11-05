// Run with `npm test`. Node strips the types from pav-privacy.ts when it is imported.

import {
  CONSENT_TYPES,
  PRIVACY_PAGE_SIZE,
  consentLabel,
  consentsPath,
  fileSize,
  lawfulBasisLabel,
  sarExportsPath,
} from "./pav-privacy.ts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const ID = "6b1c7f3e-2a4d-4e8b-9c0a-1d2e3f4a5b6c";
const BASE = `page=1&limit=${PRIVACY_PAGE_SIZE}`;

describe("consentsPath", () => {
  it("sends only the filters that are set", () => {
    assert.equal(consentsPath({ consentType: "", status: "", patientId: "" }), `consents?${BASE}`);
    assert.equal(
      consentsPath({ consentType: "marketing", status: "withdrawn", patientId: ID }, 2),
      `consents?page=2&limit=${PRIVACY_PAGE_SIZE}&consentType=marketing&status=withdrawn&patientId=${ID}`,
    );
  });

  it("drops anything malformed instead of sending it on", () => {
    assert.equal(consentsPath({ consentType: "made_up", status: "maybe", patientId: "not-an-id" }), `consents?${BASE}`);
  });

  it("trims a pasted patient id", () => {
    assert.match(consentsPath({ consentType: "", status: "", patientId: `  ${ID}\n` }), new RegExp(`patientId=${ID}$`));
  });

  it("never asks for a page below 1", () => {
    assert.match(consentsPath({ consentType: "", status: "", patientId: "" }, 0), /^consents\?page=1&/);
  });
});

describe("sarExportsPath", () => {
  it("sends only the filters that are set", () => {
    assert.equal(sarExportsPath({ from: "", to: "", patientId: "" }), `sar-exports?${BASE}`);
    assert.equal(
      sarExportsPath({ from: "2031-03-11", to: "2031-03-12", patientId: ID }),
      `sar-exports?${BASE}&from=2031-03-11&to=2031-03-12&patientId=${ID}`,
    );
  });

  it("drops anything malformed", () => {
    assert.equal(sarExportsPath({ from: "11/03/2031", to: "2031-03-12; drop", patientId: "x" }), `sar-exports?${BASE}`);
  });
});

describe("labels", () => {
  it("turns consent types into words", () => {
    assert.equal(consentLabel("marketing_communications"), "Marketing communications");
    assert.equal(consentLabel("data_processing"), "Data processing");
  });

  it("has a label for every consent type the backend accepts", () => {
    for (const type of CONSENT_TYPES) assert.ok(consentLabel(type).length > 0);
    assert.equal(CONSENT_TYPES.length, 13);
  });

  it("names lawful bases, and falls back to readable words for a new one", () => {
    assert.equal(lawfulBasisLabel("legitimate_interests"), "Legitimate interests");
    assert.equal(lawfulBasisLabel("something_new"), "Something new");
  });
});

describe("fileSize", () => {
  it("shows a readable size", () => {
    assert.equal(fileSize(0), "0 B");
    assert.equal(fileSize(512), "512 B");
    assert.equal(fileSize(2048), "2.0 KB");
    assert.equal(fileSize(5 * 1024 * 1024), "5.0 MB");
  });

  it("copes with a missing or bad size", () => {
    assert.equal(fileSize(Number.NaN), "0 B");
    assert.equal(fileSize(-3), "0 B");
  });
});
