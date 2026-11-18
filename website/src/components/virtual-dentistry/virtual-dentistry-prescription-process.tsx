import React from "react";
import { Calendar, MessageCircle, FileText, Truck } from "lucide-react";

const STEPS = [
  {
    icon: Calendar,
    title: "Book Appointment",
    desc: "Schedule your virtual consultation at your convenience",
  },
  {
    icon: MessageCircle,
    title: "Speak With Dentist",
    desc: "Connect with a qualified dentist via video call",
  },
  {
    icon: FileText,
    title: "Generate Prescription",
    desc: "Receive your prescription online if needed",
  },
  {
    icon: Truck,
    title: "Get Your Prescription Filled",
    desc: "Collect from your local pharmacy or home delivery",
  },
];

export function VirtualDentistryPrescriptionProcess() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            How Online Prescription Service Works?
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Simple 4-step process to get your dental prescription online without leaving your home.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="size-20 rounded-full bg-[#cf9448]/15 text-[#925a27] flex items-center justify-center mx-auto">
                    <Icon className="size-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 size-8 rounded-full bg-[#925a27] text-white flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-[#2a1c12] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6b5848] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}