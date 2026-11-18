import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const SPECS = [
  { label: "Digital scan options", detail: "In-clinic 3D accuracy", tone: "hims-tile-warm" },
  { label: "Home mould kits", detail: "Delivered with prepaid return", tone: "hims-tile-sage" },
  { label: "Custom colours", detail: "Single, dual, mixed & glitter", tone: "bg-[#F2EDE5]" },
  { label: "Personalisation", detail: "Name, initials, number or logo", tone: "hims-tile-warm" },
] as const;

export function MouthguardsHero() {
  return (
    <section
      id="top"
      className="bg-[#FBF8F5] pt-24 pb-10 sm:pt-28 sm:pb-14"
      aria-label="Custom sports mouthguards"
    >
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#F2EDE5] px-3.5 py-1 text-xs font-medium text-black/75">
              Designed for comfort, accuracy and full protection
            </span>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-[3.75rem]">
              Custom Sports{" "}
              <span className="text-[#754B3D]">Mouthguards</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
              At Pav Dental, you can order a high quality custom mouthguard in the way that suits
              you best. Every mouthguard is created using precise digital or physical impressions
              with full control over colour, style and custom features.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  Make an appointment <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#ordering">How to order</a>
              </Button>
            </div>
          </div>

          <div className="hims-tile-warm overflow-hidden rounded-[1.5rem] border border-black/6 p-6 shadow-[0_10px_32px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="overflow-hidden rounded-[1.25rem] bg-white">
              <img
                src="/media/mg.png"
                alt="Custom sports mouthguard from Pav Dental"
                className="aspect-[4/3] w-full object-contain p-4"
              />
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-black/8 pt-4 text-sm">
              <span className="font-medium text-black">Clinic scan or home impression kit</span>
              <span className="rounded-full bg-[#1B3745] px-3 py-1 text-xs font-medium text-[#ECD880]">
                Custom made
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SPECS.map((spec) => (
            <div
              key={spec.label}
              className={`${spec.tone} rounded-[1.5rem] border border-black/6 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
            >
              <h2 className="font-display text-lg font-normal tracking-[-0.02em] text-black">
                {spec.label}
              </h2>
              <p className="mt-1 text-sm text-black/60">{spec.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
