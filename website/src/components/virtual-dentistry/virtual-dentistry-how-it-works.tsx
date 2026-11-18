const DETAILED_STEPS = [
  {
    title: "Step 1: Booking Your Virtual Dental Consultation",
    desc: "Initiate your dental care journey by scheduling a video consultation via the Pav Dental app or website. Select a convenient date and time for your appointment, and await confirmation from one of our dentists.",
    tone: "bg-white",
  },
  {
    title: "Step 2: Establishing the Connection",
    desc: "Upon appointment confirmation, you'll receive a link to access your video consultation. At the designated time, simply use your computer, smartphone, or tablet to click the link and start the video call.",
    tone: "hims-tile-warm",
  },
  {
    title: "Step 3: Engaging in the Consultation",
    desc: "Voice your dental concerns and undergo a virtual examination of your teeth and gums. The dentist will collaborate with you to formulate a comprehensive treatment plan with real-time questions and personalized advice.",
    tone: "hims-tile-sage",
  },
  {
    title: "Step 4: Post-Consultation Outcomes",
    desc: "Following your consultation, outcomes are tailored to your needs: Professional Advice, Online Prescription sent directly to your pharmacy, Home Visit Coordination, or Clinic Treatment Planning.",
    tone: "bg-white",
  },
];

export function VirtualDentistryHowItWorks() {
  return (
    <section id="how-it-works" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                Step by step
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                How it <span className="text-[#754B3D]">works</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Our virtual dental consultation process is designed to be simple, convenient, and
                effective from booking to follow-up care.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {DETAILED_STEPS.map((step, i) => (
                <article
                  key={step.title}
                  className={`${step.tone} rounded-[1.5rem] border border-black/6 p-7 shadow-[0_6px_24px_rgba(0,0,0,0.04)]`}
                >
                  <span className="inline-flex rounded-full bg-[#1B3745] px-3 py-1 text-xs font-medium text-[#ECD880]">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/65">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
