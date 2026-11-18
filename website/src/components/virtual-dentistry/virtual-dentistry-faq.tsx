import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "How do I schedule a virtual consultation with Pav Dental?",
    a: "To schedule a virtual consultation with Pav Dental, simply log into your account on the Pav Dental website or mobile app and select the virtual consultation option. From there, you will be able to choose a convenient time and date for your appointment.",
  },
  {
    q: "Do I need to have any specific technology to use the virtual consultation service?",
    a: "You can access the service from any device with an internet connection and a camera, such as a smartphone, tablet, or computer.",
  },
  {
    q: "How does the virtual consultation work?",
    a: "The virtual consultation works by connecting you with a licensed dentist through video conferencing. During the consultation, the dentist will assess your dental needs and discuss your treatment options.",
  },
  {
    q: "What happens after the virtual consultation?",
    a: "Following the virtual consultation, if deemed necessary prior to an in-person visit or primary care, the dentist will issue an electronic prescription for any required treatments or medications, transmitted to your preferred pharmacy.",
  },
  {
    q: "How long does it take to receive a prescription after the virtual consultation?",
    a: "After your virtual consultation with the dentist, they will promptly e-file your prescription with your preferred pharmacy. Its availability to retrieve depends on their stock and business hours.",
  },
  {
    q: "How much does a prescription cost?",
    a: "Flat rate £25 for the prescription, alongside a £35 consultation fee.",
  },
  {
    q: "What is a virtual video consultation?",
    a: "A virtual video dental consultation is a way for you to connect with a dentist via video call to discuss your oral health concerns and treatment plan and get your questions answered.",
  },
  {
    q: "How do I book a virtual video consultation?",
    a: "You can book a virtual video dental consultation through Pav Dental's platform, either as a subscriber or on a pay-as-you-go basis, by selecting the appointment type and choosing a convenient time.",
  },
  {
    q: "What type of services can I receive during a virtual video dental consultation?",
    a: "During a virtual video dental consultation, you can receive a wide range of support including preventive care advice, smile correction discussions, night guards, remineralization trays, sleep apnea devices, electronic prescriptions, and specialist referrals.",
  },
  {
    q: "What equipment do I need for a virtual video dental consultation?",
    a: "All you need is a device with a camera, such as a smartphone, tablet, or computer, and a reliable internet connection.",
  },
  {
    q: "Can I receive a diagnosis and treatment plan during a virtual video dental consultation?",
    a: "Yes, your dentist will assess your oral health, answer any questions you have, and provide you with a personalized treatment plan.",
  },
  {
    q: "How long does a virtual video dental consultation typically last?",
    a: "Virtual video dental consultations typically last up to 30 minutes, giving you ample time to discuss your oral health concerns and treatment plan.",
  },
];

export function VirtualDentistryFaq() {
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
              Everything you need to know about virtual dental consultations, e-prescriptions, and
              remote care.
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
