import { BookButton, CallButton, Heading, Media, Section, Tile } from "@/components/hims";

const BENEFITS = [
  {
    title: "Speed and Convenience",
    desc: "With virtual dental consultations, you can access dental care from the comfort of your own home.",
  },
  {
    title: "Time Saving",
    desc: "You don't have to take time off work or school to visit a dentist in person. Our Platform provides the quickest and simplest method obtaining your dental e-prescription, saving you time and effort",
  },
  {
    title: "Streamlined Prescription Management",
    desc: "Keep all your prescriptions organized and easily accessible in one place, enabling efficient tracking and monitoring",
  },
  {
    title: "Enhanced Accuracy",
    desc: "E-prescriptions significantly reduce the likelihood of errors, ensuring that you receive the precise medication, proper dosage, and accurate instructions",
  },
  {
    title: "Eco-friendly",
    desc: "Embracing paperless e-prescriptions contributed to a greener planet by minimizing paper waste and promoting eco-conscious practices.",
  },
] as const;

export function VirtualDentistryBenefits() {
  return (
    <Section theme="brown" width="bento" space="lg">
      <div className="max-w-3xl">
        <Heading as="h2" size="hero" accent="PavDental Virtual Dentist?" tone="gold">
          Why you should choose
        </Heading>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit, index) => (
          <Tile
            key={benefit.title}
            as="article"
            tone="glass"
            className="flex flex-col justify-between gap-4 p-6 md:p-7"
          >
            <div>
              <span className="text-caption font-medium text-gold tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-h4 text-white">{benefit.title}</h3>
              <p className="mt-3 text-body text-white/80">{benefit.desc}</p>
            </div>
          </Tile>
        ))}

        <Media
          src="/images/generated/virtual-dentistry-benefits.jpg"
          ratio="4 / 3"
          tone="brown"
          className="h-full bg-white/10"
          alt="Digital dental e-prescription care in warm natural light"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <BookButton variant="gold">Book Appointment</BookButton>
        <CallButton variant="glass" />
      </div>
    </Section>
  );
}
