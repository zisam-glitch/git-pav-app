import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKING_URL } from "../lib/enquiry.ts";

/**
 * On the live site every "Book" button goes to the practice's Setmore page. This site had its
 * own appointment request form and buttons that scrolled to enquiry forms or opened /contact-us;
 * they are gone. If a test here fails, point the link at BOOKING_URL (from "@/lib/enquiry").
 */
const SRC = fileURLToPath(new URL("..", import.meta.url));
const baseline = JSON.parse(
  readFileSync(new URL("../../seo/live-baseline.json", import.meta.url), "utf8"),
);

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.name.endsWith(".tsx") ? [path] : [];
  });
}

// An opening tag may hold an arrow function (onClick={() => ...}), whose ">" is not the tag's end.
const ANCHOR = /<a\b((?:=>|[^>])*?)>([\s\S]*?)<\/a>/g;
const BOOK_BUTTON = /<BookButton\b((?:=>|[^>])*?)(?:\/>|>([\s\S]*?)<\/BookButton>)/g;
const BOOKING_WORDS = /\b(book|booking|appointment)\b/i;

/** The words a person reads inside a link: tags, comments and expressions removed. */
function visibleText(inner: string) {
  return inner
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^{}]*\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bookingLinks() {
  const found: Array<{ where: string; text: string; attrs: string }> = [];
  for (const file of tsxFiles(SRC)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(ANCHOR)) {
      const text = visibleText(match[2]);
      if (!BOOKING_WORDS.test(text)) continue;
      const line = source.slice(0, match.index).split("\n").length;
      found.push({ where: `${relative(SRC, file)}:${line}`, text, attrs: match[1] });
    }
    for (const match of source.matchAll(BOOK_BUTTON)) {
      const text = visibleText(match[2] ?? "Book now");
      const line = source.slice(0, match.index).split("\n").length;
      found.push({ where: `${relative(SRC, file)}:${line}`, text, attrs: "href={BOOKING_URL}" });
    }
  }
  return found;
}

describe("booking goes to Setmore, as on the live site", () => {
  it("uses the address that the live site's Book buttons use", () => {
    assert.equal(BOOKING_URL, "https://pavdental.setmore.com/");
    const home = baseline.pages.find((page: { path: string }) => page.path === "/");
    assert.ok(home.externalLinks.includes(BOOKING_URL));
    const pagesWithIt = baseline.pages.filter((page: { externalLinks?: string[] }) =>
      page.externalLinks?.includes(BOOKING_URL),
    );
    assert.ok(pagesWithIt.length >= 40, `only ${pagesWithIt.length} live pages link to it`);
    const buttonLink = readFileSync(join(SRC, "components", "hims", "button-link.tsx"), "utf8");
    assert.match(buttonLink, /export function BookButton[\s\S]*?href=\{BOOKING_URL\}/);
  });

  it("points every link about booking or appointments at it", () => {
    const links = bookingLinks();
    assert.ok(links.length >= 40, `the scan found only ${links.length} booking links`);
    const wrong = links.filter((link) => !link.attrs.includes("href={BOOKING_URL}"));
    assert.deepEqual(
      wrong.map((link) => `${link.where} "${link.text}"`),
      [],
    );
  });

  it("has no link to the old /booking form", () => {
    for (const file of tsxFiles(SRC)) {
      assert.doesNotMatch(
        readFileSync(file, "utf8"),
        /href=["']\/booking["']/,
        relative(SRC, file),
      );
    }
  });

  it("has no request form of its own, and /booking redirects to Setmore", () => {
    assert.equal(existsSync(join(SRC, "components", "booking")), false);
    const route = readFileSync(join(SRC, "routes", "booking.tsx"), "utf8");
    assert.match(route, /throw redirect\(\{ href: BOOKING_URL/);
  });
});
