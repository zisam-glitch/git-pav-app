import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const FAQS = [
  {
    q: "How do I schedule a virtual consultation with Pav Dental?",
    a: "To schedule a virtual consultation with Pav Dental, simply log into your account on the Pav Dental website or mobile app and select the virtual consultation option. From there, you will be able to choose a convenient time and date for your appointment.",
  },
  {
    q: "Do I need to have any specific technology to use the virtual consultation service?",
    a: "You need a device with a camera and microphone (computer, smartphone, or tablet) and a stable internet connection. Our platform works on most modern browsers and devices.",
  },
  {
    q: "How does the virtual consultation work?",
    a: "After booking, you'll receive a link to join the video consultation at your scheduled time. You'll connect with a qualified dentist who can assess your dental concerns and provide advice or prescriptions as needed.",
  },
  {
    q: "What happens after the virtual consultation?",
    a: "After the consultation, you may receive professional advice, an online prescription sent to your pharmacy, coordination for a home visit if needed, or planning for an in-clinic appointment depending on your dental needs.",
  },
  {
    q: "How long does it take to receive a prescription after the virtual consultation?",
    a: "Prescriptions are typically generated immediately after the consultation if deemed necessary by the dentist and can be sent directly to your chosen pharmacy.",
  },
  {
    q: "How much does a prescription cost?",
    a: "Prescription cost is £25, and the consultation fee is £35. These are affordable rates to ensure quality dental care is accessible to everyone.",
  },
  {
    q: "What is a virtual video consultation?",
    a: "A virtual video consultation is a remote dental appointment where you connect with a dentist via video call to discuss your dental concerns, receive advice, and potentially get prescriptions without visiting a clinic.",
  },
  {
    q: "How do I book a virtual video consultation?",
    a: "You can book through our website or mobile app by selecting the virtual consultation option, choosing your preferred time slot, and confirming your appointment.",
  },
  {
    q: "What type of services can I receive during a virtual video dental consultation?",
    a: "You can receive dental advice, diagnosis for common issues, prescription services, treatment planning, and referrals for in-person care when necessary.",
  },
  {
    q: "What equipment do I need for a virtual video dental consultation?",
    a: "You need a device with camera and microphone, stable internet connection, and good lighting. A quiet, private space is also recommended for the consultation.",
  },
  {
    q: "Can I receive a diagnosis and treatment plan during a virtual video dental consultation?",
    a: "Yes, our dentists can provide diagnoses for many common dental issues and create treatment plans. For complex cases requiring physical examination, we may recommend an in-person visit.",
  },
  {
    q: "How long does a virtual video dental consultation typically last?",
    a: "Consultations typically last 15-30 minutes depending on the complexity of your dental concerns and the discussion required.",
  },
];

export function VirtualDentistryFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-14 items-start">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2a1c12]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-sm text-[#6b5848] leading-relaxed">
              Everything you need to know about virtual dental consultations, online prescriptions, and remote dental care.
            </p>
            <Button
              asChild
              className="mt-6 accent-gradient text-white rounded-full px-6 h-10 text-xs font-bold shadow-sm hover:opacity-95"
            >
              <a href={BOOKING_URL} className="flex items-center gap-2">
                Book Consultation <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>

          {/* Right accordion */}
          <div className=" ">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="py-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
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