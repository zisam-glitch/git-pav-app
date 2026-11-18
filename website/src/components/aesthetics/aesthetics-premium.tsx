import React from "react";
import { ShieldCheck, CheckCircle, Lock } from "lucide-react";

export function AestheticsPremium() {
  return (
    <section className="py-20 sm:py-28 bg-[#2a1c12] text-white border-b border-[#3d2a1d]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              Exclusively Utilizing Premium Medical-Grade Products
            </h2>

            <p className="mt-5 text-white/85 text-sm sm:text-base leading-relaxed">
              At Pav Dental Aesthetics, your safety and natural outcome are paramount. We never compromise with unverified grey-market imports or low-grade substitutes. All injectable products are sourced exclusively from licensed UK pharmacies and FDA/CE-cleared global leaders including Juvéderm®, Botox®, and Profhilo®.
            </p>

            <p className="mt-4 text-white/85 text-sm sm:text-base leading-relaxed">
              Because all aesthetic procedures are performed by GDC-registered dental surgeons, our clinicians possess five-plus years of rigorous university training in head and neck anatomy, vascular mapping, and sterile injection protocols.
            </p>
          </div>

          {/* Right Column: CQC Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#372418] rounded-xl border border-[#523825] p-8 text-white flex flex-col justify-between aspect-square">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full border-2 border-white flex items-center justify-center font-bold text-lg text-white">
                    Q
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold">CareQuality</p>
                    <p className="text-[10px] uppercase text-white/80">Commission</p>
                  </div>
                </div>
                <Lock className="size-4 text-[#cf9448]" />
              </div>

              <div className="my-6">
                <p className="text-xs font-bold uppercase text-[#cf9448] mb-1">
                  Official Regulatory Compliance
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug">
                  Regulated Medical Aesthetics Practice
                </h3>
                <p className="text-xs text-white/80 mt-2 leading-relaxed">
                  Pav Dental is registered and monitored by the Care Quality Commission (CQC), guaranteeing that our infection control, clinician competence, and emergency readiness meet England's strictest healthcare standards.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
                <span>Location: Bradford, West Yorkshire</span>
                <span className="font-bold text-emerald-400">Status: Registered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
