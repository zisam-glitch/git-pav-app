import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { TeamPage } from "@/components/team/team-page";

export const Route = createFileRoute("/team")({
  head: () => seoHead("/team"),
  component: TeamPageRoute,
});

function TeamPageRoute() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />

      {/* Spacer for fixed top header */}
      <div className="pt-16">
        <TeamPage />
      </div>

      <Footer />
    </main>
  );
}

