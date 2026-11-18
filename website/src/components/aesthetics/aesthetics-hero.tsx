import { ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

export function AestheticsHero() {
  return (
    <section className="pt-4 pb-8 sm:pt-8 sm:pb-12" aria-label="Pav Dental Aesthetics">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-tile-warm relative overflow-hidden rounded-[1.5rem] border border-black/6">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-medium text-[#1B3745] border border-black/6">
                <Crown className="size-3.5 text-[#754B3D]" />
                Pav Dental Aesthetics
              </span>
              <h1 className="mt-5 max-w-xl font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-black sm:text-5xl lg:text-[3.75rem]">
                Excellence in dental and{" "}
                <span className="text-[#754B3D]">aesthetic care</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-black/65 sm:text-lg">
                Seeking perfection? Our Bradford dental and aesthetic clinic combines medical-grade
                products with clinician-led precision for natural, refreshed results.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={BOOKING_URL}>
                    Book Now
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#pricing">View price list</a>
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/8 pt-6 text-xs font-medium text-black/65 sm:text-sm">
                <li>CQC regulated clinic</li>
                <li>Clinician-led care</li>
                <li>Strictly 18+ age policy</li>
              </ul>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-black/6 bg-white p-3 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-[#F2EDE5]">
                  <img
                    src="/media/hims/card-aesthetics.jpg"
                    alt="Pav Dental Aesthetics Clinic Treatment Suite in Bradford"
                    className="size-full object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between px-2 pb-1 text-xs text-black/60">
                  <span>Private clinical aesthetics suite</span>
                  <span className="font-medium text-[#1B3745]">Bradford, BD3 9TY</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
