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
          />
        }
      >
        <div>
          <Heading size="h2-md" tone="gold">
            Procedures
          </Heading>

          <ul className="mt-6 flex flex-col gap-3">
            {PROCEDURES.map((procedure) => (
              <li key={procedure.label}>
                <Link
                  to={procedure.to}
                  className="group flex items-center justify-between gap-4 rounded-xl bg-white/7 px-5 py-4 text-lead text-white t-colors hover:bg-white/15"
                >
                  <span>{procedure.label}</span>
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
