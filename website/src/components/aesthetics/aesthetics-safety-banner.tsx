import React from "react";
import { ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";

export function AestheticsSafetyBanner() {
  const safetyPoints = [
    {
      title: "Dentist-Level Anatomical Mastery",
      description:
        "Our clinicians inject with extensive training in deep facial nerve pathways, vascular networks, and SMAS planes.",
      icon: ShieldCheck,
    },
    {
      title: "Single-Use Sterile Micro-Cannulas",
      description:
        "Whenever appropriate, blunt-tip micro-cannulas are used to significantly minimize bruising, swelling, and vascular trauma.",
      icon: CheckCircle2,
    },
    {
      title: "Hyaluronidase Ready On-Site",
      description:
        "Emergency reversal enzymes are permanently stocked on site for total clinical safety and peace of mind.",
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="bg-[#2a1c12] text-white py-16 sm:py-20 border-y border-[#3d2a1d]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            How We Keep You Safe
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/85 leading-relaxed">
            Medical aesthetics should always be practiced with the same uncompromising sterility and clinical governance as hospital surgery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safetyPoints.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col">
                <Icon className="size-6 text-[#cf9448] mb-3 flex-shrink-0" />
                <h3 className="text-base font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-[#3d2a1d]/80 flex flex-wrap items-center justify-between gap-4 text-xs text-white/80">
          <p>
            <span className="font-semibold text-[#cf9448]">Age Limit:</span> Strictly 18+ only. Photographic ID required at clinical assessment.
          </p>
          <p>
            <span className="font-semibold text-[#cf9448]">Cooling-Off Protocol:</span> Comprehensive consultation with unhurried decision making.
          </p>
        </div>
      </div>
    </section>
  );
}

