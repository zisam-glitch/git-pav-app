import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { FaqPage } from "@/components/faq";

export const Route = createFileRoute("/faq")({
  head: () => seoHead("/faq"),
  component: FaqPage,
});
