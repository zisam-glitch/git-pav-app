import { ArrowUpRight } from "lucide-react";
import { BookButton, ButtonLink, Carousel, Heading, Section, Tile } from "@/components/hims";

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
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
          Treatment Options
        </span>
        <div id="cosmetic-procedures-heading" className="mt-4">
          <Heading size="h2-md" accent="Cosmetic Dentistry Procedures" tone="terracotta" inline>
            Popular
          </Heading>
        </div>
      </div>

      <Carousel label="Popular Cosmetic Dentistry Procedures" className="mt-10">
        {PROCEDURES.map((proc, index) => (
          <Tile
            key={proc.id}
            as="article"
            tone={index % 2 === 1 ? "sage" : "cream"}
            lift
            className="flex h-full flex-col justify-between gap-6 border border-border/60 p-6 md:p-8"
          >
            <div>
              <span className="inline-flex items-center rounded-pill border border-border bg-white px-3 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-h4 text-fg">{proc.title}</h3>
              <p className="mt-3 text-body leading-relaxed text-muted">{proc.desc}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
              <BookButton variant="default" size="sm">
                Book Now
              </BookButton>
              {"to" in proc && proc.to ? (
                <ButtonLink to={proc.to} variant="ghost" size="sm" className="gap-1">
                  <span>Learn more</span>
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </ButtonLink>
              ) : null}
            </div>
          </Tile>
        ))}
      </Carousel>
    </Section>
  );
}
