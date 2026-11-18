import { BookButton, ButtonLink, Heading, Media, Section, Tile } from "@/components/hims";
import { BOOKING_URL } from "@/lib/enquiry";

interface About3Props {
  title?: string;
  description?: string;
  mainImage?: {
    src?: string;
    alt: string;
  };
  secondaryImage?: {
    src?: string;
    alt: string;
  };
  breakout?: {
    src?: string;
    alt?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
}

export const About3 = ({
  title = "About Us",
  description = "Providing exceptional dental care with comprehensive services and patient-centered treatment plans.",
  mainImage = {
    alt: "Pav Dental clinic interior",
  },
  secondaryImage = {
    alt: "Patient care environment",
  },
  breakout = {
    title: "Your Trusted Dental Partner",
    description:
      "Providing comprehensive dental care with same-day appointments, mobile services, and 24/7 emergency support when you need it most.",
    buttonText: "Book Appointment",
    buttonUrl: BOOKING_URL,
  },
}: About3Props = {}) => {
  return (
    <Section theme="cream" space="default">
      <div className="grid gap-6 md:grid-cols-2 md:items-end">
        <Heading as="h2" size="h2-md">
          {title}
        </Heading>
        <p className="text-lead text-muted">{description}</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Media src={mainImage.src || undefined} alt={mainImage.alt} ratio="16 / 9" tone="sand" />
        </div>
        <div className="flex flex-col gap-6">
          <Tile tone="white" className="flex flex-1 flex-col justify-between gap-6 p-6 md:p-8">
            <div>
              <p className="text-h4 text-fg">{breakout.title}</p>
              <p className="mt-2 text-body text-muted">{breakout.description}</p>
            </div>
            {breakout.buttonText ? (
              breakout.buttonUrl === BOOKING_URL ? (
                <BookButton className="self-start">{breakout.buttonText}</BookButton>
              ) : (
                <ButtonLink href={breakout.buttonUrl} variant="outline" className="self-start">
                  {breakout.buttonText}
                </ButtonLink>
              )
            ) : null}
          </Tile>
          <Media
            src={secondaryImage.src || undefined}
            alt={secondaryImage.alt}
            ratio="16 / 9"
            tone="sage"
          />
        </div>
      </div>
    </Section>
  );
};
