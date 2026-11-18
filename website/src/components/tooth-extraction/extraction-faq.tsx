import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "Why is tooth extraction necessary?",
    a: "Tooth extraction is necessary when a tooth is too damaged or decayed to be repaired, when there's severe gum disease (periodontitis), for orthodontic reasons (like overcrowding), or impacted wisdom teeth.",
  },
  {
    q: "How should I prepare for a tooth extraction?",
    a: "Inform your dentist about any medical conditions and medications you're taking. Avoid smoking before the procedure, and arrange for someone to drive you home if you'll be sedated.",
  },
  {
    q: "What is the procedure for tooth extraction?",
    a: "The procedure varies depending on the tooth. Generally, the area is numbed with local anesthesia. If the tooth is impacted, an incision may be made in the gum. The tooth is then rocked back and forth to loosen it before removal.",
  },
  {
    q: "Is tooth extraction painful?",
    a: "You shouldn't feel pain during the extraction due to anesthesia, but you may feel pressure. Post-extraction, some discomfort and swelling are normal.",
  },
  {
    q: "What should I expect after the extraction?",
    a: "After the extraction, it's common to experience some bleeding, swelling, and discomfort. Your dentist will provide instructions on managing these symptoms.",
  },
  {
    q: "How should I care for my mouth after extraction?",
    a: "Avoid rinsing, spitting, or sucking actions for the first 24 hours. Use pain relief as advised, and apply an ice pack to reduce swelling. Eat soft foods and gradually reintroduce other foods as healing progresses.",
  },
  {
    q: "What are the potential complications of tooth extraction?",
    a: "Potential complications include dry socket, infection, prolonged bleeding, or damage to adjacent teeth or jawbone. Contact your dentist if you have severe pain, fever, or uncontrolled bleeding.",
  },
  {
    q: "How long does recovery take?",
    a: "Recovery typically takes a few days. However, it's important to avoid strenuous activity for at least 24 hours to minimize bleeding and aid the healing process.",
  },
  {
    q: "When should I follow up with my dentist?",
    a: "Follow up if you experience severe pain, swelling, signs of infection, or if you have any concerns. Otherwise, adhere to your dentist's recommended schedule for check-ups.",
  },
  {
    q: "Can I replace the extracted tooth?",
    a: "Yes, options like dental implants, bridges, or dentures can be considered to replace an extracted tooth. Discuss these options with your dentist.",
  },
];

export function ExtractionFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.35fr] lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Questions &amp; answers
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
              Frequently Asked{" "}
              <span className="text-[#754B3D]">Questions</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/65">
              Everything you need to know about tooth extractions, recovery, and follow-up care.
            </p>
            <Button asChild className="mt-6">
              <a href={BOOKING_URL}>
                Book appointment <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>

          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-lg font-normal tracking-[-0.02em] text-black transition-colors group-hover:text-[#754B3D] sm:text-xl">
                      {faq.q}
                    </span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F2EDE5] text-black transition-colors group-hover:bg-black group-hover:text-white">
                      {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="max-w-2xl pb-6 text-sm leading-relaxed text-black/65 sm:text-base">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
