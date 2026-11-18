import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "How often should I see the hygienist?",
    a: "Most patients benefit from hygiene care every 3 to 6 months. Patients with gum disease or a higher risk of dental problems may need more frequent visits. Our dentist or hygienist will recommend the right interval for you.",
  },
  {
    q: "Does hygiene treatment hurt?",
    a: "Hygiene treatment is usually very comfortable. If your gums are sensitive, we can apply a numbing gel to make the treatment easier and more relaxing.",
  },
  {
    q: "Is hygiene the same as teeth whitening?",
    a: "No. Hygiene treatment removes tartar, plaque, and surface stains, while teeth whitening is designed to lighten the natural colour of your teeth.",
  },
  {
    q: "Can hygiene stop bleeding gums?",
    a: "Yes. In most cases, professional cleaning combined with correct home care significantly improves bleeding gums.",
  },
  {
    q: "Is hygiene safe during pregnancy?",
    a: "Yes. Hygiene treatment is completely safe during pregnancy and is highly recommended to maintain healthy gums and teeth.",
  },
  {
    q: "Will my breath improve after hygiene treatment?",
    a: "Yes. Removing bacteria and tartar from your teeth and gums significantly reduces bad breath and helps keep your mouth fresh.",
  },
];

export function OralHygieneFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.3fr]">
          <Reveal className="lg:sticky lg:top-24">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Frequently Asked Questions
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              Hygiene care,{" "}
              <span className="text-[#754B3D]">explained clearly</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
              Answers on visit frequency, gum sensitivity, pregnancy safety, and keeping breath
              fresh.
            </p>
            <Button asChild className="mt-7">
              <a href={BOOKING_URL}>
                Book Appointment
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="divide-y divide-black/10 border-t border-b border-black/10">
              {FAQS.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
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
