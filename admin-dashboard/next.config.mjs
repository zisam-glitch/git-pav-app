// No Content-Security-Policy yet: the template pages need auditing first, and a
// wrong policy would break staff screens. SAMEORIGIN because the dashboard
// frames its own /chat and /mail pages.
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // The local embedded database finds its own files at runtime; bundling it
  // breaks that with an intermittent "path argument" error.
  serverExternalPackages: ["@electric-sql/pglite"],
  compiler: {
    // Keep errors and warnings: server-side console.error is how failures
    // reach Vercel's logs (and Sentry's console integration).
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
