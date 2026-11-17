import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { LiveContentPage } from "@/components/content/live-content-page";

export const Route = createFileRoute("/faq")({
  head: () => seoHead("/faq"),
  component: FaqPage,
});

function FaqPage() {
  return <LiveContentPage path="/faq" />;
}
