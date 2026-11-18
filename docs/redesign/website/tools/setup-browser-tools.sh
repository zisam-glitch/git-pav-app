#!/usr/bin/env bash
# Rebuilds the local review tools for the Hims redesign in a fresh scratch folder:
#   - the Hims homepage capture with scripts stripped (so its real CSS renders), served on :8099
#   - the in-browser copy of `npm run seo:parity` (the shell sandbox cannot reach localhost)
#   - .claude/launch.json for the preview tool (our site on :8180, the capture on :8099)
# Usage: docs/redesign/website/tools/setup-browser-tools.sh <new-empty-scratch-dir> [path/to/www.hims.com.zip]
set -euo pipefail
S="${1:?usage: setup-browser-tools.sh <new-empty-scratch-dir> [zip]}"
ZIP="${2:-$HOME/Downloads/www.hims.com.zip}"
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"

mkdir -p "$S/hims-zip" "$S/hims-static/parity" "$S/scripts"
unzip -q "$ZIP" -d "$S/hims-zip"
perl -0777 -pe 's/<script\b[^>]*>.*?<\/script>//gis' "$S/hims-zip/www.hims.com/index.html" > "$S/hims-static/index.html"
ln -sfn "$S/hims-zip/www.hims.com/css" "$S/hims-static/css"
ln -sfn "$S/hims-zip/www.hims.com/forhims" "$S/hims-static/forhims"
ln -sfn "$ROOT/website/seo" "$S/hims-static/seo"
cp "$ROOT/docs/redesign/website/tools/static-server.mjs" "$S/scripts/static-server.mjs"

# Browser copies of the repo's parity libraries: node:crypto stubbed out, imports renamed to .js (the static server
# serves .js with a JavaScript MIME type)
P="$S/hims-static/parity"
sed 's|^import { createHash } from "node:crypto";|const createHash = () => ({ update() { return this; }, digest() { return ""; } });|' \
  "$ROOT/website/scripts/seo-snapshot-lib.mjs" > "$P/seo-snapshot-lib.js"
cp "$ROOT/website/scripts/seo-parity-lib.mjs" "$P/seo-parity-lib.js"
cp "$ROOT/docs/redesign/website/tools/parity-runner.mjs" "$P/runner.js"
sed -i '' 's|\.mjs"|.js"|g' "$P"/*.js

mkdir -p "$ROOT/.claude"
cat > "$ROOT/.claude/launch.json" <<JSON
{
  "version": "0.0.1",
  "configurations": [
    { "name": "website-dev", "runtimeExecutable": "website/node_modules/.bin/vite",
      "runtimeArgs": ["dev", "website", "--host", "127.0.0.1", "--port", "8180", "--strictPort"], "port": 8180 },
    { "name": "hims-static", "runtimeExecutable": "node",
      "runtimeArgs": ["$S/scripts/static-server.mjs", "$S/hims-static", "8099"], "port": 8099 }
  ]
}
JSON
echo "ready. Start both with the preview tool (preview_start website-dev, preview_start hims-static)."
echo "Hims capture: http://localhost:8099/index.html   Our site: http://localhost:8180/"
echo "Parity, from a browser tab on :8180: const r = await import('http://localhost:8099/parity/runner.js'); await r.run({ only: ['/about'] })"
