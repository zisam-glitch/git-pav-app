import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What is a root canal treatment?",
    a: "A root canal is a dental procedure that removes infected or damaged pulp from inside the tooth, cleans the canals, and seals them to prevent further infection.",
  },
  {
    q: "Why do I need a root canal?",
    a: "You may need a root canal if the tooth pulp is infected or inflamed due to deep decay, cracks, repeated dental procedures, or trauma. Symptoms often include severe pain, sensitivity, or swelling.",
  },
  {
    q: "Is a root canal painful?",
    a: "Modern root canal treatments are generally not painful. Local anesthesia ensures comfort during the procedure. Mild soreness afterward is normal and temporary.",
  },
  {
    q: "What happens during the root canal procedure?",
    a: "The dentist numbs the area, removes the infected pulp, cleans and shapes the canals, and fills them with a biocompatible material. A crown may be recommended afterward for protection.",
  },
  {
    q: "How long does a root canal take?",
    a: "Most root canals take 45–90 minutes depending on the complexity and number of canals. Some cases require multiple visits.",
  },
  {
    q: "What should I expect after the procedure?",
    a: "Mild discomfort, sensitivity, or swelling is normal for a few days. Pain relief medication is usually effective, and most patients return to normal activities quickly.",
  },
  {
    q: "How should I care for my tooth after a root canal?",
    a: "Avoid chewing on the treated side until a crown is placed. Maintain good oral hygiene and follow your dentist's instructions for pain management and care.",
  },
  {
    q: "What are the risks or complications?",
    a: "Possible complications include persistent infection, missed canals, or fractures. In rare cases, retreatment or additional procedures may be needed.",
  },
  {
    q: "Is a crown necessary after a root canal?",
    a: "For back teeth or teeth with significant damage, a crown is highly recommended to restore strength and prevent fractures.",
  },
  {
    q: "How long does a root canal last?",
    a: "With proper care and restoration, a root canal-treated tooth can last for many years, often for a lifetime.",
  },
];

export function RootCanalFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
              Everything you need to know about root canal treatment, recovery, and tooth
              preservation.
            </p>
            <Button asChild className="mt-6">
              <a href={BOOKING_URL}>
                Book consultation <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>

          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
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
