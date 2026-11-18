import React from "react";
import { Button } from "@/components/ui/button";
import { User, Mail, MapPin, FileText, Heart } from "lucide-react";

const REGISTRATION_INFO = [
  {
    icon: User,
    title: "Personal Information",
    desc: "Name, gender, and contact details",
  },
  {
    icon: Mail,
    title: "Contact Details",
    desc: "Email address and phone number",
  },
  {
    icon: MapPin,
    title: "Address",
    desc: "Your current residential address",
  },
  {
    icon: FileText,
    title: "Health History",
    desc: "General medical background information",
  },
  {
    icon: Heart,
    title: "Dental History",
    desc: "Previous dental treatments and conditions",
  },
];

export function VirtualDentistryRegistration() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0] border-b border-[#e2d4c0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight mb-6">
              Registration Process
            </h2>
            <p className="text-[#6b5848] text-sm sm:text-base leading-relaxed mb-6">
              The process of signing up for Pav Dental video consultation service is quick, short, and easy. Signing up for Pav Dental virtual video consultation service is quick, short, and easy.
            </p>
            <p className="text-[#6b5848] text-sm sm:text-base leading-relaxed mb-8">
              The process involves providing basic information such as name, email, phone number, gender, address, health history, and dental history. This information is used to evaluate the patient before connecting them with a provider for the consultation. The entire process is designed to be user-friendly and convenient.
            </p>
            <Button
              asChild
              className="accent-gradient text-white rounded-full px-8 font-bold shadow hover:opacity-95"
            >
              <a href="#services">Register</a>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {REGISTRATION_INFO.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.title}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#e2d4c0]"
                >
                  <div className="size-10 rounded-lg bg-[#cf9448]/15 text-[#925a27] flex items-center justify-center mb-3">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-[#2a1c12] text-sm mb-1">
                    {info.title}
                  </h3>
                  <p className="text-xs text-[#6b5848]">{info.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}