const BENEFITS = [
  {
    title: "Unique mobile dental service",
    desc: "Bringing comprehensive dental care directly to your doorstep with modern equipment.",
  },
  {
    title: "Working with care homes",
    desc: "Specialized services designed for care home residents and their daily needs.",
  },
  {
    title: "Make your home oral-health CQC-compliant",
    desc: "Support your care setting with structured, CQC-compliant oral-health care.",
  },
  {
    title: "NHS partners",
    desc: "Working with NHS partners to provide accessible dental care for eligible patients.",
  },
  {
    title: "The very latest mobile dental equipment",
    desc: "Portable clinical equipment designed for safe, thorough home visits.",
  },
  {
    title: "Hundreds of satisfied patients",
    desc: "Experienced clinicians trusted across home and care-home visits.",
  },
  {
    title: "Attract more residents",
    desc: "On-site dental support strengthens care quality for prospective families.",
  },
  {
    title: "Engage carers and improve staff retention",
    desc: "Practical guidance that supports carers with residents' oral hygiene.",
  },
];

export function MobileDentistryBenefits() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                We are the dentists that come to you
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Concerned about your residents&apos;{" "}
                <span className="text-[#754B3D]">dental needs?</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Our mobile dental service brings comprehensive care directly to homes and
                residential care settings.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((benefit, i) => (
                <article
                  key={benefit.title}
                  className={`${
                    i % 3 === 0
                      ? "bg-white"
                      : i % 3 === 1
                        ? "hims-tile-warm"
                        : "hims-tile-sage"
                  } rounded-[1.5rem] border border-black/6 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
                >
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#1B3745] text-xs font-medium text-[#ECD880]">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-normal tracking-[-0.02em] text-black">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/65">{benefit.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
