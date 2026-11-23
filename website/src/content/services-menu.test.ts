import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { isServiceDetailPath, NAV_LINKS, SERVICE_PAGES } from "./site-links.ts";

describe("isServiceDetailPath", () => {
  it("opens the sidebar on a single service page", () => {
    assert.equal(isServiceDetailPath("/services/whitening"), true);
    assert.equal(isServiceDetailPath("/services/finance"), true);
  });

  it("leaves the sidebar off the hub and other pages", () => {
    assert.equal(isServiceDetailPath("/services"), false);
    assert.equal(isServiceDetailPath("/services/"), false);
    assert.equal(isServiceDetailPath("/"), false);
    assert.equal(isServiceDetailPath("/about"), false);
  });
});

describe("header menu links", () => {
  it("lists each header and service link once", () => {
    for (const list of [NAV_LINKS, SERVICE_PAGES]) {
      const hrefs = list.map((link) => link.href);
      assert.equal(new Set(hrefs).size, hrefs.length);
    }
  });

  it("has a route file behind every service page in the menu", () => {
    for (const service of SERVICE_PAGES) {
      const file = `src/routes/services.${service.href.replace("/services/", "")}.tsx`;
      assert.ok(existsSync(new URL(`../../${file}`, import.meta.url)), `missing ${file}`);
    }
  });
});
