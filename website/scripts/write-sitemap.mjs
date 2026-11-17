#!/usr/bin/env node
/**
 * Writes public/sitemap.xml from the pages in src/lib/seo.ts, so the sitemap
 * lists every page and nothing else. src/lib/seo.test.ts fails when the file
 * is out of date: run `npm run seo:sitemap` after changing PAGES.
 */
import { writeFileSync } from "node:fs";
import { sitemapXml } from "../src/lib/seo.ts";

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), sitemapXml());
console.log("wrote public/sitemap.xml");
