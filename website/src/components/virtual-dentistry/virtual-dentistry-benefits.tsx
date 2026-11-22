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
    <Section theme="brown" width="bento" space="lg" aria-labelledby="virtual-benefits-heading">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3.5 py-1 text-caption font-medium text-gold">
            Remote Dental Care &amp; E-Prescriptions
          </span>
          <div id="virtual-benefits-heading" className="mt-4">
            <Heading as="h2" size="hero" accent="PavDental Virtual Dentist?" tone="gold">
              Why you should choose
            </Heading>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <BookButton variant="gold">Book Appointment</BookButton>
          <CallButton variant="glass" />
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit, index) => (
          <Tile
            key={benefit.title}
            as="article"
            tone="glass"
            className="flex flex-col justify-between gap-4 border border-white/15 p-6 md:p-7"
          >
            <div>
              <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-gold tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-h4 text-white">{benefit.title}</h3>
              <p className="mt-3 border-t border-white/15 pt-4 text-body leading-relaxed text-white/80">
                {benefit.desc}
              </p>
            </div>
          </Tile>
        ))}

        <Media
          src="/images/generated/virtual-dentistry-benefits.jpg"
          ratio="4 / 3"
          tone="brown"
          className="h-full bg-white/10 ring-1 ring-white/15"
          alt="Digital dental e-prescription care in warm natural light"
        />
      </div>
    </Section>
  );
}
