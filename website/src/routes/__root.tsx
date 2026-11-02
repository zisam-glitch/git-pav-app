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
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
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
