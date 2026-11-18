import { Reveal } from "@/components/home/reveal";

const SERVICES = [
  {
    title: "Preventative Care",
    desc: "General dentistry aims to prevent oral health problems before they become severe. This includes advice on proper brushing techniques, flossing, and diet.",
  },
  {
    title: "Gum Disease Treatment",
    desc: "Treatment for gum diseases like gingivitis and periodontitis is another crucial aspect of general dentistry.",
  },
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
];

export function GeneralDentistryServices() {
  return (
    <section id="services" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <Reveal className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Core treatments
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Services offered in{" "}
                <span className="text-[#754B3D]">general dentistry</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Comprehensive dental care services designed to maintain and improve your oral health
                for the entire family.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service, i) => (
                <Reveal key={service.title} delay={0.04 * i} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.5rem] border border-black/6 bg-white p-6 sm:p-7">
                    <span className="font-mono text-xs font-medium text-[#754B3D]">
                      0{i + 1}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-normal tracking-[-0.02em] text-black">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/65">{service.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
