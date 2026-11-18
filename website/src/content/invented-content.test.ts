import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The live site (www.pavdental.com) is the only source of content for this site (owner
 * decision, 18 Nov 2026). This site once showed things the practice has never published: a
 * dentist who does not exist, patient reviews, star ratings, a petition counter with made-up
 * signers. They were removed in one pass, and this test keeps them out. If a test here fails,
 * the answer is to remove the content, not to loosen the test. If the practice really does
 * publish something on this list, it will be on the live site: record it in `seo/live-text/`
 * first, then change the test.
 */
const SRC = fileURLToPath(new URL("..", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    const isSource = /\.(ts|tsx)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name);
    return isSource && entry.name !== "routeTree.gen.ts" ? [path] : [];
  });
}

const BANNED: Array<{ pattern: RegExp; why: string }> = [
  { pattern: /hussain/i, why: "a dentist the practice does not have (its principal dentist is Dr Hassan Bhojani)" },
  { pattern: /aggregateRating|ratingValue/i, why: "star-rating markup for ratings that do not exist" },
  { pattern: /reviewsCount|reviews_count|reviewCount/, why: "review counts" },
  { pattern: /<Star\b/, why: "a star-rating row" },
  { pattern: /\(\s*1,?200\+/, why: "a made-up number of reviews" },
  { pattern: /verified (emergency )?patient/i, why: "testimonials labelled as verified patients" },
  { pattern: /Real Patient Experiences|Genuine testimonials/i, why: "testimonial headings for comments the live site does not have" },
  { pattern: /Highest Rated/, why: "a sort by ratings that do not exist" },
  { pattern: /SMILE10/, why: "a promo code written into the page" },
  { pattern: /PETITION_GOAL|CURRENT_SIGNATURES_BASE|INITIAL_SIGNATURES/, why: "petition figures and signers made up in code" },
  { pattern: /BBC Look North|ITV News/, why: "a news report the live petition page does not have" },
];

describe("content the live site does not have stays out", () => {
  it("has none of the invented people, reviews, ratings or petition figures in src/", () => {
    const found: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const text = readFileSync(file, "utf8");
      for (const { pattern, why } of BANNED) {
        if (pattern.test(text)) found.push(`${relative(SRC, file)}: ${why}`);
      }
    }
    assert.deepEqual(found, []);
  });

  it("scans the source tree, so an empty result means something", () => {
    const files = sourceFiles(SRC).map((file) => relative(SRC, file));
    assert.ok(files.length > 100, `only ${files.length} files scanned`);
    assert.ok(files.includes(join("content", "testimonials.ts")));
  });
});
