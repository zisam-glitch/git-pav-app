import {
  ServiceHeroLayout,
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Tile,
} from "@/components/hims";

export function VirtualDentistryHero() {
  return (
    <ServiceHeroLayout
      label="Virtual dentistry services"
      images={[
        {
          src: "/images/generated/virtual-dentistry-hero.jpg",
          alt: "Virtual dental video consultation on a tablet in warm natural light",
        },
        { src: "/images/generated/virtual-dentistry-benefits.jpg", alt: "" },
        { src: "/images/generated/virtual-dentistry-services.jpg", alt: "" },
      ]}
      head={
        <>
          <Heading
            as="h1"
            size="hero"
            accent="Healthcare Services"
            tone="terracotta"
            className="mt-4"
          >
            Affordable
          </Heading>
        </>
      }
    >
      <p className="mt-5 max-w-xl text-lead text-muted">
        Affordable Healthcare Services: £35 Consultation Fee and £25 Prescription Cost. Quality
        medical advice and prescriptions at budget-friendly prices to ensure your health needs are
        met without breaking the bank.
      </p>

      <div className="mt-6 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile tone="grey" className="border border-border/60 p-4">
          <p className="text-caption font-medium text-copper">Consultation Fee</p>
          <p className="mt-1 text-h3-md text-fg tabular-nums">£35</p>
        </Tile>
        <Tile tone="grey" className="border border-border/60 p-4">
          <p className="text-caption font-medium text-copper">Prescription Cost</p>
          <p className="mt-1 text-h3-md text-fg tabular-nums">£25</p>
        </Tile>
        <Tile tone="grey" className="col-span-2 border border-border/60 p-4 sm:col-span-1">
          <p className="text-caption font-medium text-copper">Availability</p>
          <p className="mt-1 text-h4 text-fg">24 x 7 Support</p>
        </Tile>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <BookButton>Book appointment</BookButton>
        <ButtonLink href="#how-it-works" variant="outline">
          How it works
        </ButtonLink>
        <CallButton variant="ghost" />
      </div>

      <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-small text-muted">
        <a
          href="#prescription-process"
          className="underline underline-offset-4 t-colors hover:text-terracotta"
        >
          How Online Prescription Service Works?
        </a>
        <a href="#faq" className="underline underline-offset-4 t-colors hover:text-terracotta">
          Frequently Asked Questions
        </a>
      </div>
    </ServiceHeroLayout>
  );
}
