import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { BlogIndex } from "@/components/blog/blog-index";

export const Route = createFileRoute("/blog")({
  head: () => seoHead("/blog"),
  component: BlogsRoute,
});

function BlogsRoute() {
  return (
    <main className="min-h-screen bg-[#FBF8F5] text-fg">
      <ScrollProgress />
      <Header />
      <BlogIndex />
      <Footer />
    </main>
  );
}
