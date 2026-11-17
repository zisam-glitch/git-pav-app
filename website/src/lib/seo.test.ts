import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  blogPostHead,
  noindexHead,
  PAGES,
  type PageSeo,
  PRACTICE_JSON_LD,
  productHead,
  redirectTarget,
  seoHead,
  sitemapXml,
  titleFromSlug,
} from "./seo.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
// What the live site serves, recorded by scripts/seo-snapshot.mjs (seo/README.md).
const baseline = JSON.parse(read("../../seo/live-baseline.json"));
const livePages: Array<{ path: string; title: string; description: string | null; jsonLd: any[] }> = baseline.pages;
const pages: Record<string, PageSeo | undefined> = PAGES;

describe("titles and descriptions follow the live site", () => {
  it("has an entry for every live page and no others", () => {
    assert.deepEqual(Object.keys(PAGES).sort(), livePages.map((p) => p.path).sort());
  });

  it("copies every live title and description word for word", () => {
    for (const live of livePages.filter((p) => p.title)) {
      const ours = pages[live.path];
      assert.equal(ours?.title, live.title, live.path);
      assert.equal(ours?.description, live.description, live.path);
      assert.equal(ours?.written, undefined, `${live.path} has a live title, so it is not written`);
    }
  });

  it("writes a title and description for live pages that had none", () => {
    for (const live of livePages.filter((p) => !p.title)) {
      const ours = pages[live.path];
      assert.equal(ours?.written, true, live.path);
      assert.ok((ours?.title.length ?? 0) > 10, live.path);
      assert.ok((ours?.description.length ?? 0) > 50, live.path);
    }
  });

  it("gives every page its own title", () => {
    const titles = Object.values(pages).map((p) => p?.title);
    assert.equal(new Set(titles).size, titles.length);
  });
});

describe("site files", () => {
  it("serves the live robots.txt unchanged", () => {
    assert.equal(read("../../public/robots.txt"), baseline.robotsTxt.body);
  });

  it("lists every page in public/sitemap.xml (run npm run seo:sitemap after changing PAGES)", () => {
    assert.equal(read("../../public/sitemap.xml"), sitemapXml());
  });
});

describe("structured data", () => {
  it("keeps the practice details the live site gives search engines", () => {
    const live = livePages.find((p) => p.path === "/")?.jsonLd[0];
    assert.equal(PRACTICE_JSON_LD["@type"], live["@type"]);
    assert.equal(PRACTICE_JSON_LD.name, live.name);
    assert.equal(PRACTICE_JSON_LD.telephone, live.telephone);
    assert.equal(PRACTICE_JSON_LD.image, live.image);
    assert.deepEqual(PRACTICE_JSON_LD.geo, live.geo);
    assert.deepEqual(PRACTICE_JSON_LD.openingHoursSpecification, live.openingHoursSpecification);
    assert.equal(PRACTICE_JSON_LD.address.postalCode, live.address.postalCode);
    assert.equal(PRACTICE_JSON_LD.address.addressLocality, live.address.addressLocality);
    assert.equal(PRACTICE_JSON_LD.address.addressCountry, live.address.addressCountry);
    assert.ok(live.address.streetAddress.startsWith("786 Leeds R"));
    for (const profile of PRACTICE_JSON_LD.sameAs) {
      assert.ok(
        live.sameAs.some((url: string) => url.startsWith(profile)),
        `${profile} is not one of the live profile links`,
      );
    }
  });
});

describe("head tags", () => {
  it("gives a page its title, description and a canonical URL on www", () => {
    const head = seoHead("/services/whitening");
    assert.equal(head.meta[0].title, PAGES["/services/whitening"].title);
    assert.deepEqual(head.meta[1], { name: "description", content: PAGES["/services/whitening"].description });
    assert.deepEqual(head.links, [{ rel: "canonical", href: "https://www.pavdental.com/services/whitening" }]);
    assert.deepEqual(seoHead("/").links, [{ rel: "canonical", href: "https://www.pavdental.com/" }]);
  });

  it("uses a live blog post's title, and names other posts and products from their URL", () => {
    const live = "can-you-whiten-just-one-tooth-what-causes-single-tooth-discolouration";
    assert.equal(blogPostHead(live).meta[0].title, PAGES[`/blog/${live}`].title);
    assert.equal(blogPostHead("caring-for-new-dentures").meta[0].title, "Caring For New Dentures | Pav Dental Blog");
    assert.equal(productHead("whitening-strips").meta[0].title, "Whitening Strips | Pav Dental Shop");
    assert.equal(titleFromSlug("electric-toothbrushes"), "Electric Toothbrushes");
  });

  it("keeps the cart and checkout out of search results", () => {
    assert.deepEqual(noindexHead("Your cart | Pav Dental").meta[1], { name: "robots", content: "noindex" });
  });
});

describe("redirectTarget", () => {
  it("sends the mobile app's old legal links to the live URLs", () => {
    assert.equal(redirectTarget("/privacy"), "/privacy-policy");
    assert.equal(redirectTarget("/terms"), "/terms-and-condition");
    assert.equal(redirectTarget("/cookies"), "/cookie-policy");
    assert.equal(redirectTarget("/complaints"), "/complaints-policy");
  });

  it("drops a trailing slash so each page has one URL", () => {
    assert.equal(redirectTarget("/about/"), "/about");
    assert.equal(redirectTarget("/privacy/"), "/privacy-policy");
    assert.equal(redirectTarget("//"), "/");
  });

  it("serves every live URL as it is", () => {
    assert.equal(redirectTarget("/"), null);
    for (const path of Object.keys(PAGES)) assert.equal(redirectTarget(path), null, path);
  });
});
