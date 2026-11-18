import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  AESTHETICS_TESTIMONIALS,
  HOME_TESTIMONIALS,
  TESTIMONIALS_HEADING,
  TESTIMONIALS_INTRO,
  type Testimonial,
} from "./testimonials.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const squash = (text: string) => text.replace(/\s+/g, " ").trim();

/**
 * What the recorded live page shows under the heading: the intro line, then pairs of a title
 * and a comment. The live carousel repeats its entries and ends with a pager ("1", "2", ...),
 * so read up to the pager and keep the first of each.
 */
function liveSection(file: string) {
  const lines = read(`../../seo/live-text/${file}`)
    .split("\n")
    .map(squash)
    .filter(Boolean);
  const start = lines.indexOf(TESTIMONIALS_HEADING);
  assert.ok(start >= 0, `${file} has the "${TESTIMONIALS_HEADING}" heading`);
  const entries: Testimonial[] = [];
  for (let i = start + 2; i + 1 < lines.length && !/^\d+$/.test(lines[i]); i += 2) {
    if (!entries.some((e) => e.title === lines[i] && e.text === lines[i + 1])) {
      entries.push({ title: lines[i], text: lines[i + 1] });
    }
  }
  return { intro: lines[start + 1], entries };
}

describe("the testimonials match the live site", () => {
  it("shows the home page comments the live home page shows, in the same order", () => {
    const live = liveSection("home.txt");
    assert.equal(live.intro, TESTIMONIALS_INTRO);
    assert.deepEqual(
      HOME_TESTIMONIALS.map((t) => ({ title: squash(t.title), text: squash(t.text) })),
      live.entries,
    );
  });

  it("shows the aesthetics page comments the live aesthetics page shows, in the same order", () => {
    const live = liveSection("services--aesthetics.txt");
    assert.equal(live.intro, TESTIMONIALS_INTRO);
    assert.deepEqual(
      AESTHETICS_TESTIMONIALS.map((t) => ({ title: squash(t.title), text: squash(t.text) })),
      live.entries,
    );
  });

  it("has no names, ratings or star counts that the live comments do not carry", () => {
    for (const t of [...HOME_TESTIMONIALS, ...AESTHETICS_TESTIMONIALS]) {
      assert.deepEqual(Object.keys(t).sort(), ["text", "title"]);
    }
  });
});
