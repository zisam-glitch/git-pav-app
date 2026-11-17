import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { ContactSection } from "@/components/contact/contact-section";

export const Route = createFileRoute("/contact-us")({
  head: () => seoHead("/contact-us"),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />

      {/* Spacer for fixed header */}
      <div className="pt-16">
        <ContactSection />
      </div>

      <Footer />
    </main>
  );
}
