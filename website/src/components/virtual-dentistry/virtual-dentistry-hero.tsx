import { BookButton, CallButton, Heading, Media, Section, Tile } from "@/components/hims";

export function VirtualDentistryHero() {
  return (
    <Section
      id="top"
      theme="white"
      space="sm"
      className="pt-6 md:pt-10"
      aria-label="Virtual dentistry services"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="text-label text-terracotta">Virtual Dental Consultations</p>
          <Heading
            as="h1"
            size="hero"
            accent="Healthcare Services"
            tone="terracotta"
            className="mt-3"
          >
            Affordable
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            £35 Consultation Fee and £25 Prescription Cost. Quality medical advice and prescriptions
            at budget-friendly prices to ensure your health needs are met without breaking the bank.
          </p>

          <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
            <Tile tone="cream" className="p-4">
              <p className="text-caption font-medium text-muted">Consultation Fee</p>
              <p className="mt-1 text-h3 text-fg tabular-nums">£35</p>
            </Tile>
            <Tile tone="sage" className="p-4">
              <p className="text-caption font-medium text-muted">Prescription Cost</p>
              <p className="mt-1 text-h3 text-fg tabular-nums">£25</p>
            </Tile>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton>Book appointment</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>

        <Media
          src="/images/generated/virtual-dentistry-hero.jpg"
          ratio="4 / 3"
          tone="cream"
          alt="Virtual dental video consultation on a tablet in warm natural light"
          priority
        />
      </div>
    </Section>
  );
}
