import { ArrowUpRight } from "lucide-react";
import { BookButton, ButtonLink, CardRail, Section, SectionHead } from "@/components/hims";

const PROCEDURES = [
  {
    id: "contouring",
    title: "Tooth Contouring",
    desc: "This procedure involves reshaping the tooth by removing some of its enamel to alter its length, shape, or surface.",
  },
  {
    id: "whitening",
    title: "Teeth Whitening",
    desc: "One of the most common and cost-effective cosmetic dentistry treatments, teeth whitening can brighten your smile in just one session.",
    to: "/services/whitening" as const,
  },
  {
    id: "veneers",
    title: "Porcelain Veneers",
    desc: "These are thin shells of porcelain that are custom-fitted to cover the front surface of a tooth, often used to correct uneven teeth, worn enamel, or discoloration.",
  },
  {
    id: "implants",
    title: "Dental Implants",
    desc: "Used to replace missing teeth, dental implants offer a long-lasting solution that looks and feels natural.",
  },
  {
    id: "bonding",
    title: "Dental Bonding",
    desc: "This involves applying a tooth-colored resin to a tooth and hardening it with a special light. It’s a cost-effective way to repair chipped or cracked teeth.",
  },
] as const;

export function CosmeticProcedures() {
  return (
    <Section id="procedures" theme="white" aria-labelledby="cosmetic-procedures-heading">
      <SectionHead
        id="cosmetic-procedures-heading"
        label="Treatment options"
        title="Popular Cosmetic Dentistry Procedures"
        action={<BookButton>Book Now</BookButton>}
      />
      <div className="mt-10">
        <CardRail
          label="Popular Cosmetic Dentistry Procedures"
          items={PROCEDURES.map((proc, i) => ({
            label: String(i + 1).padStart(2, "0"),
            title: proc.title,
            text: proc.desc,
            action: (
              <div className="flex flex-wrap gap-2">
                <BookButton size="sm">Book Now</BookButton>
                {"to" in proc && proc.to ? (
                  <ButtonLink to={proc.to} variant="outline" size="sm" className="gap-1">
                    <span>Learn more</span>
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </ButtonLink>
                ) : null}
              </div>
            ),
          }))}
        />
      </div>
    </Section>
  );
}
