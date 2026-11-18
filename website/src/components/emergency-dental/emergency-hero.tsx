import { Phone, Calendar, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

export function EmergencyHero() {
  return (
    <section className="relative overflow-hidden bg-[#1f1611] text-white">
      {/* Background surgery image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1800&q=85"
          alt="Modern Emergency Dental Surgery"
          className="size-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c120c]/95 via-[#1c120c]/85 to-[#1c120c]/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left card */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 mb-6">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase text-red-400">
                24/7 Immediate Response
              </span>
            </div>

            <div className="bg-white/95 rounded-xl p-8 sm:p-10 shadow-2xl border border-white/40 text-[#2a1c12]">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#2a1c12] leading-[1.08]">
                Emergency{" "}
                <span className="text-[#c0392b]">Dentist</span>
              </h1>

              <p className="mt-4 text-base sm:text-lg font-medium text-[#6b5848] leading-relaxed">
                Covering Bradford 24 hours a day, 7 days a week — including weekends, bank holidays, and late evenings.
              </p>

              <div className="mt-6 pt-5 border-t border-[#e2d4c0]/80 grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#925a27]">Clinic Hours</p>
                    <p className="text-sm font-bold text-[#2a1c12]">24/7 Out of Hours Care</p>
                    <p className="text-xs text-[#6b5848]">Fast same-day admission</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-[#cf9448]/15 flex items-center justify-center text-[#925a27] flex-shrink-0">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-[#925a27]">Clear Rates</p>
                    <p className="text-sm font-bold text-[#2a1c12]">Transparent Pricing</p>
                    <p className="text-xs text-[#6b5848]">NHS &amp; Private emergency slots</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right action block */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-red-600 to-[#b02a1e] rounded-xl p-8 sm:p-9 shadow-2xl border border-red-400/40 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 size-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Phone className="size-6 text-white animate-pulse" />
                </div>
                <div>
                  <span className="text-xs uppercase text-white/80 font-bold">
                    Emergency Hotline
                  </span>
                  <p className="text-xs text-white/90">Immediate triage with our on-call clinician</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href="tel:07311871456"
                  className="block text-center py-3.5 px-4 rounded-xl bg-white text-red-600 font-display text-2xl font-black shadow-lg hover:bg-white/95 transition-transform active:scale-[0.98]"
                >
                  07311 871456
                </a>
                <a
                  href="tel:08001938786"
                  className="block text-center py-2.5 px-4 rounded-xl bg-black/25 text-white font-semibold text-sm hover:bg-black/35 transition-colors"
                >
                  Freephone: 0800 1938 786
                </a>
              </div>

              <Button
                asChild
                className="w-full bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl h-12 font-bold"
              >
                <a href={BOOKING_URL} className="flex items-center justify-center gap-2">
                  <Calendar className="size-4" />
                  Book Emergency Appointment
                </a>
              </Button>
            </div>

            <div className="bg-[#2a1c12]/80 rounded-xl p-4 border border-white/10 flex items-center gap-3">
              <AlertCircle className="size-5 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-white/80 leading-snug">
                <strong>Severe swelling or trauma?</strong> Call right away so we can prepare a surgical suite before you arrive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
