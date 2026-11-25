import { BookButton, CallButton, TileHub } from "@/components/hims";

export function GeneralDentistryHero() {
  return (
    <TileHub
      label="General dentistry services"
      title="General Dentistry: Your"
      accent="Gateway to Lifelong Oral Health"
      lead={
        <p>
          Welcome to your guide to General Dentistry, covering check-ups to fillings. Discover how
          it maintains and improves your dental health for lifelong healthy smiles.
        </p>
      }
      big={[
        {
          lead: "Our",
          accent: "Root Canal Prices",
          cta: "Root canal from £195",
          image: "/images/generated/general-big-root.jpg",
          alt: "Warm sunlit treatment room prepared for root canal care",
          href: "#pricing",
        },
        {
          lead: "Our",
          accent: "Tooth Extraction Prices",
          cta: "Extractions from £95",
          image: "/images/generated/general-big-extraction.jpg",
          alt: "Serene oral surgery suite in warm natural light",
          href: "#extraction",
        },
      ]}
      small={[
        {
          lead: "White",
          rest: "fillings",
          image: "/images/generated/general-tile-fillings.jpg",
          href: "#fillings",
        },
        {
          lead: "Services",
          rest: "offered",
          image: "/images/generated/general-dentistry-hero.jpg",
          href: "#services",
        },
        {
          lead: "How cavities",
          rest: "form",
          image: "/images/generated/general-tile-cavities.jpg",
          href: "#cavities",
        },
        {
          lead: "Choosing a",
          rest: "dentist",
          image: "/images/generated/general-tile-checkup.jpg",
          href: "#choosing",
        },
      ]}
    >
      <BookButton>Book Appointment</BookButton>
      <CallButton variant="outline" />
    </TileHub>
  );
}
