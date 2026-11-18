import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What aesthetic treatments do you offer?",
    a: "We offer facial aesthetics including Botox, dermal fillers, lip enhancement, microneedling, chemical peels, skin rejuvenation, Profhilo, and Sosum Booster, alongside aesthetic dental treatments such as teeth whitening, porcelain veneers, and composite bonding.",
  },
  {
    q: "Is there a minimum age requirement?",
    a: "Yes. For the well-being and safety of our patients, all individuals seeking aesthetic treatment with us must be at least 18 years of age.",
  },
  {
    q: "How long do porcelain veneers last?",
    a: "With proper care and maintenance, porcelain veneers typically last 10–15 years. They are highly resistant to staining and chipping. Regular dental check-ups and good oral hygiene help extend their lifespan.",
  },
  {
    q: "Is composite bonding reversible?",
    a: "Yes, composite bonding is generally reversible as it doesn't require significant alteration of your natural tooth structure. The material can be removed or replaced if needed.",
  },
  {
    q: "What is the difference between veneers and bonding?",
    a: "Veneers are thin porcelain shells custom-made in a laboratory that are bonded to the front of teeth, offering durability and stain resistance. Composite bonding uses tooth-colored resin applied directly to teeth in a single visit.",
  },
  {
    q: "How many sessions are needed for a complete smile makeover?",
    a: "The number of sessions varies based on your treatment plan. Simple cases may be completed in 2–3 visits, while comprehensive smile makeovers involving multiple procedures may require more visits to ensure optimal results.",
  },
  {
    q: "What is the recovery time after aesthetic procedures?",
    a: "Most aesthetic treatments have minimal recovery time. Bonding and whitening require no downtime, and injectable treatments have straightforward aftercare instructions provided by your clinician.",
  },
  {
    q: "How do I know which aesthetic treatment is right for me?",
    a: "We recommend scheduling a consultation where we assess your health, discuss your goals, and create a personalized treatment plan tailored to your features.",
  },
];

export function AestheticsFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.3fr]">
          <Reveal className="lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Aesthetics questions,{" "}
              <span className="text-[#754B3D]">answered</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
              Guidance on safety protocols, age limits, aesthetic options, and consultations.
            </p>
            <Button asChild className="mt-7">
              <a href={BOOKING_URL}>
                Book Aesthetic Consultation
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="divide-y divide-black/10 border-t border-b border-black/10">
              {FAQS.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors hover:text-[#1B3745]"
                    >
                      <span className="font-display text-lg font-normal tracking-[-0.02em] text-black sm:text-xl">
                        {faq.q}
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F2EDE5] text-black">
                        {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="pb-6 pr-12">
                        <p className="text-sm leading-relaxed text-black/65 sm:text-base">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
