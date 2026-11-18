import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What's the difference between standard dentures and implant-retained dentures?",
    a: "Standard dentures rely on gravity and suction, while implant-retained dentures are secured with implants, offering a more stable and secure fit.",
  },
  {
    q: "Can I eat normally with dentures?",
    a: "With well-fitting dentures, you'll enjoy a wider variety of foods, making dining a more enjoyable experience.",
  },
  {
    q: "How much do dentures cost?",
    a: "Denture prices vary depending on the type: Acrylic Dentures are £495, Flexible (Valplast) Dentures are £795, and Cobalt Chromium Dentures are £1,195. NHS Band 3 options are also available for eligible patients.",
  },
  {
    q: "How do implant-retained dentures differ from regular implants?",
    a: "Implant-retained dentures are removable and click onto implants, while standard implants are permanently fixed in place.",
  },
  {
    q: "How do I clean my dentures?",
    a: "Use an antibacterial and antifungal cleaner, which you can find at most retailers like Boots or Tesco. Follow the manufacturer's instructions for best results.",
  },
  {
    q: "Can I sleep with my dentures in?",
    a: "While it's possible, we recommend removing them to allow your gums to breathe and avoid irritation. You can do this discreetly while showering or bathing.",
  },
  {
    q: "What should I do if my dentures feel loose?",
    a: "If your dentures feel loose, visit us for an assessment. In some cases, adjustments or relining may be required. Denture adhesives can also help for temporary fixes.",
  },
  {
    q: "Do I need to replace my dentures over time?",
    a: "Yes, your gums can change over time, which may affect the fit of your dentures. Regular checkups will help ensure they remain comfortable.",
  },
  {
    q: "Are there alternatives to dentures?",
    a: "Yes, implants and bridges are alternatives to traditional dentures, providing different benefits based on your oral health needs.",
  },
  {
    q: "Can dentures help improve my speech?",
    a: "Yes, well-made dentures can enhance your speech by providing proper support for your mouth and jaw.",
  },
];

export function DenturesFaq() {
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
              Everything you need to know about dentures, fittings, adjustments, and daily care.
            </p>
            <Button asChild className="mt-6">
              <a href={BOOKING_URL}>
                Book denture assessment <ArrowRight className="size-4" />
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
