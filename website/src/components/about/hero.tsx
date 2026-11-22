import { BookButton, CallButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

const PAGE_JUMPS = [
  { num: "01", label: "Our Story", href: "#our-story" },
  { num: "02", label: "The Dream & Team", href: "#dream-team" },
  { num: "03", label: "A Legacy Fulfilled", href: "#legacy-fulfilled" },
  { num: "04", label: "The Future of Dentistry", href: "#future-dentistry" },
] as const;

export function Hero() {
  return (
    <Section id="our-story" theme="white" space="default">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/about-hero.jpg"
            alt="Warm sunlit Pav Dental treatment room in Bradford"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
            Bradford · Our Story
          </span>
          <Heading
            as="h1"
            size="hero"
            accent="Care and Innovation"
            tone="terracotta"
            className="mt-4"
          >
            A Legacy of
          </Heading>
          <p className="mt-5 text-lead text-muted">
            Our dental clinic isn&apos;t just about delivering exceptional oral healthcare;
            it&apos;s a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a
            passionate believer that dentistry could – and should – extend beyond traditional
            practice, providing unparalleled convenience and accessibility.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </SplitFeature>

      {/* Hims "On this page" numbered jump-link rail (Mobbin a02b45d0) */}
      <nav
        aria-label="On this page"
        className="mt-10 flex flex-wrap items-center gap-2.5 border-t border-border pt-6"
      >
        <span className="mr-2 text-caption font-medium text-subtle">On this page</span>
        {PAGE_JUMPS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="group inline-flex items-center gap-2.5 rounded-pill border border-border bg-cream py-1.5 pr-4 pl-2 text-small font-medium text-fg t-colors hover:border-black hover:bg-white"
          >
            <span className="inline-flex size-6 items-center justify-center rounded-pill bg-white text-caption font-medium text-terracotta t-colors group-hover:bg-black group-hover:text-white">
              {item.num}
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </Section>
  );
}

