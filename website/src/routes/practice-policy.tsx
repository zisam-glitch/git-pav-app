import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { LiveContentPage } from "@/components/content/live-content-page";

export const Route = createFileRoute("/practice-policy")({
  head: () => seoHead("/practice-policy"),
  component: PracticePolicyPage,
});

function PracticePolicyPage() {
  return <LiveContentPage path="/practice-policy" />;
}
