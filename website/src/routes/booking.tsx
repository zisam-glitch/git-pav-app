import { createFileRoute } from "@tanstack/react-router";
import { noindexHead } from "@/lib/seo";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { BookingPageContent } from "@/components/booking/booking-page";

export const Route = createFileRoute("/booking")({
  head: () => noindexHead("Book an appointment | Pav Dental"),
  component: BookingRoutePage,
});

function BookingRoutePage() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-fg">
      <ScrollProgress />
      <Header />
      <div className="pt-16">
        <BookingPageContent />
      </div>
      <Footer />
    </main>
  );
}

