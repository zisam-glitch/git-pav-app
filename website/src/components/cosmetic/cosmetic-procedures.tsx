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
        <div id="cosmetic-procedures-heading">
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
            tone="cream"
            lift
            className="flex h-full flex-col justify-between gap-6 p-6 md:p-7"
          >
            <div>
              <span className="text-small font-medium text-terracotta tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-h4 text-fg">{proc.title}</h3>
              <p className="mt-3 text-body text-muted">{proc.desc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <BookButton variant="outline" size="sm">
                Book Now
              </BookButton>
              {"to" in proc && proc.to ? (
                <ButtonLink to={proc.to} variant="ghost" size="sm">
                  Learn more
                </ButtonLink>
              ) : null}
            </div>
          </Tile>
        ))}
      </Carousel>
    </Section>
  );
}
