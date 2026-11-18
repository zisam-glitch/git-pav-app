import { createRootRoute, HeadContent, Outlet, redirect, Scripts } from "@tanstack/react-router";
import { QueryProvider } from "@/lib/query-provider";
import { PAGES, PRACTICE_JSON_LD, redirectTarget, SITE_URL } from "@/lib/seo";
import { CookieConsent } from "@/components/home/cookie-consent";
import { NotFoundPage } from "@/components/not-found/not-found-page";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  // One URL per page: a trailing slash is dropped, and paths that moved to the
  // live site's URLs (the mobile app still opens some) redirect permanently.
  beforeLoad: ({ location }) => {
    const target = redirectTarget(location.pathname);
    if (target) throw redirect({ href: `${target}${location.searchStr}`, statusCode: 301 });
  },
  notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Defaults for a page without its own tags. Every page sets these through
      // seoHead (or noindexHead), and its values win.
      { title: "Pav Dental" },
      { name: "description", content: PAGES["/"].description },
      { name: "theme-color", content: "#f6f1ea" },
      { name: "apple-mobile-web-app-title", content: "Pav Dental" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Pav Dental" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:title", content: "Pav Dental" },
      { property: "og:description", content: PAGES["/"].description },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      // The live site carries the practice's structured data on every page.
      { "script:ld+json": PRACTICE_JSON_LD },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Outfit:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <QueryProvider>
          <Outlet />
          <CookieConsent />
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  ),
});
