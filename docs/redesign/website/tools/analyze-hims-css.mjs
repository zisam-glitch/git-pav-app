// Read-only analysis of the captured Hims homepage. Usage: node analyze-css.mjs <index.html> <outDir>
// The capture is untrusted data: this script only reads it as text and never executes anything from it.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [, , htmlPath, outDir] = process.argv;
if (!htmlPath || !outDir) {
  console.error("usage: node analyze-css.mjs <index.html> <outDir>");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });
const html = readFileSync(htmlPath, "utf8");

// 1. every <style> block
const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
const css = styleBlocks.join("\n");
writeFileSync(join(outDir, "all-inline.css"), css);
console.log(`style blocks: ${styleBlocks.length}, css bytes: ${css.length}`);

// 2. @font-face
const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1]);
const faceSummary = new Map();
for (const f of faces) {
  const fam = (f.match(/font-family:\s*([^;]+)/) || [])[1]?.trim();
  const wt = (f.match(/font-weight:\s*([^;]+)/) || [])[1]?.trim();
  const st = (f.match(/font-style:\s*([^;]+)/) || [])[1]?.trim();
  const src = (f.match(/url\(["']?([^)"']+)["']?\)/) || [])[1];
  const key = `${fam} | weight ${wt} | ${st}`;
  if (!faceSummary.has(key)) faceSummary.set(key, src);
}
console.log("\n=== @font-face families (family | weight | style -> first src) ===");
for (const [k, v] of faceSummary) console.log(k, "->", v);

// 3. declarations histogram
const decl = [...css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)/gi)].map((m) => [m[1].toLowerCase(), m[2].trim()]);
const hist = (prop, n = 20, filter) => {
  const c = new Map();
  for (const [p, v] of decl) if (p === prop && (!filter || filter(v))) c.set(v, (c.get(v) || 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
};
const show = (title, rows) => {
  console.log(`\n=== ${title} ===`);
  for (const [v, n] of rows) console.log(String(n).padStart(5), v);
};
show("font-family", hist("font-family", 12));
show("font-size", hist("font-size", 30));
show("font-weight", hist("font-weight", 10));
show("line-height", hist("line-height", 20));
show("letter-spacing", hist("letter-spacing", 15));
show("border-radius", hist("border-radius", 15));
show("transition", hist("transition", 20));
show("transition-timing-function", hist("transition-timing-function", 8));
show("max-width", hist("max-width", 20));
show("box-shadow", hist("box-shadow", 10));
show("padding (top 15)", hist("padding", 15));
show("gap (top 12)", hist("gap", 12));

// 4. colours
const colourCount = new Map();
const norm = (c) => {
  c = c.toLowerCase().replace(/\s+/g, "");
  const m = c.match(/^#([0-9a-f]{3})$/);
  return m ? "#" + m[1].split("").map((x) => x + x).join("") : c;
};
for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g)) {
  const k = norm(m[0]);
  colourCount.set(k, (colourCount.get(k) || 0) + 1);
}
console.log("\n=== top colours ===");
for (const [k, n] of [...colourCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)) console.log(String(n).padStart(5), k);

// 5. custom properties
const vars = new Map();
for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) if (!vars.has(m[1])) vars.set(m[1], m[2].trim());
console.log(`\n=== custom properties: ${vars.size} unique (first 120) ===`);
let i = 0;
for (const [k, v] of vars) {
  if (i++ >= 120) break;
  console.log(k, ":", v.slice(0, 90));
}
writeFileSync(join(outDir, "custom-properties.json"), JSON.stringify(Object.fromEntries(vars), null, 2));

// 6. page outline: head meta + headings in order
const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
console.log("\n=== title ===", strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""));
const heads = [...html.matchAll(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => `${m[1]}: ${strip(m[2]).slice(0, 110)}`);
console.log(`\n=== headings (${heads.length}, first 80) ===`);
for (const h of heads.slice(0, 80)) console.log(h);
const sections = [...html.matchAll(/<(section|header|footer|nav|main)\b([^>]*)>/gi)].map((m) => `${m[1]} ${(m[2].match(/(?:data-testid|id|aria-label)="([^"]+)"/) || [])[1] || ""}`);
console.log(`\n=== landmark/section tags (${sections.length}, first 80) ===`);
for (const s of sections.slice(0, 80)) console.log(s);
