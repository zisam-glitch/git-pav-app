import React from "react";
import { Clock, Video, FileText, Home, Shield, Phone } from "lucide-react";

const SERVICES = [
  {
    icon: Clock,
    title: "24 x 7 Emergency Dentists",
    desc: "Round the clock we help people to connect with Dentists for urgent dental care needs.",
  },
  {
    icon: Video,
    title: "Video Consultations",
    desc: "Connect with qualified dentists from anywhere using our secure video platform.",
  },
  {
    icon: FileText,
    title: "Online Prescriptions",
    desc: "Get your prescriptions online and sent directly to your preferred pharmacy.",
  },
  {
    icon: Home,
    title: "Home Visit Coordination",
    desc: "Arrange for dental professionals to visit you at home when needed.",
  },
  {
    icon: Shield,
    title: "General Dental Advice",
    desc: "Receive professional guidance on managing your dental health remotely.",
  },
  {
    icon: Phone,
    title: "Treatment Planning",
    desc: "Create comprehensive treatment plans with our experienced dentists.",
  },
];

export function VirtualDentistryServices() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-[#fffdf9]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Choose Type of Services
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Our virtual dentistry platform offers a comprehensive range of dental services accessible from the comfort of your home.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="bg-white rounded-xl p-6 shadow-sm   hover:border-[#925a27] transition-colors"
              >
                <div className="size-12 rounded-lg bg-[#cf9448]/15 text-[#925a27] flex items-center justify-center mb-4">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#2a1c12] mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-[#6b5848] leading-relaxed">
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}