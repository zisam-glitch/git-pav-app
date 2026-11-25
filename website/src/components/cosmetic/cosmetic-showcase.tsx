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
            src="/images/generated/cosmetic-showcase.jpg"
            alt="Cosmetic dental ceramic models and porcelain shade tabs in warm studio light"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10 ring-1 ring-white/15"
          />
        }
      >
        <div>
          <div id="cosmetic-showcase-heading" className="mt-4">
            <Heading size="h2" tone="gold">
              Procedures
            </Heading>
          </div>

          <ul className="mt-8 flex flex-col gap-3">
            {PROCEDURES.map((procedure, index) => (
              <li key={procedure.label}>
                <Link
                  to={procedure.to}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/7 px-5 py-4 text-lead text-white t-colors hover:border-gold/40 hover:bg-white/15"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-caption font-medium text-gold tabular-nums">
                      {String(index + 1).padStart(2, "0")}
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
