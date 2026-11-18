import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Heading, Media, Section, SplitFeature } from "@/components/hims";

const PROCEDURES = [
  { label: "Painless Dental Care | Pav Dental", to: "/services/general-dentistry" as const },
  { label: "Visual or a crown vs a veneer", to: "/services/cosmetic" as const },
  { label: "Bridges Procedure with Pav Dental", to: "/services/general-dentistry" as const },
  { label: "Teeth Veneers | Pav Dental", to: "/services/cosmetic" as const },
  { label: "Pain-Free Dental Care | Pav Dental", to: "/services/general-dentistry" as const },
] as const;

export function CosmeticShowcase() {
  return (
    <Section theme="brown" space="lg" aria-labelledby="cosmetic-showcase-heading">
      <SplitFeature
        media={
          <Media
            alt="Cosmetic dental ceramic models and porcelain shade tabs in warm studio light"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10"
          />
        }
      >
        <div>
          <div id="cosmetic-showcase-heading">
            <Heading size="h2-md" tone="gold">
              Procedures
            </Heading>
          </div>

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
