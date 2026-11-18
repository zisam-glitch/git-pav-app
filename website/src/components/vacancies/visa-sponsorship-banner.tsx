import { Plane, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisaSponsorshipBannerProps {
  onApplySponsorship: () => void;
}

export function VisaSponsorshipBanner({ onApplySponsorship }: VisaSponsorshipBannerProps) {
  return (
    <section className="bg-[#FBF8F5] py-8">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.5rem] hims-navy-gradient px-6 py-14 text-white sm:px-12 sm:py-20">
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <h2 className="font-display text-3xl font-normal leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                Qualified Dentist Living Abroad?
              </h2>

              <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                Pav Dental holds an official UK Home Office sponsor licence. We provide full
                Skilled Worker Visa sponsorship, relocation support, and dedicated mentoring to help
                international dentists transition smoothly into UK practice.
              </p>

              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#ECD880]" />
                  <span className="text-sm text-white/90">Certificate of Sponsorship (CoS) provided</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#ECD880]" />
                  <span className="text-sm text-white/90">Relocation &amp; housing support</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#ECD880]" />
                  <span className="text-sm text-white/90">GDC &amp; Performer Number guidance</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#ECD880]" />
                  <span className="text-sm text-white/90">Licensed Home Office sponsor</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start justify-center lg:col-span-4 lg:items-end">
              <div className="w-full space-y-4 rounded-[1.5rem] border border-white/15 bg-white/10 p-8 text-center backdrop-blur-xs">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/15">
                  <Plane className="size-8 text-[#ECD880]" />
                </div>
                <p className="font-display text-xl font-normal text-white">Relocate to the UK</p>
                <p className="text-sm text-white/75">Begin your UK dental career at Pav Dental</p>
                <Button onClick={onApplySponsorship} variant="gold" className="w-full gap-2">
                  <span>Apply for Sponsorship</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
