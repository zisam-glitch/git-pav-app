import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { BlogPage } from "@/components/blog/blog-page";

export const Route = createFileRoute("/blog")({
  head: () => seoHead("/blog"),
  component: BlogsRoute,
});

function BlogsRoute() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />
      <div className="pt-16">
        <BlogPage />
      </div>
      <Footer />
    </main>
  );
}
