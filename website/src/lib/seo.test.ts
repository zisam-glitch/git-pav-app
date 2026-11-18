import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  blogPostHead,
  blogPostingJsonLd,
  MOVED_PATHS,
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
  it("serves or permanently redirects every live page, and has no other entries", () => {
    const served = livePages.map((p) => p.path).filter((path) => !(path in MOVED_PATHS));
    assert.deepEqual(Object.keys(PAGES).sort(), served.sort());
    for (const path of Object.keys(MOVED_PATHS)) assert.equal(path in PAGES, false, `${path} redirects, so it has no page`);
  });

  it("copies every live title and description word for word", () => {
    for (const live of livePages.filter((p) => p.title && !(p.path in MOVED_PATHS))) {
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

  it("gives a live blog post its title and a canonical URL, and keeps other posts out of search results", () => {
    const live = "can-you-whiten-just-one-tooth-what-causes-single-tooth-discolouration";
    const head = blogPostHead(live) as { meta: Array<Record<string, any>>; links?: unknown };
    assert.equal(head.meta[0].title, PAGES[`/blog/${live}`].title);
    assert.deepEqual(head.links, [{ rel: "canonical", href: `https://www.pavdental.com/blog/${live}` }]);
    const unknown = blogPostHead("caring-for-new-dentures") as { meta: Array<Record<string, any>> };
    assert.deepEqual(unknown.meta[1], { name: "robots", content: "noindex" });
  });

  it("describes a blog post to search engines with the practice as publisher", () => {
    const live = "can-you-whiten-just-one-tooth-what-causes-single-tooth-discolouration";
    const data = blogPostingJsonLd({
      slug: live,
      title: "Can You Whiten Just One Tooth?",
      date: "2026-09-22",
      author: "Dr Bhojani",
      image: "https://images.ctfassets.net/example/cover.png",
    });
    assert.equal(data["@type"], "BlogPosting");
    assert.equal(data.datePublished, "2026-09-22");
    assert.equal(data.author.name, "Dr Bhojani");
    assert.equal(data.publisher["@id"], PRACTICE_JSON_LD["@id"]);
    assert.equal(data.mainEntityOfPage, `https://www.pavdental.com/blog/${live}`);
    assert.equal(data.description, PAGES[`/blog/${live}`].description);
  });

  it("names shop products from their URL until the shop loads them on the server", () => {
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

  it("sends the live GDPR page, another practice's template, to the privacy notice", () => {
    assert.equal(redirectTarget("/gdpr"), "/privacy-policy");
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
