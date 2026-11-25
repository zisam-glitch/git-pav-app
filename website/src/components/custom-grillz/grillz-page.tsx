import { ContactForm } from "@/components/home/contact-form";
import { BookButton, FloatingCta, SubNav } from "@/components/hims";
import { GrillzFaq } from "./grillz-faq";
import { GrillzHero } from "./grillz-hero";
import { GrillzPricing } from "./grillz-pricing";
import { GrillzProcess } from "./grillz-process";
import { GrillzStyles } from "./grillz-styles";

export function CustomGrillzPage() {
  return (
    <main className="bg-white">
      <GrillzHero />
      <SubNav
        label="On this page"
        items={[
          { label: "Grillz", href: "#styles" },
          { label: "Why Pav Dental", href: "#why-pav" },
          { label: "Guarantee", href: "#guarantee" },
          { label: "Contact", href: "#contact" },
        ]}
      />
      <GrillzStyles />
      <GrillzProcess />
      <GrillzPricing />
      <ContactForm />
      <GrillzFaq />
      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
