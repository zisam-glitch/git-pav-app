import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { LIVE_PAGES } from "./live-pages.ts";
import { TEAM_MEMBERS } from "./team-members.ts";

// The live site's documents and team photos, copied into public/ at the same
// paths (seo/live-files.json records each file's size and checksum).
interface Manifest {
  files: Array<{ path: string; bytes: number; sha256: string; contentType: string }>;
  missingOnLive: Array<{ path: string; title: string }>;
}
const manifest: Manifest = JSON.parse(readFileSync(new URL("../../seo/live-files.json", import.meta.url), "utf8"));
const publicDir = new URL("../../public", import.meta.url);
const onDisk = (path: string) => new URL(`../../public${path}`, import.meta.url);
const COPIED_FOLDERS = ["/policies", "/forms", "/posters", "/images/team"];

/** Where a link on the site points inside public/: percent-encoding undone, as a web server does. */
const pathOf = (href: string) => decodeURIComponent(href);

/** The first bytes each kind of file starts with. */
const SIGNATURES: Record<string, number[]> = {
  ".pdf": [0x25, 0x50, 0x44, 0x46, 0x2d],
  ".docx": [0x50, 0x4b, 0x03, 0x04],
  ".jpg": [0xff, 0xd8, 0xff],
  ".jpeg": [0xff, 0xd8, 0xff],
  ".png": [0x89, 0x50, 0x4e, 0x47],
};

function documentLinks(): string[] {
  return LIVE_PAGES["/practice-policy"].blocks.flatMap((block) =>
    block.kind === "documents" ? block.items.map((item) => item.href) : [],
  );
}

describe("the live site's files are in public/", () => {
  it("has every file in the manifest, unchanged", () => {
    assert.equal(manifest.files.length, 39);
    for (const file of manifest.files) {
      const url = onDisk(file.path);
      assert.ok(existsSync(url), `${file.path} is missing from public/`);
      const body = readFileSync(url);
      assert.equal(body.length, file.bytes, `${file.path}: size differs from the live copy`);
      assert.equal(createHash("sha256").update(body).digest("hex"), file.sha256, `${file.path}: contents differ from the live copy`);
    }
  });

  it("holds only files the manifest lists, in the folders that were copied", () => {
    const listed = new Set(manifest.files.map((file) => file.path));
    for (const folder of COPIED_FOLDERS) {
      const names = readdirSync(new URL(`${publicDir.href}${folder}`), { recursive: true, encoding: "utf8" });
      for (const name of names) {
        const path = `${folder}/${name}`;
        if (statSync(onDisk(path)).isFile()) assert.ok(listed.has(path), `${path} is in public/ but not in the manifest`);
      }
    }
  });

  it("starts each file with the bytes its extension promises", () => {
    for (const file of manifest.files) {
      const extension = file.path.slice(file.path.lastIndexOf(".")).toLowerCase();
      const signature = SIGNATURES[extension];
      assert.ok(signature, `${file.path}: no signature known for ${extension}`);
      const head = readFileSync(onDisk(file.path)).subarray(0, signature.length);
      assert.deepEqual([...head], signature, `${file.path} does not start like a ${extension} file`);
    }
  });

  it("links every document on the practice policy page to a file that exists", () => {
    const links = documentLinks();
    assert.equal(links.length, 31);
    const listed = new Set(manifest.files.map((file) => file.path));
    for (const href of links) {
      assert.ok(listed.has(pathOf(href)), `${href} is linked but is not a copied file`);
      assert.ok(existsSync(onDisk(pathOf(href))), `${href} is linked but missing from public/`);
    }
  });

  it("does not link the documents the live site never served", () => {
    assert.equal(manifest.missingOnLive.length, 5);
    const linked = new Set(documentLinks().map(pathOf));
    for (const missing of manifest.missingOnLive) {
      assert.ok(!linked.has(missing.path), `${missing.path} is linked, but the live site has no such file`);
      assert.ok(!existsSync(onDisk(missing.path)), `${missing.path} should not be in public/`);
    }
  });

  it("has a photo for every team member", () => {
    for (const member of TEAM_MEMBERS) {
      assert.ok(existsSync(onDisk(member.photo.src)), `${member.photo.src} is missing from public/`);
    }
  });
});
