import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneralDentistryRootCanalPricing } from "./general-dentistry-root-canal-pricing";
import { GeneralDentistryFillingPricing } from "./general-dentistry-filling-pricing";
import { GeneralDentistryExtractionPricing } from "./general-dentistry-extraction-pricing";
import { BOOKING_URL } from "@/lib/enquiry";

export function GeneralDentistryPricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            General Dentistry Price List
          </h2>
          <p className="mt-4 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Transparent pricing for common general dentistry procedures. All prices include professional assessment and follow-up care.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <GeneralDentistryRootCanalPricing />
          <GeneralDentistryFillingPricing />
          <GeneralDentistryExtractionPricing />
        </div>

        <div className="text-center">
          <p className="text-xs text-[#6b5848] mb-6">
            *All prices include consultation and follow-up care. NHS options available for eligible patients.
          </p>
          <Button
            asChild
            className="accent-gradient rounded-full px-8 h-12 text-white font-bold shadow-sm hover:opacity-95"
          >
            <a href={BOOKING_URL} className="flex items-center gap-2">
              Book Appointment <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}