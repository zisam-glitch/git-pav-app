import { Check, FileText, ShieldCheck } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  FaqList,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";
import { PRACTICE_HOURS } from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_INSURERS,
  FINANCE_FAQS,
  PAYMENT_OPTIONS,
  PRICE_MATCH_PILLARS,
} from "./finance-data";

export function FinancePage() {
  return (
    <>
      <FinanceHero />
      <PaymentOptionsBento />
      <PriceMatchBand />
      <FinanceFaqSection />
      <CtaBand
        theme="navy"
        title="Ready for clear,"
        accent="honest dental care?"
        tone="butter"
        actions={
          <>
            <BookButton variant="butter">Book Now</BookButton>
            <CallButton variant="glass" />
            <ButtonLink href="/services/regestration" variant="glass">
              New Patient Registration
            </ButtonLink>
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · {PRACTICE_HOURS}.
      </CtaBand>
    </>
  );
}

/** Hims split feature hero (Mobbin 16099344): clear non-promotional payment overview. */
function FinanceHero() {
  return (
    <Section id="top" theme="white" aria-label="Transparent dental payment options">
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
            Bradford Clinic · Clear Fees
          </span>

          <Heading as="h1" size="hero" accent="Payment Options" tone="terracotta" className="mt-4">
            Transparent Dental
          </Heading>

          <p className="mt-5 max-w-xl text-lead text-muted">
            Clear private fees, predictable monthly membership plans, and an itemised written
            treatment plan before you commit to any care at our Bradford clinic.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-small text-muted">
            <li className="flex items-center gap-2">
              <FileText aria-hidden="true" className="size-4 text-terracotta" />
              <span>Written quotes upfront</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-4 text-terracotta" />
              <span>Bronze, Silver &amp; Gold plans</span>
            </li>
            <li className="flex items-center gap-2">
              <Check aria-hidden="true" className="size-4 text-terracotta" />
              <span>Itemised insurance receipts</span>
            </li>
          </ul>
        </div>
      </SplitFeature>
    </Section>
  );
}

/** Hims cream bento & spec cards (Mobbin b92190f8 & fceeec4f): three transparent ways patients pay. */
function PaymentOptionsBento() {
  return (
    <Section id="options" theme="white" width="wide" aria-labelledby="options-heading">
      <div className="max-w-2xl">
        <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
          How Patients Pay
        </span>
        <Heading
          as="h2"
          size="h2-md"
          accent="ways to plan your care"
          tone="terracotta"
          className="mt-4"
        >
          <span id="options-heading">Three clear</span>
        </Heading>
        <p className="mt-4 text-lead text-muted">
          Whether you are visiting for a single examination, maintaining your smile with a monthly
          plan, or scheduling multi-stage treatment, you always see the full cost upfront.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PAYMENT_OPTIONS.map((option) => (
          <Tile
            key={option.step}
            as="article"
            tone={option.featured ? "sage" : "white"}
            lift
            className={cn(
              "flex h-full flex-col justify-between gap-8 p-6 md:p-8",
              option.featured && "border border-black/15",
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-pill bg-black text-caption font-medium text-white">
                  {option.step}
                </span>
                <span className="rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-fg">
                  {option.badge}
                </span>
              </div>

              <h3 className="mt-6 text-h3-md text-fg">
                {option.title} <span className="block text-terracotta">{option.accent}</span>
              </h3>

              <p className="mt-3 text-body text-muted">{option.description}</p>

              <ul className="mt-6 space-y-3 border-t border-border pt-6">
                {option.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-small text-fg">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-sand text-fg"
                    >
                      <Check className="size-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ButtonLink
              href={option.ctaHref}
              variant={option.featured ? "default" : "outline"}
              className="w-full"
            >
              {option.ctaLabel}
            </ButtonLink>
          </Tile>
        ))}
      </div>

      {/* Explicit non-promotional regulatory clarity banner */}
      <div className="mt-8 rounded-xl border border-border bg-white p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="max-w-3xl">
            <p className="text-label text-fg">Clear information before you decide</p>
            <p className="mt-2 text-body text-muted">
              Pav Dental does not advertise regulated credit or finance offers online. Every patient
              receives a written treatment plan with clear private fees first, and any third-party
              finance discussion takes place only in clinic with authorised information.
            </p>
          </div>
          <ButtonLink href="/pricing" variant="outline" size="sm" className="w-fit shrink-0">
            Full Pricing &amp; Plans
          </ButtonLink>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-caption font-medium text-muted">
            Insurance receipts provided for claims with all major providers
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ACCEPTED_INSURERS.map((insurer) => (
              <li
                key={insurer}
                className="rounded-pill border border-border bg-cream px-3.5 py-1.5 text-small font-medium text-fg"
              >
                {insurer}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/** High-contrast dark brown + gold Price Match Promise spotlight (Hims Mobbin e4eccce0). */
function PriceMatchBand() {
  return (
    <Section
      id="price-match"
      theme="brown"
      width="bento"
      space="lg"
      aria-labelledby="price-match-heading"
    >
      <div className="max-w-3xl">
        <span className="inline-block rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-caption font-medium text-gold">
          Our Price Match Promise
        </span>
        <Heading as="h2" size="h2" accent="our Price Match Promise" tone="gold" className="mt-4">
          <span id="price-match-heading">Fair fees, backed by</span>
        </Heading>
        <p className="mt-5 text-lead text-white/80">
          We are committed to providing both attentive clinical care and transparent value. Present
          a written quote from another UK dental provider for an equivalent treatment, and we will
          offer you a better price.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PRICE_MATCH_PILLARS.map((pillar) => (
          <Tile key={pillar.step} tone="glass" className="border border-white/12 p-6 md:p-8">
            <span className="inline-flex size-8 items-center justify-center rounded-pill bg-gold/15 text-caption font-medium text-gold">
              {pillar.step}
            </span>
            <h3 className="mt-4 text-h4 text-gold">{pillar.title}</h3>
            <p className="mt-3 text-body text-white/80">{pillar.description}</p>
          </Tile>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <BookButton variant="gold">Book Consultation</BookButton>
        <CallButton variant="glass" />
        <ButtonLink href="/pricing#fees" variant="glass">
          View Fee Schedule
        </ButtonLink>
      </div>
    </Section>
  );
}

/** Clean white FAQ section using Hims FaqList (Mobbin 54b349fb). */
function FinanceFaqSection() {
  return (
    <Section id="faq" theme="white" width="wide" aria-labelledby="finance-faq-heading">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
            Payment FAQs
          </span>
          <Heading
            as="h2"
            size="h2-md"
            accent="clearly answered"
            tone="terracotta"
            className="mt-4"
          >
            <span id="finance-faq-heading">Payment questions,</span>
          </Heading>
          <p className="mt-4 text-body text-muted">
            Straightforward answers about written treatment quotes, membership plans, insurance
            receipts, and in-clinic discussions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <ButtonLink href="/pricing" variant="outline">
              View Pricing
            </ButtonLink>
          </div>
        </div>

        <FaqList items={FINANCE_FAQS} tone="light" defaultOpen={0} />
      </div>
    </Section>
  );
}
