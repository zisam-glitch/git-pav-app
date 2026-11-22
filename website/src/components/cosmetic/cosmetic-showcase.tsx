import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Heading, Section } from "@/components/hims";

const PROCEDURES = [
  { label: "Painless Dental Care | Pav Dental", to: "/services/general-dentistry" as const },
  { label: "Visual or a crown vs a veneer", to: "/services/cosmetic" as const },
  { label: "Bridges Procedure with Pav Dental", to: "/services/general-dentistry" as const },
  { label: "Teeth Veneers | Pav Dental", to: "/services/cosmetic" as const },
  { label: "Pain-Free Dental Care | Pav Dental", to: "/services/general-dentistry" as const },
] as const;

export function CosmeticShowcase() {
  return (
    <Section theme="brown" space="lg">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-28">
        <Heading as="h2" size="h2-md" tone="gold">
          Procedures
        </Heading>
        <ul className="grid gap-3">
          {PROCEDURES.map((procedure) => (
            <li key={procedure.label}>
              <Link
                to={procedure.to}
                className="group flex min-h-16 items-center justify-between gap-4 rounded-lg bg-white/7 px-6 py-4 text-label text-white t-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
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
    </Section>
  );
}
