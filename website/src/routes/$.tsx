import { createFileRoute, notFound } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/not-found/not-found-page";
import { noindexHead } from "@/lib/seo";

/**
 * Any address that is no page. Throwing notFound() makes the response a real 404 (the live site
 * answers these with its home page and a 200, a "soft 404"), shows the branded page from the
 * root route, and the head keeps the address out of search results, as the blog and team
 * routes do for a post or person that does not exist.
 */
export const Route = createFileRoute("/$")({
  loader: () => {
    throw notFound();
  },
  head: () => noindexHead("Page not found | Pav Dental"),
  // Its own not-found page, so that this route's head (noindex) applies. When only the root has
  // one, the router skips the child's head.
  notFoundComponent: NotFoundPage,
});
