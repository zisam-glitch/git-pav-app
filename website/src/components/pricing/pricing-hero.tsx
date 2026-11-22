import {
  BookButton,
  ButtonLink,
  CallButton,
  Heading,
  Media,
  Section,
  SplitFeature,
} from "@/components/hims";

const PAGE_JUMPS = [
  { label: "Membership Plans", href: "#plans" },
  { label: "Treatment Fee Schedule", href: "#fees" },
  { label: "Insurance Providers", href: "#insurance" },
  { label: "Price Match Promise", href: "#announcement" },
] as const;

export function PricingHero() {
  return (
    <Section id="top" theme="cream" aria-label="Dental pricing and payment options">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/pricing-hero.jpg"
            alt="Warm sunlit dental consultation desk with treatment guide and ceramic cup on cream surface"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <Heading as="h1" size="hero" accent="for it all at once." tone="terracotta" className="">
            You don&apos;t have to Pay
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            With our 0% interest dental finance, treatments from £99 can be started today and paid
            over convenient monthly instalments.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
            <ButtonLink href="/services/finance" variant="ghost">
              Payment Options
            </ButtonLink>
          </div>
        </div>
      </SplitFeature>

      {/* Hims category hero: 48px outline pills (hair-loss.html) */}
      <nav aria-label="On this page" className="mt-10 flex flex-wrap items-center gap-2.5">
        <span className="mr-2 text-small text-muted">On this page</span>
        {PAGE_JUMPS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex min-h-12 items-center rounded-pill border border-black/19 px-6 text-label text-fg t-colors hover:border-black hover:bg-white"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </Section>
  );
}
