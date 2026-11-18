import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  comparePage,
  coverage,
  decodeEntities,
  expectedCanonical,
  liveUnits,
  normalizeForMatch,
  parsePage,
  ratchetProblems,
  sharedUnits,
} from "./seo-parity-lib.mjs";

const HTML = `<!DOCTYPE html><html lang="en"><head>
<meta charSet="utf-8"/><title>Our team &amp; their work | Pav Dental</title>
<meta name="description" content="Meet the team &#x27;behind&#x27; Pav Dental"/>
<meta name="robots" content="noindex"/>
<link rel="canonical" href="https://www.pavdental.com/team"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Dentist","address":{"@type":"PostalAddress"}}</script>
<style>.x{color:red}</style></head>
<body><header><nav><a href="/">Home</a><a href="/team/">Team</a></nav></header>
<main><h1>Meet the team</h1><h2>Clinicians</h2>
<p>Dr Example is <b>our</b> principal dentist.<br/>Call <a href="tel:08001938786">0800 1938 786</a> or <a href="https://pavdental.com/blog?x=1#top">read the blog</a>.</p>
<a href="https://elsewhere.example/page">Elsewhere</a><a href="/policies/CCTV%20Policy.pdf">CCTV</a>
<img src="/a.jpg" alt=""/><img src="/b.jpg" alt="A dentist at work"/><img src="/c.jpg"/>
<script>window.secret = "not text"</script><svg><title>icon</title></svg></main></body></html>`;

describe("decodeEntities", () => {
  it("decodes named, decimal and hexadecimal entities, and leaves unknown ones", () => {
    assert.equal(decodeEntities("A &amp; B &#x27;c&#39; &#8217; &pound;5 &madeup;"), "A & B 'c' \u2019 \u00a35 &madeup;");
  });
});

describe("parsePage", () => {
  const page = parsePage(HTML);

  it("reads the head tags once each, with entities decoded", () => {
    assert.deepEqual(page.titles, ["Our team & their work | Pav Dental"]);
    assert.deepEqual(page.descriptions, ["Meet the team 'behind' Pav Dental"]);
    assert.deepEqual(page.canonicals, ["https://www.pavdental.com/team"]);
    assert.deepEqual(page.robots, ["noindex"]);
  });

  it("reads headings and the structured data types, nested ones included", () => {
    assert.deepEqual(page.h1, ["Meet the team"]);
    assert.deepEqual(page.h2, ["Clinicians"]);
    assert.deepEqual(page.jsonLdTypes, ["Dentist", "PostalAddress"]);
  });

  it("keeps internal page links once, without slash, query or fragment, and drops the rest", () => {
    assert.deepEqual(page.internalLinks, ["/", "/blog", "/team"]);
  });

  it("counts images and the ones without alt text", () => {
    assert.deepEqual(page.images, { total: 3, missingAlt: 2 });
  });

  it("gives the text a person reads: no tags, scripts, styles or icon titles; block tags make new lines", () => {
    assert.match(page.text, /Meet the team\n+Clinicians\n+Dr Example is our principal dentist\.\nCall 0800 1938 786 or read the blog\./);
    assert.doesNotMatch(page.text, /secret|color:red|icon|their work/);
  });
});

describe("parsePage text", () => {
  it("leaves no tag fragment in the text, even when tags are nested inside a tag", () => {
    const page = parsePage("<html><body><p>Before <scr<script>ipt>alert(1)</scr</script>ipt> after</p><p>unfinished <a href=");
    assert.doesNotMatch(page.text, /</);
    assert.match(page.text, /^Before\s+after/);
  });

  it("keeps an escaped angle bracket as the text it is", () => {
    assert.equal(parsePage("<body><p>&lt;b&gt; bold</p></body>").text, "<b> bold");
  });
});

describe("normalizeForMatch", () => {
  it("ignores typography: quotes, dashes, spaces and capitals", () => {
    assert.equal(normalizeForMatch("It\u2019s  a \u201cNew\u201d\u00a0day \u2013 really\u2026"), `it's a "new" day - really...`);
  });
});

describe("liveUnits", () => {
  it("keeps lines as units, splits long ones into sentences, and drops short or repeated ones", () => {
    const long = `${"First sentence of a long paragraph goes here. ".repeat(6)}Last one stands alone.`;
    const units = liveUnits(["Home", "Book now", "We offer same day emergency care.", "We offer same day emergency care.", long].join("\n"));
    assert.ok(units.includes("we offer same day emergency care."));
    assert.ok(units.includes("last one stands alone."));
    assert.ok(units.includes("first sentence of a long paragraph goes here."));
    assert.equal(units.filter((unit) => unit === "we offer same day emergency care.").length, 1);
    assert.ok(!units.includes("home") && !units.includes("book now"));
  });
});

describe("coverage", () => {
  const units = ["one two three four", "five six seven eight", "nine ten eleven twelve", "shared footer text here"];
  const shared = sharedUnits(new Map([["/a", units], ["/b", units], ["/c", units.slice(3)]]), 3);

  it("treats a unit on enough pages as shared", () => {
    assert.deepEqual([...shared], ["shared footer text here"]);
  });

  it("counts the page's own units found in the page, ignoring shared ones and typography", () => {
    const cover = coverage(units, "One two three four.\nFive\u00a0six seven eight\nshared footer text here", shared);
    assert.equal(cover.specificTotal, 3);
    assert.equal(cover.specificFound, 2);
    assert.deepEqual(cover.missing, ["nine ten eleven twelve"]);
    assert.equal(Math.round(cover.ratio * 100), 67);
    assert.equal(cover.found, 3);
  });

  it("calls a page with nothing of its own complete", () => {
    assert.equal(coverage([], "anything").ratio, 1);
  });
});

describe("comparePage", () => {
  const live = {
    title: "Our team & their work | Pav Dental",
    description: "Meet the team 'behind' Pav Dental",
    robots: null,
    h1: ["Meet the team"],
    h2: ["Clinicians"],
    jsonLd: [{ "@type": "Dentist" }],
    internalLinks: ["/", "/blog", "/pricing"],
  };
  const page = parsePage(HTML.replace('<meta name="robots" content="noindex"/>', ""));
  const run = (overrides = {}) => comparePage({ path: "/team", live, page, status: 200, ...overrides });
  const codes = (issues, level) => issues.filter((issue) => issue.level === level).map((issue) => issue.code);

  it("finds nothing to fail on a page that matches, and notes what is missing", () => {
    const issues = run();
    assert.deepEqual(codes(issues, "fail"), []);
    assert.deepEqual(codes(issues, "note"), ["links", "alt"]);
  });

  it("fails on a changed title or description, a second tag, a wrong canonical and noindex", () => {
    assert.deepEqual(codes(run({ live: { ...live, title: "Another title" } }), "fail"), ["title"]);
    assert.deepEqual(codes(run({ live: { ...live, description: "Another one" } }), "fail"), ["description"]);
    const doubled = { ...page, titles: ["a", "b"], canonicals: ["https://www.pavdental.com/team/"] };
    assert.deepEqual(codes(run({ page: doubled }), "fail"), ["title-count", "title", "canonical"]);
    assert.deepEqual(codes(run({ page: parsePage(HTML) }), "fail"), ["robots"]);
  });

  it("accepts any title when the live page had none, but not an empty one", () => {
    assert.deepEqual(codes(run({ live: { ...live, title: null } }), "fail"), []);
    assert.deepEqual(codes(run({ live: { ...live, title: null }, page: { ...page, titles: [""] } }), "fail"), ["title"]);
  });

  it("fails on a status other than 200, unless the exception approves it", () => {
    assert.deepEqual(codes(run({ status: 404 }), "fail"), ["status"]);
    const missing = run({ status: 404, exception: { missing: true, reason: "waits for the owner" } });
    assert.deepEqual(missing, [{ level: "approved", code: "missing", message: "waits for the owner" }]);
    const redirect = run({ status: 301, location: "/privacy-policy", exception: { redirect: "/privacy-policy", reason: "x" } });
    assert.deepEqual(codes(redirect, "approved"), ["redirect"]);
    assert.deepEqual(codes(run({ status: 302, location: "/elsewhere", exception: { redirect: "/privacy-policy" } }), "fail"), ["redirect"]);
  });

  it("notes low coverage, and fails it only when a minimum is set", () => {
    const cover = { ratio: 0.5, specificFound: 5, specificTotal: 10, missing: [] };
    assert.deepEqual(codes(run({ cover }), "note").includes("coverage"), true);
    assert.deepEqual(codes(run({ cover }), "fail"), []);
    assert.deepEqual(codes(run({ cover, minCoverage: 0.95 }), "fail"), ["coverage"]);
  });

  it("does not note low coverage on a page whose exception sets its own minimum, until it falls below it", () => {
    const cover = { ratio: 0.2, specificFound: 2, specificTotal: 10, missing: [] };
    const exception = { minCoverage: 0, reason: "keeps the reviewed text" };
    assert.equal(codes(run({ cover, exception, minCoverage: 0 }), "note").includes("coverage"), false);
    assert.deepEqual(codes(run({ cover, exception: { minCoverage: 0.5 }, minCoverage: 0.5 }), "fail"), ["coverage"]);
  });

  it("expects the canonical on www, with a trailing slash only for the home page", () => {
    assert.equal(expectedCanonical("/"), "https://www.pavdental.com/");
    assert.equal(expectedCanonical("/team"), "https://www.pavdental.com/team");
  });
});

describe("ratchetProblems", () => {
  const recorded = { coverage: 0.8, fails: ["h1"] };
  it("allows a page to stay level or improve", () => {
    assert.deepEqual(ratchetProblems("/a", { coverage: 0.8, fails: ["h1"] }, recorded), []);
    assert.deepEqual(ratchetProblems("/a", { coverage: 0.9, fails: [] }, recorded), []);
    assert.deepEqual(ratchetProblems("/a", { coverage: 0.5, fails: [] }, undefined), []);
  });

  it("flags a fall in coverage and a failure it did not have", () => {
    assert.deepEqual(ratchetProblems("/a", { coverage: 0.7, fails: ["h1", "title"] }, recorded), [
      "/a: coverage fell from 80% to 70%",
      '/a: new failure "title"',
    ]);
  });
});
