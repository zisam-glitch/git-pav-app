import { BookButton, Heading, Media, Section, SplitFeature, Tile } from "@/components/hims";

const SHOWCASE_OPTIONS = [
  { id: "intermediate", label: "Intermediate - acrylic with clasps" },
  { id: "premium", label: "Premium - Flexible denture" },
] as const;

export function DenturesShowcase() {
  return (
    <Section theme="brown">
      <SplitFeature
        media={
          <Media
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10"
            alt="Acrylic and flexible denture craftsmanship on a calm dark studio surface"
          />
        }
      >
        <div>
          <Heading size="h2-md" tone="gold">
            Dentures
          </Heading>

          <div className="mt-6 flex flex-col gap-3">
            {SHOWCASE_OPTIONS.map((option, i) => (
              <Tile key={option.id} tone="glass" className="p-5 md:p-6">
                <span className="text-small font-medium tabular-nums text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-h4 text-white">{option.label}</p>
              </Tile>
            ))}
          </div>

          <div className="mt-8">
            <BookButton variant="gold">Make an Appointment</BookButton>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
