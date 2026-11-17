import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { LiveContentPage } from "@/components/content/live-content-page";

export const Route = createFileRoute("/cctv-policy")({
  head: () => seoHead("/cctv-policy"),
  component: CctvPolicyPage,
});

function CctvPolicyPage() {
  return <LiveContentPage path="/cctv-policy" />;
}
