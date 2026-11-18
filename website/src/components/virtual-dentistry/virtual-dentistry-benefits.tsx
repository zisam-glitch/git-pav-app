const BENEFITS = [
  {
    title: "Speed and Convenience",
    desc: "With virtual dental consultations, you can access dental care from the comfort of your own home.",
    span: "lg:col-span-2",
    tone: "hims-tile-warm",
  },
  {
    title: "Time Saving",
    desc: "You don't have to take time off work or school to visit a dentist in person. Our platform provides a quick and simple method for obtaining your dental e-prescription.",
    span: "lg:col-span-2",
    tone: "bg-white",
  },
  {
    title: "Streamlined Prescription Management",
    desc: "Keep all your prescriptions organized and easily accessible in one place, enabling efficient tracking and monitoring.",
    span: "lg:col-span-2",
    tone: "hims-tile-sage",
  },
  {
    title: "Enhanced Accuracy",
    desc: "E-prescriptions significantly reduce the likelihood of errors, ensuring that you receive the precise medication, proper dosage, and accurate instructions.",
    span: "lg:col-span-3",
    tone: "bg-[#F2EDE5]",
  },
  {
    title: "Eco-friendly",
    desc: "Embracing paperless e-prescriptions contributes to a greener planet by minimizing paper waste and promoting eco-conscious practices.",
    span: "lg:col-span-3",
    tone: "hims-tile-warm",
  },
];

export function VirtualDentistryBenefits() {
  return (
    <section className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Benefits
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Why choose PavDental{" "}
            <span className="text-[#754B3D]">Virtual Dentist?</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Remote dental consultations and paperless e-prescriptions designed around your
            schedule.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {BENEFITS.map((benefit, i) => (
            <article
              key={benefit.title}
              className={`${benefit.tone} ${benefit.span} rounded-[1.5rem] border border-black/6 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-2xl font-normal tracking-[-0.02em] text-black">
                {benefit.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-black/65">{benefit.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
