import { Plane, CheckCircle2, Globe, ArrowRight, ShieldCheck } from "lucide-react";

interface VisaSponsorshipBannerProps {
  onApplySponsorship: () => void;
}

export function VisaSponsorshipBanner({ onApplySponsorship }: VisaSponsorshipBannerProps) {
  return (
    <section className="bg-white">
      <div className="w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2a1c12] via-[#3d2a1c] to-[#4a3828]  text-white shadow-2xl">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-[#d4a574]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-[#cf9448]/10 blur-2xl" />

          <div className="relative grid mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Overseas Dentist Invitation */}
            <div className="lg:col-span-8 space-y-5">
            
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Qualified Dentist Living Abroad?
              </h2>

              <p className="text-base sm:text-lg leading-relaxed text-white/90 max-w-2xl font-light">
                PavDental holds an official UK Home Office sponsor licence. We provide full Skilled Worker Visa sponsorship, relocation support, and dedicated mentoring to help international dentists transition smoothly into UK practice.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <CheckCircle2 className="size-4 text-[#d4a574]" />
                  </div>
                  <span className="text-sm text-white/95">Certificate of Sponsorship (CoS) provided</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <CheckCircle2 className="size-4 text-[#d4a574]" />
                  </div>
                  <span className="text-sm text-white/95">Relocation & housing support</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <CheckCircle2 className="size-4 text-[#d4a574]" />
                  </div>
                  <span className="text-sm text-white/95">GDC & Performer Number guidance</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <ShieldCheck className="size-4 text-[#d4a574]" />
                  </div>
                  <span className="text-sm text-white/95">Licensed Home Office sponsor</span>
                </div>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
              <div className="rounded-xl border border-white/20 bg-white/10 p-8 w-full text-center space-y-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/15 mx-auto">
                  <Plane className="size-8 text-[#d4a574]" />
                </div>
                <p className="font-display text-xl font-bold text-white">Relocate to the UK</p>
                <p className="text-sm text-white/80">Begin your UK dental career at PavDental</p>
                <button
                  onClick={onApplySponsorship}
                  className="w-full h-12 rounded-xl bg-white text-[#2a1c12] hover:bg-[#faf6f0] font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Apply for Sponsorship</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

