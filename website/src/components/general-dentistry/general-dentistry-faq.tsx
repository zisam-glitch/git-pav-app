import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    q: "What is general dentistry?",
    a: "General dentistry focuses on preventive care and treatments to maintain healthy teeth and gums. It includes regular check-ups, cleanings, fillings, root canals, extractions, and patient education on oral hygiene.",
  },
  {
    q: "What services do general dentists offer?",
    a: "General dentists offer a wide range of services including preventative care, gum disease treatment, dental crowns and bridges, regular check-ups, dental fillings, and tooth extractions. They provide comprehensive care for patients of all ages.",
  },
  {
    q: "How often should I visit a general dentist?",
    a: "Most dental professionals recommend visiting the dentist every six months for routine check-ups and cleanings. However, your dentist may recommend more frequent visits if you have specific oral health concerns or risk factors.",
  },
  {
    q: "What's the difference between general dentistry and specialized dentistry?",
    a: "General dentistry provides comprehensive primary dental care for patients of all ages, while specialized dentistry focuses on specific areas like orthodontics, periodontics, or oral surgery. General dentists can handle most common dental issues and refer to specialists when needed.",
  },
  {
    q: "Can general dentists perform cosmetic procedures?",
    a: "Yes, many general dentists offer cosmetic procedures such as teeth whitening, bonding, and veneers. While they may not specialize exclusively in cosmetic dentistry, they can often provide these services to improve the appearance of your smile.",
  },
  {
    q: "What should I expect during a dental check-up?",
    a: "A typical dental check-up includes a thorough examination of your teeth and gums, professional cleaning to remove plaque and tartar, X-rays to detect hidden issues, and discussion of your oral health. Your dentist will also provide personalized advice for maintaining good oral hygiene.",
  },
  {
    q: "How can I maintain good oral health at home?",
    a: "Maintain good oral health by brushing twice daily with fluoride toothpaste, flossing daily, using mouthwash, eating a balanced diet low in sugary foods, avoiding tobacco products, and visiting your dentist regularly for check-ups and cleanings.",
  },
  {
    q: "Are dental X-rays safe?",
    a: "Yes, dental X-rays are safe. The amount of radiation exposure from dental X-rays is very low, and modern digital X-ray technology further reduces exposure. Dentists take necessary precautions like lead aprons and only take X-rays when needed for diagnosis.",
  },
  {
    q: "What is a dental emergency, and how is it handled?",
    a: "Dental emergencies include severe tooth pain, knocked-out teeth, broken teeth, abscesses, or injuries to the mouth or jaw. If you experience a dental emergency, contact your dentist immediately. Many practices offer emergency appointments or can refer you to an emergency dental service.",
  },
  {
    q: "How are cavities treated?",
    a: "Cavities are typically treated by removing the decayed portion of the tooth and filling the space with a filling material like composite resin. For more extensive decay, a crown may be needed. Early detection through regular check-ups allows for simpler, less invasive treatments.",
  },
  {
    q: "What are the signs of gum disease?",
    a: "Common signs of gum disease include red, swollen, or tender gums, bleeding during brushing or flossing, persistent bad breath, receding gums, loose teeth, and changes in how your teeth fit together when biting. Early gum disease (gingivitis) can often be reversed with proper treatment.",
  },
  {
    q: "Can general dentists treat children?",
    a: "Yes, general dentists are trained to treat patients of all ages, including children. Many general dentists provide family dentistry services and can handle most pediatric dental needs. For children with specific complex needs, they may refer to a pediatric dentist.",
  },
];

export function GeneralDentistryFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-14 items-start">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2a1c12]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-sm text-[#6b5848] leading-relaxed">
              Everything you need to know about general dentistry services, procedures, and maintaining optimal oral health.
            </p>
            <Button
              asChild
              className="mt-6 accent-gradient text-white rounded-full px-6 h-10 text-xs font-bold shadow-sm hover:opacity-95"
            >
              <a href="/contact-us" className="flex items-center gap-2">
                Book Appointment <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>

          {/* Right accordion */}
          <div className="divide-y divide-[#e8ddd0]">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="py-1">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  >
                    <span
                      className={`font-semibold text-sm sm:text-base transition-colors duration-200 ${
                        isOpen
                          ? "text-[#925a27]"
                          : "text-[#2a1c12] group-hover:text-[#925a27]"
                      }`}
                    >
                      {faq.q}
                    </span>
                    <span
                      className={`flex-shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? "accent-gradient text-white rotate-180"
                          : "bg-[#f0e8dc] text-[#925a27]"
                      }`}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="pb-5 text-sm text-[#6b5848] leading-relaxed max-w-2xl">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}