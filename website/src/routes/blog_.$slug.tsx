import { createFileRoute, notFound } from "@tanstack/react-router";
import { blogPostHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { BlogPostPage } from "@/components/blog/blog-post-page";
import { findBlogPost } from "@/content/blog-posts";

// "blog_" keeps this a sibling of /blog rather than a child of it, so /blog does
// not need to render an Outlet.
export const Route = createFileRoute("/blog_/$slug")({
  loader: ({ params }) => {
    const post = findBlogPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ params }) => blogPostHead(params.slug),
  component: BlogPostRoute,
});

function BlogPostRoute() {
  const post = Route.useLoaderData();

  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />
      <BlogPostPage post={post} />
      <Footer />
    </main>
  );
}
