import { useState } from "react";
import { ChevronDown, HelpCircle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    q: "What is an Emergency Dentist?",
    a: "An emergency dentist provides rapid, same-day assessment and urgent treatment for acute dental problems that cannot wait for a regular scheduled check-up. This includes unbearable toothache, dental trauma from sports or falls, rapidly spreading facial swelling, uncontrolled bleeding, broken teeth exposing nerves, and severe dental abscesses.",
  },
  {
    q: "When should I call an emergency dentist?",
    a: "You should call us immediately if you have constant throbbing tooth pain that over-the-counter painkillers don't relieve, visible swelling in your cheek or jaw, trauma that knocked a tooth out or loosened it, or bleeding following an extraction that does not subside within an hour.",
  },
  {
    q: "What counts as a dental emergency?",
    a: "True dental emergencies fall into three key categories: severe pain (such as pulpitis or nerve inflammation), uncontrolled infection or swelling (which can pose systemic risks if left untreated), and physical trauma (fractured or avulsed teeth where early re-implantation within 60 minutes is critical).",
  },
  {
    q: "What if I have facial swelling or fever?",
    a: "Facial swelling accompanied by fever, difficulty swallowing, or eye swelling is an urgent medical priority. It usually indicates an aggressive spreading bacterial infection. Call our emergency hotline (07311 871456) right away so we can prescribe targeted antibiotics, drain the infection, and relieve pressure.",
  },
  {
    q: "Can I get treatment on the same day?",
    a: "Yes. Pav Dental keeps dedicated daily emergency slots specifically for walk-ins and same-day phone bookings. In over 95% of cases, we diagnose, numb the area, and initiate immediate pain-relieving treatment during your first visit.",
  },
  {
    q: "How much will emergency treatment cost?",
    a: "Our emergency triage consultation begins from £50. Any procedure needed (such as a temporary dressing, extraction, or nerve extirpation) will be quoted upfront before starting so you have total cost transparency. NHS Band 1 (£26.80 emergency rate) is also accessible for eligible NHS patients.",
  },
  {
    q: "Can I get emergency dental care for my child?",
    a: "Yes. We treat children and teens for dental injuries, playground tooth avulsions, and acute abscesses. Our compassionate pediatric-trained clinicians ensure young patients feel safe, calm, and pain-free.",
  },
  {
    q: "Do you offer sedation for nervous or anxious patients?",
    a: "Yes. We understand dental emergencies can feel overwhelming, especially if you have dental anxiety. We offer gentle conscious sedation options and modern painless local anaesthetic techniques.",
  },
  {
    q: "What if my emergency happens late at night or on a Sunday?",
    a: "We operate 24 hours a day, 7 days a week including Sunday evenings and Bank Holidays. Our on-call surgical team can be reached at 07311 871456 to triage you and open our surgery when needed.",
  },
  {
    q: "Will I receive antibiotics during my emergency visit?",
    a: "If our clinical assessment confirms a bacterial infection with systemic signs (such as fever, swollen lymph nodes, or spreading cellulitis), we will dispense or prescribe the appropriate antibiotics immediately.",
  },
  {
    q: "Can emergency treatment save a knocked-out tooth?",
    a: "Yes — timing is everything! Handle the tooth only by the crown (never the root), do not scrape it, place it in a cup of cold milk or in your cheek, and come directly to Pav Dental within 60 minutes for the highest chance of successful re-implantation.",
  },
];

export function EmergencyFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full  /30 bg-[#cf9448]/10 px-4 py-1.5 mb-3">
            <HelpCircle className="size-3.5 text-[#925a27]" />
            <span className="text-xs font-bold uppercase text-[#925a27]">
              Common Questions
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2a1c12]">
            Frequently Asked <span className="accent-text">Questions</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848]">
            Essential guidance on triage protocols, fees, night care, and what to do in a dental crisis.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className={`rounded-xl transition-all duration-200  ${
                  isOpen
                    ? "bg-[#844d1e] text-white  shadow-lg"
                    : "bg-white text-[#2a1c12]  hover:border-[#cf9448]/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-display text-base sm:text-lg font-bold ${
                      isOpen ? "text-white" : "text-[#2a1c12]"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-white/20 text-white rotate-180"
                        : "bg-[#f5ede0] text-[#925a27]"
                    }`}
                  >
                    <ChevronDown className="size-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm sm:text-base leading-relaxed text-white/90   pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA block */}
        <div className="mt-14 rounded-xl bg-[#faf6f0]   p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold text-[#2a1c12]">
              Still dealing with unbearable pain?
            </h3>
            <p className="text-xs sm:text-sm text-[#6b5848] mt-1">
              Do not wait for it to get worse. Speak directly with our on-call dental nurse right now.
            </p>
          </div>
          <Button
            asChild
            className="accent-gradient rounded-full px-8 h-12 text-white font-bold shadow-md hover:opacity-95 whitespace-nowrap"
          >
            <a href="tel:07311871456">
              <PhoneCall className="mr-2 size-4" />
              Call 07311 871456
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
