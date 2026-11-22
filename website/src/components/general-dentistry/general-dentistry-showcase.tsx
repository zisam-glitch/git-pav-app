import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Heading, Media, Section, SplitFeature } from "@/components/hims";

const PROCEDURES = [
  { label: "Tooth Extraction | Pav Dental", to: "/services/tooth-extraction" as const },
  { label: "Tooth Cleaning with Pav Dental", to: "/services/oral-hygiene" as const },
  { label: "Dental Bridges Procedure with Pav Dental", to: "/services/cosmetic" as const },
  { label: "Teeth Veneers | Pav Dental", to: "/services/cosmetic" as const },
  { label: "Root Canal Treatment | Pav Dental", to: "/services/root-canal" as const },
] as const;

export function GeneralDentistryShowcase() {
  return (
    <Section theme="brown" space="lg">
      <SplitFeature
        media={
          <Media
            src="/images/generated/general-dentistry-showcase.jpg"
            alt="Precision dental care tools and ceramic model in warm studio light"
            ratio="4 / 3"
            tone="brown"
            className="ring-1 ring-white/12"
          />
        }
      >
        <div>
          <p className="inline-flex rounded-pill bg-white/10 px-3.5 py-1.5 text-caption font-medium text-gold">
            Explore Treatments
          </p>
          <Heading size="h2-md" tone="gold" className="mt-4">
            Procedures
          </Heading>

          <ul className="mt-6 flex flex-col gap-3">
            {PROCEDURES.map((procedure, i) => (
              <li key={procedure.label}>
                <Link
                  to={procedure.to}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-white/7 px-5 py-4 text-lead text-white t-colors hover:border-gold/40 hover:bg-white/15"
                >
                  <span className="flex items-center gap-3.5">
                    <span className="rounded-pill bg-white/10 px-2.5 py-0.5 text-caption font-medium tabular-nums text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{procedure.label}</span>
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="size-5 shrink-0 text-gold transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SplitFeature>
    </Section>
  );
}
