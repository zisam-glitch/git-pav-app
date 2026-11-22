import { Heading, Section, Tile } from "@/components/hims";

const SERVICES = [
  {
    title: "Dental Crowns and Bridges",
    desc: "These are used to restore and replace damaged or missing teeth, improving the function and appearance of your smile.",
  },
  {
    title: "Regular Check-ups",
    desc: "Routine dental check-ups are essential for maintaining good oral health. These appointments typically include a dental cleaning, X-rays, and an examination by the dentist.",
  },
  {
    title: "Dental Fillings",
    desc: "Dental fillings are used to restore teeth damaged by decay back to their normal function and shape.",
  },
  {
    title: "Tooth Extractions",
    desc: "Sometimes a tooth may need to be removed due to decay, disease, or crowding. General dentists can perform simple extractions.",
  },
  {
    title: "Preventative Care",
    desc: "General dentistry aims to prevent oral health problems before they become severe. This includes advice on proper brushing techniques, flossing, and diet.",
  },
  {
    title: "Gum Disease Treatment",
    desc: "Treatment for gum diseases like gingivitis and periodontitis is another crucial aspect of general dentistry.",
  },
] as const;

export function GeneralDentistryServices() {
  return (
    <Section id="services" theme="white">
      <div className="max-w-2xl">
        <p className="inline-flex rounded-pill border border-border bg-cream px-3.5 py-1.5 text-caption font-medium text-terracotta">
          Clinical Treatments
        </p>
        <Heading size="h2-md" accent="General Dentistry" tone="terracotta" inline className="mt-4">
          Services Offered in
        </Heading>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, i) => (
          <Tile
            key={service.title}
            tone={i % 3 === 2 ? "sage" : "cream"}
            lift
            className="flex flex-col justify-between gap-5 border border-border p-6 md:p-7"
          >
            <div>
              <span className="inline-flex rounded-pill bg-white px-2.5 py-0.5 text-caption font-medium tabular-nums text-terracotta">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-h4 text-fg">{service.title}</h3>
              <p className="mt-3 border-t border-border pt-3 text-body text-muted">{service.desc}</p>
            </div>
          </Tile>
        ))}
      </div>
    </Section>
  );
}
