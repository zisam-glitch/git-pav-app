import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is teeth whitening safe for my enamel?",
    a: "Yes. Our professional-grade whitening systems are formulated with neutral pH buffers and ACP hydroxyapatite to be completely gentle on enamel while remaining highly effective. All treatments are prescribed and supervised by GDC-registered dentists and do not damage or demineralize enamel when used as directed.",
  },
  {
    q: "How long will the whitening results last?",
    a: "Results typically last 12–24 months depending on your diet, oral hygiene routine, and the system used. Avoiding heavily pigmented foods (black coffee, red wine, turmeric) during the initial 48-hour stabilization window and using our maintenance strips every 3 months significantly extends results.",
  },
  {
    q: "Will whitening cause tooth sensitivity?",
    a: "With our custom laboratory trays and ACP desensitizing serum, sensitivity is minimized or eliminated completely. Because our trays are trimmed precisely around your gum line, active gel cannot reach delicate gingival margins, preventing the painful chemical burns caused by generic store-bought kits.",
  },
  {
    q: "How white can my teeth actually get?",
    a: "Most patients achieve 6–10 shades whiter on the standard clinical VITA shade guide. Results vary based on your baseline shade, age, and lifestyle factors. Yellowish and amber undertones respond rapidly, while deep grey or tetracycline staining may require a multi-week custom tray regime.",
  },
  {
    q: "Can I whiten if I have crowns, veneers or composite bonding?",
    a: "Whitening agents only oxidize organic stains within natural enamel and dentin; they will not alter the shade of prosthetic restorations such as ceramic crowns, veneers, or composite fillings. If you have visible anterior restorations, we recommend a pre-treatment aesthetic consultation.",
  },
  {
    q: "What is the difference between your 3 whitening options?",
    a: "Whitening Strips (£25) are designed for maintenance and light surface touch-ups. Home UV Whitening (£99) uses cold-blue LED light to photochemically accelerate results for fast event preparation. The Custom Home Whitening Suite (£295) utilizes 3D intraoral impressions for scalloped laboratory trays — providing the most even, deep, and long-lasting shade lift.",
  },
  {
    q: "Can I whiten if I am pregnant or breastfeeding?",
    a: "We advise postponing active teeth whitening treatments during pregnancy or breastfeeding as a clinical precaution, in accordance with GDC guidelines.",
  },
  {
    q: "How do I book a whitening consultation?",
    a: "You can book directly via our online consultation form below or call our clinic on 01274 123456. Our clinical team will assess your enamel health, verify suitability, and provide custom impression trays.",
  },
];

export function WhiteningFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Clinical guidance on enamel safety, tray fit, expected shade lift, and aftercare.
          </p>
        </div>

        {/* Solid Accordion */}
        <div className="divide-y divide-[#e8ddd0] border-y border-[#e8ddd0]">
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
                      isOpen ? "text-[#925a27]" : "text-[#2a1c12] group-hover:text-[#925a27]"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center transition-all ${
                      isOpen
                        ? "accent-gradient text-white rotate-180"
                        : "bg-[#faf6f0] border border-[#e2d4c0] text-[#925a27]"
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
                  <p className="text-sm sm:text-base text-[#6b5848] leading-relaxed max-w-3xl">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Solid CTA Box with crisp rounded-xl */}
        <div className="mt-14 text-center bg-[#faf6f0] border border-[#e2d4c0] rounded-xl p-8 sm:p-10 shadow-sm">
          <p className="font-display text-2xl font-bold text-[#2a1c12] mb-2">
            Have a Specific Clinical Question?
          </p>
          <p className="text-[#6b5848] text-sm mb-6 max-w-md mx-auto">
            Our GDC-registered dental team is here to help you select the safest treatment for your enamel.
          </p>
          <a
            href="/contact-us"
            className="inline-flex items-center gap-2 accent-gradient text-white font-bold rounded-full px-8 h-12 hover:opacity-95 text-sm shadow-sm"
          >
            Speak with a Whitening Dentist
          </a>
        </div>
      </div>
    </section>
  );
}
