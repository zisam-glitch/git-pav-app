// Tiny read-only static file server for local reference captures. Usage: node static-server.mjs <root> <port>
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, resolve } from "node:path";

const [, , rootArg, port] = process.argv;
const root = resolve(rootArg);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mjs": "text/javascript; charset=utf-8",
};

http
  .createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (p.endsWith("/")) p += "index.html";
      const file = normalize(join(root, p));
      if (!file.startsWith(root)) {
        res.writeHead(403).end("forbidden");
        return;
      }
      const s = await stat(file);
      if (s.isDirectory()) {
        res.writeHead(301, { Location: p + "/" }).end();
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[extname(file).toLowerCase()] || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  })
  .listen(Number(port), "127.0.0.1", () => console.log(`static server on http://127.0.0.1:${port} -> ${root}`));
