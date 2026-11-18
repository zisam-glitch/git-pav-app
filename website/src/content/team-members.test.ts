import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAGES } from "../lib/seo.ts";
import { findTeamMember, TEAM_MEMBERS } from "./team-members.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const baseline = JSON.parse(read("../../seo/live-baseline.json"));
const pages: Array<{ path: string; h1: string[]; textFile: string | null }> = baseline.pages;
const liveTeamPaths = pages.filter((p) => p.path.startsWith("/team/")).map((p) => p.path);

/** Lower-case, one line, without invisible characters, so casing (the live page uppercases headings) and spacing do not matter. */
const flat = (text: string) =>
  text
    .replace(/\u2060|\u200b|\u200c|\u200d|\ufeff/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** What the live site shows on a profile page (the recorded visible text), flattened. */
const liveText = (slug: string) => flat(read(`../../seo/live-text/team--${slug}.txt`));

/** Added from the owner's records, not on the live page (decision V-02). */
const ADDED_GDC = new Set(["dr-cosimo-meucci"]);

function textsOf(member: (typeof TEAM_MEMBERS)[number]): string[] {
  const texts = [member.name, member.role, ...member.summary];
  if (member.gdc && !ADDED_GDC.has(member.slug)) texts.push(`GDC: ${member.gdc}`);
  for (const value of [member.languages, member.availability, member.contact]) if (value) texts.push(value);
  for (const block of member.blocks) {
    if (block.kind === "heading" || block.kind === "paragraph" || block.kind === "quote") texts.push(block.text);
    if (block.kind === "list") texts.push(...block.items.map((item) => (typeof item === "string" ? item : item.text)));
  }
  return texts;
}

describe("the team matches the live site", () => {
  it("has a profile for every live /team/<name> page, and none else", () => {
    assert.deepEqual(
      TEAM_MEMBERS.map((member) => `/team/${member.slug}`).sort(),
      [...liveTeamPaths].sort(),
    );
  });

  it("lists people in the order of the live team page", () => {
    const live = JSON.parse(read("../../seo/live-content/team.json"));
    const order = live.blocks
      .filter((block: { tag: string; href?: string }) => block.tag === "a" && block.href?.includes("/team/"))
      .map((block: { href: string }) => block.href.split("/team/")[1]);
    assert.deepEqual(TEAM_MEMBERS.map((member) => member.slug), order);
  });

  it("names each person the way the live title and heading do", () => {
    for (const member of TEAM_MEMBERS) {
      assert.equal(PAGES[`/team/${member.slug}` as keyof typeof PAGES].title, `${member.name} - ${member.role} | Pav Dental Team`);
      const live = pages.find((p) => p.path === `/team/${member.slug}`);
      assert.deepEqual(live?.h1, [member.name]);
    }
  });

  it("only uses words that are on the live page, apart from the GDC number added from the owner's records", () => {
    for (const member of TEAM_MEMBERS) {
      const live = liveText(member.slug);
      for (const text of textsOf(member)) {
        assert.ok(live.includes(flat(text)), `${member.slug}: not on the live page: ${text.slice(0, 80)}`);
      }
    }
  });

  it("covers the live page's text: each live list item and paragraph is ported", () => {
    // The ported sections and the live page agree in size: nothing dropped by the port.
    for (const member of TEAM_MEMBERS) {
      const ported = flat(textsOf(member).join(" "));
      const words = (text: string) => new Set(text.match(/[\p{L}\p{N}’'-]+/gu) ?? []);
      const portedWords = words(ported);
      const liveWords = [...words(liveText(member.slug))];
      // The live page also has the site header and footer, which are not ported.
      const body = flat(read(`../../seo/live-text/team--${member.slug}.txt`).split("Back to Team")[0]);
      const missing = [...words(body)].filter((word) => !portedWords.has(word) && !/^\d{2}$/.test(word));
      const allowed = new Set(["book", "now", "home", "about", "services", "pricing", "team", "shop", "blog", "contact", "us", "petition", "vacancies"]);
      assert.deepEqual(
        missing.filter((word) => !allowed.has(word)),
        [],
        `${member.slug}: words on the live page that were not ported (${liveWords.length} live words)`,
      );
    }
  });

  it("gives the clinicians their GDC numbers", () => {
    assert.equal(findTeamMember("dr-hassan-bhojani")?.gdc, "262970");
    assert.equal(findTeamMember("dr-cosimo-meucci")?.gdc, "280128");
    assert.equal(TEAM_MEMBERS.filter((member) => member.gdc).length, 2);
  });

  it("points every photo at the live site's path", () => {
    for (const member of TEAM_MEMBERS) {
      assert.match(member.photo.src, /^\/images\/team\/\d\.(jpg|jpeg)$/);
      assert.equal(member.photo.alt, member.name);
    }
  });

  it("looks a person up by slug", () => {
    assert.equal(findTeamMember("waleed-javed")?.role, "Practice Manager");
    assert.equal(findTeamMember("nobody"), undefined);
  });
});
