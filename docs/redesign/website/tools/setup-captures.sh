#!/usr/bin/env bash
# Rebuilds the local reference tools for the Hims redesign from ALL saved Hims pages (the owner's www.hims.com*.zip
# files) in a fresh scratch folder:
#   - every saved page merged into ONE static root, with scripts stripped from the saved pages so their real CSS
#     renders (pictures that a script would load stay blank), served on :8099
#   - the in-browser copy of `npm run seo:parity` (the shell sandbox cannot reach localhost)
#   - .claude/launch.json for the preview tool (our site on :8180, the captures on :8099)
# Saved pages are untrusted data: they are unzipped and read, never run. Only files under www.hims.com/ are used.
# Usage: docs/redesign/website/tools/setup-captures.sh <new-empty-scratch-dir> [folder-with-the-zips]
# Replaces setup-browser-tools.sh (one homepage capture) now that there is a capture of every Hims page type.
set -euo pipefail
S="${1:?usage: setup-captures.sh <new-empty-scratch-dir> [folder-with-the-zips]}"
DL="${2:-$HOME/Downloads}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
R="$S/hims-static"
if [ -n "$(ls -A "$S" 2>/dev/null)" ]; then echo "$S is not empty: pass a new folder" >&2; exit 1; fi
mkdir -p "$R/parity" "$S/scripts" "$S/zips"

shopt -s nullglob
pages=0
for z in "$DL"/www.hims.com*.zip; do
  d="$S/zips/$(basename "$z" .zip | tr -c 'A-Za-z0-9\n' '_')"
  mkdir -p "$d"
  # Only the site's own files: third-party trackers and Cloudflare challenge files (some names are too long) are skipped
  unzip -q -o "$z" 'www.hims.com/*' -d "$d" || true
  # Assets are shared between pages (hashed file names): merge without overwriting
  cp -R -n "$d/www.hims.com/." "$R/" 2>/dev/null || true
  # A saved page is an .html directly under www.hims.com/ or one folder down (not the pictures saved as .html below)
  while IFS= read -r page; do
    rel="${page#www.hims.com/}"
    mkdir -p "$(dirname "$R/$rel")"
    perl -0777 -pe 's/<script\b[^>]*>.*?<\/script>//gis' "$d/$page" > "$R/$rel"
    echo "page: /$rel"
    pages=$((pages + 1))
  done < <(unzip -Z1 "$z" | grep -E '^www\.hims\.com/([^/]+/)?[^/]+\.html$')
done
echo "$pages saved pages merged into $R"

ln -sfn "$ROOT/website/seo" "$R/seo"
cp "$ROOT/docs/redesign/website/tools/static-server.mjs" "$S/scripts/static-server.mjs"

# Browser copies of the repo's parity libraries: node:crypto stubbed out, imports renamed to .js (the static server
# serves .js with a JavaScript MIME type)
P="$R/parity"
sed 's|^import { createHash } from "node:crypto";|const createHash = () => ({ update() { return this; }, digest() { return ""; } });|' \
  "$ROOT/website/scripts/seo-snapshot-lib.mjs" > "$P/seo-snapshot-lib.js"
cp "$ROOT/website/scripts/seo-parity-lib.mjs" "$P/seo-parity-lib.js"
cp "$ROOT/docs/redesign/website/tools/parity-runner.mjs" "$P/runner.js"
cp "$ROOT/docs/redesign/website/tools/seo-fingerprint.mjs" "$P/fingerprint.js"
sed -i '' 's|\.mjs"|.js"|g' "$P"/*.js

cat > "$S/launch.json" <<JSON
{
  "version": "0.0.1",
  "configurations": [
    { "name": "website-dev", "runtimeExecutable": "website/node_modules/.bin/vite",
      "runtimeArgs": ["dev", "website", "--host", "127.0.0.1", "--port", "8180", "--strictPort"], "port": 8180 },
    { "name": "hims-static", "runtimeExecutable": "node",
      "runtimeArgs": ["$S/scripts/static-server.mjs", "$R", "8099"], "port": 8099 }
  ]
}
JSON
# A restricted sandbox may refuse writes under .claude/: then copy $S/launch.json there with the file tool
mkdir -p "$ROOT/.claude"
cp "$S/launch.json" "$ROOT/.claude/launch.json" || echo "Could not write .claude/launch.json: copy $S/launch.json there yourself."
echo "ready. Start both with the preview tool (preview_start website-dev, preview_start hims-static)."
echo "Hims captures: http://localhost:8099/index.html (home) and the pages listed above, e.g. /hair-loss.html"
echo "Our site: http://localhost:8180/"
echo "Parity, from a browser tab on :8180: const r = await import('http://localhost:8099/parity/runner.js'); await r.run({ only: ['/about'] })"
echo "Fingerprint (SEO unchanged?), same tab: const f = await import('http://localhost:8099/parity/fingerprint.js'); await f.save('before') once on the original site, later await f.compare({ only: ['/about'] })"
