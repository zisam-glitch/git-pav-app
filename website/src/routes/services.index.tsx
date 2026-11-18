import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { LiveContentPage } from "@/components/content/live-content-page";

// An index route, not services.tsx: a services.tsx would become the layout of
// every /services/* page.
export const Route = createFileRoute("/services/")({
  head: () => seoHead("/services"),
  component: ServicesPage,
});

function ServicesPage() {
  return <LiveContentPage path="/services" />;
}
