import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What is general dentistry?",
    a: "General dentistry focuses on preventive care and treatments to maintain healthy teeth and gums. It includes regular check-ups, cleanings, fillings, root canals, extractions, and patient education on oral hygiene.",
  },
  {
    q: "What services do general dentists offer?",
    a: "General dentists provide services like dental exams, cleanings, x-rays, fillings, crowns, bridges, root canal treatments, gum care, and sometimes orthodontic treatments like braces.",
  },
  {
    q: "How often should I visit a general dentist?",
    a: "It's recommended to visit a dentist for check-ups and cleanings every six months. However, your dentist may suggest a different schedule based on your specific oral health needs.",
  },
  {
    q: "What's the difference between general dentistry and specialized dentistry?",
    a: "General dentists provide a broad range of dental care and are your primary dental care providers. Specialists, like orthodontists or periodontists, focus on specific areas of dental health.",
  },
  {
    q: "Can general dentists perform cosmetic procedures?",
    a: "Yes, many general dentists can perform cosmetic procedures such as teeth whitening, veneers, and bonding. However, complex cosmetic work may require a specialist.",
  },
  {
    q: "What should I expect during a dental check-up?",
    a: "A dental check-up typically includes an examination of your teeth, gums, and mouth, dental cleanings to remove plaque and tartar, and possibly X-rays to detect underlying issues.",
  },
  {
    q: "How can I maintain good oral health at home?",
    a: "Good oral hygiene includes brushing twice a day, flossing daily, using mouthwash, eating a balanced diet, and avoiding tobacco products. Regular dental visits are also crucial.",
  },
  {
    q: "Are dental X-rays safe?",
    a: "Dental X-rays are safe and expose you to very low levels of radiation. However, inform your dentist if you're pregnant or have specific health concerns.",
  },
  {
    q: "What is a dental emergency, and how is it handled?",
    a: "Dental emergencies include severe toothache, broken or knocked-out teeth, and acute gum or jaw pain. In such cases, it's important to see a dentist immediately for urgent care.",
  },
  {
    q: "How are cavities treated?",
    a: "Cavities are treated by removing the decayed part of the tooth and filling it with materials like composite resin or amalgam.",
  },
  {
    q: "What are the signs of gum disease?",
    a: "Signs of gum disease include red, swollen, or bleeding gums, bad breath, loose teeth, and receding gums. Early detection and treatment are crucial.",
  },
  {
    q: "Can general dentists treat children?",
    a: "Many general dentists can treat children, and some even specialize in pediatric dentistry. It's important to find a dentist who is comfortable and experienced in treating young patients.",
  },
];

export function GeneralDentistryFaq() {
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
              General dentistry,{" "}
              <span className="text-[#754B3D]">explained clearly</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
              Everything you need to know about check-ups, fillings, X-rays, gum care, and family
              appointments.
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
