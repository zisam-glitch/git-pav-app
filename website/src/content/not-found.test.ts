import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRACTICE_PHONE } from "../lib/enquiry.ts";
import { PAGES } from "../lib/seo.ts";
import { NOT_FOUND } from "./not-found.ts";

const liveHome = readFileSync(new URL("../../seo/live-text/home.txt", import.meta.url), "utf8").replace(/\s+/g, " ");

describe("the not-found page", () => {
  it("links only to pages that exist, each once", () => {
    const hrefs: string[] = NOT_FOUND.links.map((link) => link.href);
    for (const href of hrefs) assert.ok(href in PAGES, `${href} is not a page`);
    assert.equal(new Set(hrefs).size, hrefs.length);
    for (const link of NOT_FOUND.links) assert.ok(link.label.length > 0);
  });

  it("says what the live home page says about emergency care, and gives the live phone number", () => {
    const claim = NOT_FOUND.pain.replace(/^In pain\? /, "").replace(/ Call$/, "");
    assert.ok(liveHome.includes(claim), `not on the live home page: ${claim}`);
    assert.ok(liveHome.includes(PRACTICE_PHONE));
  });

  it("has no figure on it other than the 404 itself", () => {
    const text = [NOT_FOUND.title, NOT_FOUND.text, NOT_FOUND.bookLabel, ...NOT_FOUND.links.map((link) => link.label)].join(" ");
    assert.deepEqual(text.match(/\d+/g) ?? [], []);
    assert.equal(NOT_FOUND.code, "404");
  });
});
