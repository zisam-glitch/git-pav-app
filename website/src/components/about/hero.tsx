import { Hero05 } from "@/components/ui/hero-05";
import { BOOKING_URL } from "@/lib/enquiry";

export function Hero() {
  return (
    <Hero05
      tagline="Exceptional dental care in Bradford"
      title="A Legacy of Care and Innovation"
      description="Our dental clinic isn't just about delivering exceptional oral healthcare; it's a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a passionate believer that dentistry could – and should – extendbeyond traditional practice, providing unparalleled convenience and accessibility."
      landscapeImage="/media/about.png"
      landscapeAlt="PavDental Clinic"
      animation="subtle"
      primaryCTA={{
        ctaEnabled: true,
        text: "Book Appointment",
        link: BOOKING_URL,
        variant: "default",
      }}
      secondaryCTA={{
        ctaEnabled: true,
        text: "View Services",
        link: "#services",
        variant: "link",
      }}
    />
  );
}
