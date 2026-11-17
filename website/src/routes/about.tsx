import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Hero } from "@/components/about/hero";
import { OurStory } from "@/components/about/our-story";
import { Team } from "@/components/about/team";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ScrollProgress } from "@/components/home/scroll-progress";

export const Route = createFileRoute("/about")({
  head: () => seoHead("/about"),
  component: About,
});

function About() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />
      <div className="pt-16">
        <Hero />
        <OurStory />
        <Team />
      </div>
      <Footer />
    </main>
  );
}
