import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PETITION } from "./petition.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const squash = (text: string) => text.replace(/\s+/g, " ").trim();
const live = read("../../seo/live-text/petition.txt");
const liveLines = live.split("\n").map(squash).filter(Boolean);

/** Every string in the petition copy, with where it sits, except the ones the live page only has in its code. */
function copyStrings() {
  const { form, contact, video, cards, paragraphs, ...top } = PETITION;
  const { thanks: _thanks, failed: _failed, fieldLabels: signLabels, ...formText } = form;
  const { fieldLabels: contactLabels, ...contactText } = contact;
  // Left out because the recorded page text cannot show them: the success and failure messages
  // (they appear after a submit), the postcode placeholder, and the video's address.
  const { postcode: _postcode, ...shownSignLabels } = signLabels;
  const { youtubeId: _youtubeId, ...videoText } = video;
  return [
    ...Object.values(top),
    ...paragraphs,
    ...cards.flatMap((card) => [card.title, card.text]),
    ...Object.values(formText),
    ...Object.values(shownSignLabels),
    ...Object.values(videoText),
    ...Object.values(contactText),
    ...Object.values(contactLabels),
  ] as string[];
}

describe("the petition page matches the live site", () => {
  it("uses only words the recorded live page has, as whole lines", () => {
    for (const text of copyStrings()) {
      assert.ok(liveLines.includes(squash(text)), `not on the live page: "${text}"`);
    }
  });

  it("keeps the live page's order: heading, text, cards, sign form, video, contact form", () => {
    const at = (text: string) => liveLines.indexOf(squash(text));
    const order = [
      PETITION.title,
      PETITION.paragraphs[0],
      PETITION.cards[0].text,
      PETITION.form.eligibility,
      PETITION.video.heading,
      PETITION.contact.heading,
    ].map(at);
    assert.ok(order.every((index) => index >= 0));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
  });

  it("has no target, count or signer on it that the live page does not show", () => {
    const figures = copyStrings().join(" ").match(/\d[\d,.]*/g) ?? [];
    assert.deepEqual(figures, []);
  });

  it("does not keep the signers' names and dates in the recording", () => {
    assert.doesNotMatch(
      live,
      /^\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/m,
    );
    assert.match(live, /^Petition Signatures \(\d+\)$/m);
  });
});
