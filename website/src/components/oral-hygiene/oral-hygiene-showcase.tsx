import { BookButton, Heading, Media, Section, SplitFeature, Tile } from "@/components/hims";

const DEMOS = [
  {
    id: "scale-polish",
    title: "Professional Scale & Polish",
    desc: "Combining scaling and polishing to remove hardened plaque and tartar from above and just below the gumline, then smoothing teeth to enhance shine.",
  },
  {
    id: "gum-treatment",
    title: "Gum Care & Prevention",
    desc: "Gentle hygiene treatment paired with tailored home-care advice to help reduce inflammation, bleeding gums, and bad breath.",
  },
];

export function OralHygieneShowcase() {
  return (
    <Section theme="white" space="default">
      <SplitFeature
        media={
          <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-black/8">
            <Media
              src="/images/generated/oral-hygiene-showcase.jpg"
              alt="Professional dental hygiene scaling and polishing instruments arranged in warm studio light"
              ratio="4 / 3"
              tone="sand"
            />
          </div>
        }
      >
        <div>
          <Heading as="h2" size="h2-md" accent="in Action" tone="terracotta" className="mt-4">
            Hygiene Treatment
          </Heading>
          <div className="mt-6 grid gap-3">
            {DEMOS.map((demo, index) => (
              <Tile key={demo.id} tone="white" lift className="p-5 md:p-6">
                <span className="inline-flex rounded-pill bg-cream px-2.5 py-0.5 text-caption font-medium text-terracotta tabular-nums">
                  0{index + 1}
                </span>
                <h3 className="mt-3 text-h4 text-fg">{demo.title}</h3>
                <p className="mt-2 text-body text-muted">{demo.desc}</p>
              </Tile>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
