import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { QueryProvider } from "@/lib/query-provider";
import { CookieConsent } from "@/components/home/cookie-consent";
import appCss from "../styles.css?url";

const APP_NAME = "PavDental";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "PavDental Bradford — complete dental check-up from £35. Same-day emergency care, 24/7. GDC registered.",
      },
      { name: "theme-color", content: "#f6f1ea" },
      { name: "apple-mobile-web-app-title", content: "Pav Dental" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Pav Dental" },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content: "Complete dental check-up from £35. Same-day emergency care, 24/7. GDC registered.",
      },
      { property: "og:image", content: "/og.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
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
