import { ButtonLink, CallButton, Media, Section } from "@/components/hims";
import { DISPLAY_M } from "@/components/hims/type-styles";

const VACANCIES_JUMPS = [
  { label: "Open Positions", href: "#roles" },
  { label: "Foreign Visa & Sponsorship", href: "#sponsorship" },
  { label: "Open Application", href: "#open-application" },
] as const;

/**
 * The opening of `/vacancies`: the H1, View Open Positions and Call, and the wired picture under them. Hims
 * reference: the centred hero of the "Clinical excellence" capture
 * (`docs/redesign/website/hims-patterns/clinical-excellence.md`, `people-recipe.md`).
 */
export function VacanciesHero() {
  return (
    <Section theme="white" space="default">
      <div className="mx-auto max-w-[57rem] pt-4 text-center md:pt-10">
        <h1 style={DISPLAY_M} className="text-balance text-fg">
          Vacancies <span className="block text-terracotta">at Pav Dental</span>
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="#roles">View Open Positions</ButtonLink>
          <CallButton variant="outline" />
        </div>
      </div>

      <Media
        src="/images/generated/vacancies-hero.jpg"
        alt="Modern dental clinic workspace at Pav Dental in Bradford"
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
        {VACANCIES_JUMPS.map((item) => (
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
