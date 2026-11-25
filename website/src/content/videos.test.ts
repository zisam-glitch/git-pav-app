// Run with `npm test`.
// The live site's videos are the owner's content: every YouTube address and video file on the new
// site must be one the live site has (recorded in videos.ts on 25 Nov 2026), and nothing else.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { PETITION } from "./petition.ts";
import {
  COSMETIC_PROCEDURE_VIDEOS,
  DENTURE_VIDEOS,
  embedUrl,
  GENERAL_PROCEDURE_VIDEOS,
  YOUTUBE,
} from "./videos.ts";

const srcDir = new URL("..", import.meta.url).pathname;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

const files = sourceFiles(srcDir).filter((file) => !file.endsWith("/content/videos.ts"));
const liveIds = new Set<string>(Object.values(YOUTUBE).map((video) => video.id));

describe("the live site's videos", () => {
  it("opens each YouTube video at the live embed address", () => {
    assert.equal(embedUrl(YOUTUBE.home), "https://www.youtube.com/embed/zHXljj727OE?si=Uz7mq8eE5tSAvpgy");
    assert.equal(embedUrl(YOUTUBE.whitening), "https://www.youtube.com/embed/k0VqOxTlDvA?si=-kv6-K41QTPH0sIf");
    assert.equal(embedUrl(YOUTUBE.cosmetic), "https://www.youtube.com/embed/hRfw79jW-to");
    assert.equal(embedUrl(YOUTUBE.oralHygiene), "https://www.youtube.com/embed/UOr3HN41R3o");
    assert.equal(embedUrl(YOUTUBE.generalCavities), "https://www.youtube.com/embed/SiV4IhqWM3Q?si=dz9Kh7A0R3Lxnr4Z");
    assert.equal(embedUrl(YOUTUBE.generalRootCanal), "https://www.youtube.com/embed/Bqczi3V3D3U?si=65sEV9Y9W0-ripsM");
    assert.equal(embedUrl(YOUTUBE.extraction), "https://www.youtube.com/embed/-HR0hgWCNmU?si=bbRTLEVdcX9f7QuQ");
    assert.equal(embedUrl(YOUTUBE.grillz), "https://www.youtube.com/embed/_oIlv59bTL4");
  });

  it("keeps the petition video the live page's", () => {
    assert.equal(PETITION.video.youtubeId, YOUTUBE.petition.id);
  });

  it("uses only live YouTube videos anywhere in the source", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(/(?:youtube(?:-nocookie)?\.com\/embed\/|img\.youtube\.com\/vi\/)([\w-]{11})/g)) {
        assert.ok(liveIds.has(match[1]), `${file} has a YouTube video the live site does not: ${match[1]}`);
      }
    }
  });

  it("has no video file in the source except through videos.ts", () => {
    for (const file of files) {
      assert.ok(!/\.mp4/.test(readFileSync(file, "utf8")), `${file} names a video file; add it to src/content/videos.ts`);
    }
  });

  it("copies the live players, captions and order exactly", () => {
    const cloudinary = (path: string) => `https://res.cloudinary.com/${path}`;
    assert.deepEqual(
      COSMETIC_PROCEDURE_VIDEOS.map((video) => video.src),
      [
        cloudinary("db1i46uiv/video/upload/v1717826205/utomp3.com_-_Mastering_Tooth_Extraction_Your_Ultimate_Guide_to_Painless_Dental_Care_Pav_Dental_360p_spk4qm.mp4"),
        cloudinary("dyc90cwdt/video/upload/v1778146751/Video_Conversion_Landscape_A_person_with_dark_hair_and_a_light_complexion_is_3rvLD1V3_poo6os.mp4"),
        cloudinary("db1i46uiv/video/upload/v1717826056/Bridging_Gaps__Understanding_3_Unit_Dental_Bridges_Procedure_with_Pav_Dental_gmwsvq.mp4"),
        cloudinary("db1i46uiv/video/upload/v1717826104/utomp3.com_-_Transform_Your_Smile_Everything_You_Need_to_Know_About_Teeth_Veneers_Pav_Dental_360p_ebhj0b.mp4"),
        cloudinary("db1i46uiv/video/upload/v1717826175/utomp3.com_-_Mastering_Root_Canal_Your_Complete_Guide_to_PainFree_Dental_Care_Pav_Dental_360p_f2rugb.mp4"),
      ],
    );
    // General dentistry has the same four Cloudinary clips, with the live server's gen.mp4 second.
    const [extraction, , bridges, veneers, rootCanal] = COSMETIC_PROCEDURE_VIDEOS.map((video) => video.src);
    assert.deepEqual(
      GENERAL_PROCEDURE_VIDEOS.map((video) => video.src),
      [extraction, "/video/gen.mp4", bridges, veneers, rootCanal],
    );
    assert.deepEqual(DENTURE_VIDEOS.map((video) => video.src), ["/video/dent2.mp4", "/video/dent.mp4"]);
    assert.deepEqual(
      [...COSMETIC_PROCEDURE_VIDEOS, ...GENERAL_PROCEDURE_VIDEOS].map((video) => video.label),
      [
        "Painless Dental Care | Pav Dental",
        "Visual or a crown vs a veneer",
        "Bridges Procedure with Pav Dental",
        "Teeth Veneers | Pav Dental",
        "Pain-Free Dental Care | Pav Dental",
        "Tooth Extraction | Pav Dental",
        "Tooth Cleaning with Pav Dental",
        "Dental Bridges Procedure with Pav Dental",
        "Teeth Veneers | Pav Dental",
        "Root Canal Treatment | Pav Dental",
      ],
    );
  });
});
