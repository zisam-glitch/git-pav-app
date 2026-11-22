import { createFileRoute } from "@tanstack/react-router";
import { BlogAllPage } from "@/components/blog/blog-all-page";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

// "blog_" keeps this a sibling of /blog, like the post route, and a fixed path wins over /blog/$slug.
export const Route = createFileRoute("/blog_/all")({
  validateSearch: (search: Record<string, unknown>): { page: number; topic?: string } => {
    const page = Number.parseInt(String(search.page ?? "1"), 10);
    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      topic: typeof search.topic === "string" && search.topic ? search.topic : undefined,
    };
  },
  head: () => seoHead("/blog/all"),
  component: BlogAllRoute,
});

function BlogAllRoute() {
  const { page, topic } = Route.useSearch();
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <BlogAllPage page={page} topic={topic} />
      <Footer />
    </main>
  );
}
