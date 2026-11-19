import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { BookButton, ButtonLink, CallButton, Heading, Section, Tile } from "@/components/hims";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";

const REASONS = [
  {
    title: "Affordable Excellence",
    description: "We ensure that superior dental care is accessible to everyone.",
  },
  {
    title: "Comprehensive Care",
    description:
      "From routine check-ups to advanced treatments, we offer a wide range of dental services.",
  },
  {
    title: "Trusted Expertise",
    description:
      "Our team of skilled dental professionals is dedicated to your oral health. Visit us at Pav Dental for your dental needs, and experience first-hand our commitment to affordability and quality care.",
  },
] as const;

export function SpecialAnnouncement() {
  const { data: announcements } = useQuery({
    queryKey: ["active-announcements"],
    queryFn: () => api.announcements.list(),
  });

  const active = announcements?.find((a) => a.is_active);

  return (
    <Section
      id="announcement"
      theme="brown"
      width="bento"
      space="lg"
      aria-labelledby="announcement-heading"
    >
      {active && (
        <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-xl bg-white/11 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-white/11 text-gold">
              <Megaphone aria-hidden="true" className="size-5" />
            </span>
            <div>
              {active.title && <h3 className="text-label text-gold">{active.title}</h3>}
              <p className="mt-1 text-body text-white/90">{active.body}</p>
            </div>
          </div>
          {active.cta_text && (
            <ButtonLink variant="gold" size="sm" href={active.cta_url || BOOKING_URL}>
              {active.cta_text}
            </ButtonLink>
          )}
        </div>
      )}

      <div className="max-w-3xl">
        <Heading as="h2" size="h2" accent="Pav Dental" tone="gold">
          <span id="announcement-heading">Special Announcement from</span>
        </Heading>
        <p className="mt-5 text-lead text-white/80">
          At Pav Dental, we take immense pride in being recognized as the market leader in dental
          pricing. Our dedication to offering top-notch dental services at the most competitive
          rates is unwavering.
        </p>
      </div>

      <Tile tone="glass" className="mt-10 bg-brown-deep p-6 md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1.4fr_auto]">
          <div>
            <h3 className="text-h3-md text-gold">Our Price Match Promise</h3>
            <p className="mt-3 text-body text-white/85">
              We&apos;re committed to providing not only the best dental care but also the best
              value. Therefore, we guarantee to beat the price of any dental treatment offered by
              our competitors. Just present us with a written quote from another provider, and we
              will offer you a better price.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </div>
        </div>
      </Tile>

      <div className="mt-10">
        <h3 className="text-h4 text-white">Choose Pav Dental for:</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {REASONS.map((reason) => (
            <Tile key={reason.title} tone="glass" className="p-6">
              <h4 className="text-h4 text-gold">{reason.title}</h4>
              <p className="mt-3 text-body text-white/80">{reason.description}</p>
            </Tile>
          ))}
        </div>
      </div>
    </Section>
  );
}
