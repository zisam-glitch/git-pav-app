import {
  createRootRoute,
  HeadContent,
  Outlet,
  redirect,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { QueryProvider } from "@/lib/query-provider";
import { PAGES, PRACTICE_JSON_LD, redirectTarget, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { CookieConsent } from "@/components/home/cookie-consent";
import { NotFoundPage } from "@/components/not-found/not-found-page";
import { ServicesSidebar } from "@/components/content/services-sidebar";
import { isServiceDetailPath } from "@/content/site-links";
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
      { name: "theme-color", content: "#ffffff" },
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
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  // A service page (/services/whitening) opens the services sidebar beside its content.
  const servicePage = useLocation({ select: (location) => isServiceDetailPath(location.pathname) });

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <QueryProvider>
          {servicePage ? <ServicesSidebar /> : null}
          <div className={cn(servicePage && "xl:pl-72")}>
            <Outlet />
          </div>
          <CookieConsent />
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  );
}
