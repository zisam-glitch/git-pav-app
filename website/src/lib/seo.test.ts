import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { BLOG_POSTS } from "../content/blog-posts.ts";
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
  teamPersonJsonLd,
  teamProfileHead,
  titleFromSlug,
  UNBUILT_PATHS,
} from "./seo.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
// What the live site serves, recorded by scripts/seo-snapshot.mjs (seo/README.md).
const baseline = JSON.parse(read("../../seo/live-baseline.json"));
const exceptions: Record<string, { approvedTitle?: boolean; approvedDescription?: boolean }> = JSON.parse(
  read("../../seo/parity-exceptions.json"),
);
const livePages: Array<{ path: string; title: string; description: string | null; jsonLd: any[] }> = baseline.pages;
const pages: Record<string, PageSeo | undefined> = PAGES;

describe("titles and descriptions follow the live site", () => {
  it("serves or permanently redirects every live page, and has no other entries", () => {
    const served = livePages.map((p) => p.path).filter((path) => !(path in MOVED_PATHS));
    // The recording holds the six posts the live blog page opens with; the live blog has 27 more behind
    // "Load More", and /blog/all lists them all, so those pages are served too.
    const more = BLOG_POSTS.map((post) => `/blog/${post.slug}`).filter((path) => !served.includes(path));
    assert.equal(more.length, 27);
    assert.deepEqual(Object.keys(PAGES).sort(), [...served, ...more, "/blog/all"].sort());
    for (const path of Object.keys(MOVED_PATHS)) assert.equal(path in PAGES, false, `${path} redirects, so it has no page`);
  });

  it("copies every live title and description word for word unless approved in parity-exceptions.json", () => {
    for (const live of livePages.filter((p) => p.title && !(p.path in MOVED_PATHS))) {
      const ours = pages[live.path];
      const exc = exceptions[live.path];
      if (!exc?.approvedTitle) {
        assert.equal(ours?.title, live.title, live.path);
      } else {
        assert.ok((ours?.title.length ?? 0) > 10, live.path);
      }
      if (!exc?.approvedDescription) {
        assert.equal(ours?.description, live.description, live.path);
      } else {
        assert.ok((ours?.description.length ?? 0) > 50, live.path);
      }
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

  it("lists every built page in public/sitemap.xml and omits held 404 paths (run npm run seo:sitemap after changing PAGES)", () => {
    const xml = sitemapXml();
    assert.equal(read("../../public/sitemap.xml"), xml);
    for (const path of UNBUILT_PATHS) {
      assert.equal(xml.includes(`<loc>https://www.pavdental.com${path}</loc>`), false, `${path} should not be in sitemap`);
    }
  });
});

describe("structured data", () => {
  it("keeps the practice details the live site gives search engines", () => {
    const live = livePages.find((p) => p.path === "/")?.jsonLd[0];
    assert.equal(PRACTICE_JSON_LD["@type"], live["@type"]);
    assert.equal(PRACTICE_JSON_LD.name, live.name);
    assert.equal(PRACTICE_JSON_LD.telephone, live.telephone);
    assert.equal(PRACTICE_JSON_LD.image, "https://www.pavdental.com/images/pav-logo.svg");
    assert.ok(existsSync(new URL("../../public/images/pav-logo.svg", import.meta.url)), "local pav-logo.svg must exist");
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

  it("gives a team profile its live title and a canonical URL", () => {
    const head = teamProfileHead("dr-cosimo-meucci") as { meta: Array<Record<string, any>>; links?: unknown };
    assert.equal(head.meta[0].title, PAGES["/team/dr-cosimo-meucci"].title);
    assert.deepEqual(head.links, [{ rel: "canonical", href: "https://www.pavdental.com/team/dr-cosimo-meucci" }]);
  });

  it("names a team member and the practice they work for in structured data", () => {
    const person = teamPersonJsonLd("dr-cosimo-meucci", {
      name: "Dr Cosimo Meucci",
      role: "Implant Dentist",
      photo: "/images/team/3.jpg",
    });
    assert.equal(person["@type"], "Person");
    assert.equal(person.jobTitle, "Implant Dentist");
    assert.equal(person.image, "https://www.pavdental.com/images/team/3.jpg");
    assert.equal(person.url, "https://www.pavdental.com/team/dr-cosimo-meucci");
    assert.equal(person.worksFor["@id"], PRACTICE_JSON_LD["@id"]);
  });

  it("keeps a profile that does not exist out of search results", () => {
    const head = teamProfileHead("nobody") as { meta: Array<Record<string, any>> };
    assert.deepEqual(head.meta[1], { name: "robots", content: "noindex" });
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
