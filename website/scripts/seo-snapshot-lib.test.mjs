import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bareHost,
  internalPath,
  normalizePath,
  normalizeText,
  proxyFromEnv,
  shouldBlockRequest,
  sitemapLocs,
  slugForPath,
  textHash,
  wordCount,
} from "./seo-snapshot-lib.mjs";

const ORIGIN = "https://www.pavdental.com";

describe("internalPath", () => {
  it("treats www and the bare domain as one site", () => {
    assert.equal(internalPath("https://pavdental.com/about", ORIGIN), "/about");
    assert.equal(internalPath("http://www.pavdental.com/team", ORIGIN), "/team");
  });

  it("resolves relative links and drops the trailing slash, query and fragment", () => {
    assert.equal(internalPath("/services/whitening/", ORIGIN), "/services/whitening");
    assert.equal(internalPath("/blog/some-post?ref=home#top", ORIGIN), "/blog/some-post");
    assert.equal(internalPath("#contact", `${ORIGIN}/about`), "/about");
  });

  it("ignores other sites, non-web links and files", () => {
    assert.equal(internalPath("https://pavdental.setmore.com/", ORIGIN), null);
    assert.equal(internalPath("mailto:hello@pavdental.com", ORIGIN), null);
    assert.equal(internalPath("tel:+441234567890", ORIGIN), null);
    assert.equal(internalPath("/media/price-list.pdf", ORIGIN), null);
  });
});

describe("normalizePath", () => {
  it("keeps the root and collapses repeated slashes", () => {
    assert.equal(normalizePath("/"), "/");
    assert.equal(normalizePath(""), "/");
    assert.equal(normalizePath("//services//whitening//"), "/services/whitening");
    assert.equal(normalizePath("about"), "/about");
  });
});

describe("bareHost", () => {
  it("drops a leading www and lower-cases", () => {
    assert.equal(bareHost("WWW.PavDental.com"), "pavdental.com");
    assert.equal(bareHost("pavdental.setmore.com"), "pavdental.setmore.com");
  });
});

describe("slugForPath", () => {
  it("names files after paths", () => {
    assert.equal(slugForPath("/"), "home");
    assert.equal(slugForPath("/services/whitening"), "services--whitening");
    assert.equal(slugForPath("/blog/a post"), "blog--a_post");
  });
});

describe("normalizeText", () => {
  it("collapses spaces and squeezes blank lines", () => {
    assert.equal(normalizeText("  Hello\u00a0  world \r\n\r\n\r\n\n Next  line "), "Hello world\n\nNext line");
  });

  it("gives the same hash for text that differs only in spacing", () => {
    assert.equal(textHash("One  two\n\n\nthree"), textHash("One two\n\nthree "));
    assert.notEqual(textHash("One two"), textHash("One three"));
  });

  it("counts words, including ones with apostrophes and numbers", () => {
    assert.equal(wordCount("Open 24 hours, seven days — it’s true."), 7);
    assert.equal(wordCount(""), 0);
  });
});

describe("sitemapLocs", () => {
  it("reads <loc> values in order", () => {
    const xml =
      '<?xml version="1.0"?><urlset><url><loc>https://www.pavdental.com/</loc></url>' +
      "<url><loc> https://www.pavdental.com/about </loc></url></urlset>";
    assert.deepEqual(sitemapLocs(xml), ["https://www.pavdental.com/", "https://www.pavdental.com/about"]);
    assert.deepEqual(sitemapLocs(null), []);
  });
});

describe("shouldBlockRequest", () => {
  it("blocks analytics beacons and video embeds so a crawl is not counted as visits", () => {
    assert.equal(shouldBlockRequest("https://www.googletagmanager.com/gtag/js?id=G-1", "script"), true);
    assert.equal(shouldBlockRequest("https://region1.google-analytics.com/g/collect", "fetch"), true);
    assert.equal(shouldBlockRequest("https://www.youtube.com/embed/abc", "document"), true);
  });

  it("blocks images, video and fonts but keeps the page, scripts and styles", () => {
    assert.equal(shouldBlockRequest("https://res.cloudinary.com/x.png", "image"), true);
    assert.equal(shouldBlockRequest("https://www.pavdental.com/media/clinic.mp4", "media"), true);
    assert.equal(shouldBlockRequest("https://www.pavdental.com/static/js/main.js", "script"), false);
    assert.equal(shouldBlockRequest("https://www.pavdental.com/static/css/main.css", "stylesheet"), false);
    assert.equal(shouldBlockRequest("https://www.pavdental.com/", "document"), false);
  });
});

describe("proxyFromEnv", () => {
  it("returns nothing when no proxy is set", () => {
    assert.equal(proxyFromEnv({}), undefined);
  });

  it("splits credentials out of the proxy URL and passes the bypass list", () => {
    assert.deepEqual(proxyFromEnv({ HTTPS_PROXY: "http://user%40x:p%3Ass@127.0.0.1:8080", NO_PROXY: "localhost" }), {
      server: "http://127.0.0.1:8080",
      username: "user@x",
      password: "p:ss",
      bypass: "localhost",
    });
  });
});
