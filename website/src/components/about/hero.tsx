import { BookButton, CallButton, Media, Section } from "@/components/hims";
import { DISPLAY_M } from "@/components/hims/type-styles";

const PAGE_JUMPS = [
  { label: "Our Story", href: "#our-story" },
  { label: "The Dream & Team", href: "#dream-team" },
  { label: "A Legacy Fulfilled", href: "#legacy-fulfilled" },
  { label: "The Future of Dentistry", href: "#future-dentistry" },
] as const;

/**
 * The opening of `/about`: the live heading and lead, centred, with the Book and Call buttons and the hero
 * picture under them. Hims reference: the hero of the "Clinical excellence" capture, a centred display headline
 * with its second line in the accent colour, a sub-line, then one large picture
 * (`docs/redesign/website/hims-patterns/clinical-excellence.md`).
 */
export function Hero() {
  return (
    <Section id="our-story" theme="white" space="default">
      <div className="mx-auto max-w-[57rem] pt-4 text-center md:pt-10">
        <h1 style={DISPLAY_M} className="text-balance text-fg">
          A Legacy of <span className="block text-terracotta">Care and Innovation</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lead text-muted">
          Our dental clinic isn&apos;t just about delivering exceptional oral healthcare; it&apos;s
          a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a passionate believer
          that dentistry could – and should – extend beyond traditional practice, providing
          unparalleled convenience and accessibility.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" />
        </div>
      </div>

      <Media
        src="/images/generated/about-hero.jpg"
        alt="Warm sunlit Pav Dental treatment room in Bradford"
        ratio="16 / 9"
        tone="cream"
        priority
        className="mt-12 md:mt-16"
      />

      <nav
        aria-label="On this page"
        className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
      >
        <span className="mr-2 text-small text-subtle">On this page</span>
        {PAGE_JUMPS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex h-[34px] items-center rounded-pill border border-border bg-cream px-4 text-small font-medium text-fg t-colors hover:border-black hover:bg-white"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </Section>
  );
}
