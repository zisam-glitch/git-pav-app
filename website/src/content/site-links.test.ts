import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGES } from "../lib/seo.ts";
import { FOOTER, NAV_LINKS, SERVICE_PAGES, SOCIAL_LINKS } from "./site-links.ts";

const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const baseline = JSON.parse(readText("../../seo/live-baseline.json"));
const exceptions: Record<string, { missing?: boolean; redirect?: string }> = JSON.parse(readText("../../seo/parity-exceptions.json"));

const siteLinks = new Set<string>([...NAV_LINKS, ...SERVICE_PAGES, ...FOOTER.quickLinks, ...FOOTER.policyLinks].map((link) => link.href));

describe("the header and footer links", () => {
  it("point only at pages that exist, or the sitemap", () => {
    for (const href of siteLinks) {
      assert.ok(href in PAGES || href === "/sitemap.xml", `${href} is not a page`);
      assert.ok(!exceptions[href]?.missing, `${href} is not built yet`);
    }
  });

  it("lead to every link the live header and footer carry on nearly every page, except what the owner approved leaving out", () => {
    const counts = new Map<string, number>();
    for (const page of baseline.pages as Array<{ internalLinks: string[] }>) {
      for (const link of page.internalLinks) counts.set(link, (counts.get(link) ?? 0) + 1);
    }
    const onNearlyEveryPage = [...counts].filter(([, pages]) => pages >= baseline.pages.length * 0.85).map(([link]) => link);
    assert.ok(onNearlyEveryPage.length >= 30, `only ${onNearlyEveryPage.length} links are on nearly every live page`);
    const left = onNearlyEveryPage.filter((link) => {
      if (siteLinks.has(link)) return false;
      const exception = exceptions[link];
      if (exception?.missing) return false; // not built yet: finance and registration
      if (exception?.redirect && siteLinks.has(exception.redirect)) return false; // /gdpr goes to the privacy notice
      return true;
    });
    assert.deepEqual(left, []);
  });

  it("list every service page that exists, once", () => {
    const built = Object.keys(PAGES).filter((path) => path.startsWith("/services/") && !exceptions[path]?.missing);
    assert.deepEqual(SERVICE_PAGES.map((link) => link.href).sort(), built.sort());
  });

  it("carry the sentence the live site puts under the logo on every page", () => {
    assert.ok(readText("../../seo/live-text/home.txt").replace(/\s+/g, " ").includes(FOOTER.about));
  });

  it("link to the practice's profiles over https, without tracking parameters", () => {
    for (const social of SOCIAL_LINKS) {
      const url = new URL(social.href);
      assert.equal(url.protocol, "https:");
      assert.doesNotMatch(url.search, /mibextid|igsh|utm_|[?&]_[tr]=/);
    }
  });
});
