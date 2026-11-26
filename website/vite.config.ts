import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

// `0.0.0.0:8080` is the live-preview contract — don't change host/port.
// The dev server starts once `src/router.tsx` and `src/routes/` exist — see
// AGENTS.md § "First scaffold".
export default defineConfig(({ command, isPreview }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8081,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview
      ? [
          nitro({
            preset: "vercel",
            // Files under public/ keep their names, so they get a long but not permanent cache; hashed build files never change.
            routeRules: {
              "/assets/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
              "/fonts/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
              "/images/**": { headers: { "cache-control": "public, max-age=2592000, stale-while-revalidate=604800" } },
              "/media/**": { headers: { "cache-control": "public, max-age=2592000, stale-while-revalidate=604800" } },
              "/icons/**": { headers: { "cache-control": "public, max-age=2592000, stale-while-revalidate=604800" } },
            },
          }),
        ]
      : []),
    viteReact(),
  ],
}));
