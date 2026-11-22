import { ButtonLink, CallButton, Heading, Media, Section, SplitFeature } from "@/components/hims";

const VACANCIES_JUMPS = [
  { num: "01", label: "Open Positions", href: "#roles" },
  { num: "02", label: "Foreign Visa & Sponsorship", href: "#sponsorship" },
  { num: "03", label: "Open Application", href: "#open-application" },
] as const;

export function VacanciesHero() {
  return (
    <Section theme="white" space="default">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/vacancies-hero.jpg"
            alt="Modern dental clinic workspace at Pav Dental in Bradford"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
            Careers in Bradford · 7 Open Roles
          </span>
          <Heading as="h1" size="hero" accent="at Pav Dental" tone="terracotta" className="mt-4">
            Vacancies
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Join a growing practice in Bradford across dental nursing, general dentistry, hygiene,
            therapy, and international sponsorship.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="#roles">View Open Positions</ButtonLink>
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
        {VACANCIES_JUMPS.map((item) => (
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

