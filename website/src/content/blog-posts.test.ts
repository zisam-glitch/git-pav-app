import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { PAGES } from "../lib/seo.ts";
import { BLOG_POSTS, SNAPSHOT_POSTS, findBlogPost } from "./blog-posts.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const baseline = JSON.parse(read("../../seo/live-baseline.json"));
const livePages: Array<{ path: string; h1: string[]; internalLinks: string[] }> = baseline.pages;
const livePostPaths = livePages.filter((page) => page.path.startsWith("/blog/")).map((page) => page.path);

/** Lower-case and one line, so spacing and casing do not matter. */
const flat = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();
const wordsOf = (text: string) => new Set(flat(text).match(/[\p{L}\p{N}’'-]+/gu) ?? []);
const liveText = (slug: string) => read(`../../seo/live-text/blog--${slug}.txt`);

type Block = (typeof BLOG_POSTS)[number]["blocks"][number];
const textOf = (block: Block): string[] => {
  if (block.kind === "heading" || block.kind === "paragraph") return [block.text];
  if (block.kind === "list") return block.items.map((item) => (typeof item === "string" ? item : item.text));
  if (block.kind === "table") return block.rows.flat();
  return [];
};

// The recorded live pages (seo/) cover the six posts the live blog page opens with; the other posts
// are behind its "Load More" button and come from the live Contentful blog, so only the six are
// checked word for word against the recordings.
describe("the blog matches the live site", () => {
  it("has every recorded live post, then the rest of the live Contentful blog (33 posts in all)", () => {
    assert.deepEqual(SNAPSHOT_POSTS.map((post) => `/blog/${post.slug}`).sort(), [...livePostPaths].sort());
    assert.deepEqual(BLOG_POSTS.slice(0, SNAPSHOT_POSTS.length), SNAPSHOT_POSTS);
    assert.equal(BLOG_POSTS.length, 33);
    assert.equal(new Set(BLOG_POSTS.map((post) => post.slug)).size, 33);
  });

  it("lists the posts in the order of the live blog page, newest first", () => {
    const live = JSON.parse(read("../../seo/live-content/blog.json"));
    const order = live.blocks
      .filter((block: { tag: string; text?: string }) => block.tag === "a" && block.text === "Read More")
      .map((block: { href: string }) => block.href.split("/blog/")[1]);
    assert.deepEqual(SNAPSHOT_POSTS.map((post) => post.slug), order);
    const dates = BLOG_POSTS.map((post) => post.date);
    assert.deepEqual([...dates].sort().reverse(), dates);
  });

  it("gives each post the live heading and a date that matches its label", () => {
    for (const post of BLOG_POSTS) {
      const live = livePages.find((page) => page.path === `/blog/${post.slug}`);
      if (live) assert.equal(live.h1[0], post.title);
      else assert.ok(post.title.length > 10, post.slug);
      const shown = new Date(`${post.dateLabel} 12:00 UTC`);
      assert.equal(shown.toISOString().slice(0, 10), post.date, post.slug);
    }
  });

  it("has a title and description in the SEO data, and a self-hosted cover image, for every post", () => {
    for (const post of BLOG_POSTS) {
      const seo = PAGES[`/blog/${post.slug}` as keyof typeof PAGES];
      assert.ok(seo.title.length > 10 && seo.description.length > 50, post.slug);
      assert.match(post.image.src, /^\/images\/blog\/.+\.jpg$/);
      const fileUrl = new URL(`../../public${post.image.src}`, import.meta.url);
      assert.ok(existsSync(fileUrl), `${post.image.src} is missing from public/`);
      const head = [...readFileSync(fileUrl).subarray(0, 3)];
      assert.deepEqual(head, [0xff, 0xd8, 0xff], `${post.image.src} is not a valid JPEG`);
      assert.ok(post.image.alt.length > 10 && !post.image.alt.includes("ctfassets"), post.slug);
    }
  });

  it("uses the live card text as each excerpt, which is the start of the post", () => {
    for (const post of BLOG_POSTS) {
      const first = post.blocks.find((block) => block.kind === "paragraph");
      assert.ok(first && first.kind === "paragraph");
      assert.ok(flat(first.text).startsWith(flat(post.excerpt.replace(/\s*\.{3}$/, ""))), post.slug);
    }
  });

  it("only uses words that are on the live page", () => {
    for (const post of SNAPSHOT_POSTS) {
      const live = flat(liveText(post.slug));
      for (const block of post.blocks) {
        for (const text of textOf(block)) assert.ok(live.includes(flat(text)), `${post.slug}: not on the live page: ${text.slice(0, 80)}`);
      }
    }
  });

  it("ports every word of each recorded live article", () => {
    for (const post of SNAPSHOT_POSTS) {
      const live = liveText(post.slug);
      const start = live.indexOf(post.dateLabel);
      const end = live.indexOf("Previous Post");
      assert.ok(start > 0 && end > start, `${post.slug}: could not find the article in the live text`);
      const ported = wordsOf(post.blocks.flatMap(textOf).join(" "));
      const missing = [...wordsOf(live.slice(start + post.dateLabel.length, end))].filter((word) => !ported.has(word));
      assert.deepEqual(missing, [], `${post.slug}: live words not ported`);
    }
  });

  it("keeps the links inside paragraphs, and they are links the live page had", () => {
    let linked = 0;
    for (const post of SNAPSHOT_POSTS) {
      const live = livePages.find((page) => page.path === `/blog/${post.slug}`);
      for (const block of post.blocks) {
        const links =
          block.kind === "paragraph"
            ? (block.links ?? [])
            : block.kind === "list"
              ? block.items.flatMap((item) => (typeof item === "string" ? [] : (item.links ?? [])))
              : [];
        for (const link of links) {
          linked += 1;
          assert.ok(live?.internalLinks.includes(link.href), `${post.slug}: ${link.href} is not linked on the live page`);
          assert.ok(textOf(block).some((text) => text.includes(link.text)), `${post.slug}: "${link.text}" is not in its text`);
        }
      }
    }
    assert.equal(linked, 8);
  });

  it("links the other posts' words only to this site or to https pages", () => {
    for (const post of BLOG_POSTS.slice(SNAPSHOT_POSTS.length)) {
      for (const block of post.blocks) {
        const links =
          block.kind === "paragraph"
            ? (block.links ?? [])
            : block.kind === "list"
              ? block.items.flatMap((item) => (typeof item === "string" ? [] : (item.links ?? [])))
              : [];
        for (const link of links) {
          assert.match(link.href, /^(\/|https:\/\/|mailto:|tel:)/, `${post.slug}: ${link.href}`);
          assert.ok(textOf(block).some((text) => text.includes(link.text)), `${post.slug}: "${link.text}" is not in its text`);
        }
      }
    }
  });

  it("gives every post a body with text in it", () => {
    for (const post of BLOG_POSTS) {
      assert.ok(post.blocks.length > 3, post.slug);
      assert.equal(post.blocks.some((block) => block.kind === "paragraph"), true, post.slug);
    }
  });

  it("shows tables with a header row and rows of equal width", () => {
    const tables = SNAPSHOT_POSTS.flatMap((post) => post.blocks).filter((block) => block.kind === "table");
    assert.equal(tables.length, 3);
    for (const table of BLOG_POSTS.flatMap((post) => post.blocks).filter((block) => block.kind === "table")) {
      assert.ok(table.kind === "table" && table.header);
      assert.equal(new Set(table.rows.map((row) => row.length)).size, 1);
    }
  });

  it("looks a post up by slug", () => {
    assert.equal(findBlogPost(BLOG_POSTS[0].slug), BLOG_POSTS[0]);
    assert.equal(findBlogPost("nothing-here"), undefined);
  });
});
