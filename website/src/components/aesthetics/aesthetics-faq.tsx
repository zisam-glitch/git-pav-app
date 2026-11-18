import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "What aesthetic dental treatments do you offer?",
    a: "We offer a comprehensive range of aesthetic treatments including teeth whitening, porcelain veneers, composite bonding, smile makeovers, gum contouring, and cosmetic orthodontics. Each treatment is customized to enhance your natural smile while maintaining dental health.",
  },
  {
    q: "How long do porcelain veneers last?",
    a: "With proper care and maintenance, porcelain veneers typically last 10-15 years. They are highly resistant to staining and chipping. Regular dental check-ups, good oral hygiene, and avoiding habits like teeth grinding can significantly extend their lifespan.",
  },
  {
    q: "Is composite bonding reversible?",
    a: "Yes, composite bonding is generally reversible as it doesn't require significant alteration of your natural tooth structure. The material can be removed or replaced if needed, making it a flexible option for cosmetic improvements.",
  },
  {
    q: "What is the difference between veneers and bonding?",
    a: "Veneers are thin porcelain shells custom-made in a laboratory that are bonded to the front of teeth. They offer superior durability and stain resistance. Composite bonding uses tooth-colored resin applied directly to teeth in a single visit, making it more affordable but less durable than porcelain.",
  },
  {
    q: "How many sessions are needed for a complete smile makeover?",
    a: "The number of sessions varies based on your treatment plan. Simple cases may be completed in 2-3 visits, while comprehensive smile makeovers involving multiple procedures may require 6-8 visits over several months to ensure optimal results.",
  },
  {
    q: "Are aesthetic treatments covered by insurance?",
    a: "Most purely cosmetic procedures are not covered by dental insurance. However, if a treatment has both cosmetic and restorative benefits (such as repairing a broken tooth), partial coverage may be available. We can help you understand your insurance benefits.",
  },
  {
    q: "What is the recovery time after aesthetic procedures?",
    a: "Most aesthetic treatments have minimal recovery time. Bonding and whitening require no downtime. Veneers may have 1-2 days of sensitivity. More complex procedures may require a week for full recovery. We provide detailed aftercare instructions for each treatment.",
  },
  {
    q: "How do I know which aesthetic treatment is right for me?",
    a: "We recommend scheduling a comprehensive aesthetic consultation where we assess your dental health, discuss your goals, and create a personalized treatment plan. Our experienced team will explain all options to help you make an informed decision.",
  },
];

export function AestheticsFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-fg">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Expert guidance on aesthetic treatments, procedures, and what to expect.
          </p>
        </div>

        {/* Solid Accordion */}
        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="py-2">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left group"
                >
                  <span
                    className={`font-semibold text-base sm:text-lg transition-colors ${
                      isOpen ? "text-primary" : "text-fg group-hover:text-primary"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-all ${
                      isOpen
                        ? "accent-gradient text-primary-fg rotate-180"
                        : "bg-elevated border border-border text-primary"
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-60 opacity-100 pb-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-sm sm:text-base text-muted leading-relaxed max-w-3xl">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Solid CTA Box */}
        <div className="mt-14 text-center bg-elevated border border-border rounded-xl p-8 sm:p-10 shadow-sm">
          <p className="font-display text-2xl font-bold text-fg mb-2">
            Have Questions About Aesthetic Treatments?
          </p>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            Our experienced dental team is here to help you achieve your dream smile.
          </p>
          <a
            href={BOOKING_URL}
            className="inline-flex items-center gap-2 accent-gradient text-primary-fg font-bold rounded-full px-8 h-12 hover:opacity-95 text-sm shadow-sm"
          >
            Book Aesthetic Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
