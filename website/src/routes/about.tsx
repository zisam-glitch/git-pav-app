import { createFileRoute } from "@tanstack/react-router";
import { Story } from "@/components/about/story";
import { Team } from "@/components/about/team";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seoHead("/about"),
  component: About,
});

function About() {
  return (
    <main className="min-h-screen bg-white text-fg">
      <ScrollProgress />
      <Header />
      <Story />
      <Team />
      <Footer />
    </main>
  );
}
