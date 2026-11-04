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
};

export default nextConfig;
