import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";
import { GeneralDentistryExtractionPricing } from "./general-dentistry-extraction-pricing";
import { GeneralDentistryFillingPricing } from "./general-dentistry-filling-pricing";
import { GeneralDentistryRootCanalPricing } from "./general-dentistry-root-canal-pricing";

export function GeneralDentistryPricing() {
  return (
    <section id="pricing-summary" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Fee overview
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            General dentistry{" "}
            <span className="text-[#754B3D]">price list</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Transparent pricing for root canal treatments, white fillings, and extractions.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <GeneralDentistryRootCanalPricing />
          <GeneralDentistryFillingPricing />
          <GeneralDentistryExtractionPricing />
        </div>

        <div className="mt-10 text-center">
          <p className="mb-6 text-xs text-black/55">
            *All prices include clinical assessment and aftercare guidance.
          </p>
          <Button asChild size="lg">
            <a href={BOOKING_URL}>
              Book Appointment
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
