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
  { num: "01", label: "Membership Plans", href: "#plans" },
  { num: "02", label: "Treatment Fee Schedule", href: "#fees" },
  { num: "03", label: "Insurance Providers", href: "#insurance" },
  { num: "04", label: "Price Match Promise", href: "#announcement" },
] as const;

export function PricingHero() {
  return (
    <Section id="top" theme="white" aria-label="Dental pricing and payment options">
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
          <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
            Bradford Clinic · Transparent Fees
          </span>
          <Heading
            as="h1"
            size="hero"
            accent="for it all at once."
            tone="terracotta"
            className="mt-4"
          >
            You don&apos;t have to Pay
          </Heading>
          <p className="mt-5 max-w-xl text-lead text-muted">
            Transparent private fees, monthly membership plans, and a clear written treatment plan
            before you commit.
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

      {/* Hims "On this page" numbered jump-link rail (Mobbin a02b45d0) */}
      <nav
        aria-label="On this page"
        className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6"
      >
        <span className="mr-2 text-caption font-medium text-subtle">On this page</span>
        {PAGE_JUMPS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-2 rounded-pill border border-border bg-cream px-3.5 py-1.5 text-small text-fg t-colors hover:border-black hover:bg-white"
          >
            <span className="text-caption font-medium text-terracotta">{item.num}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </Section>
  );
}
