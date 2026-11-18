import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

export function CosmeticHero() {
  return (
    <section className="pt-4 pb-8 sm:pt-8 sm:pb-12" aria-label="Cosmetic dentistry">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-hero-gradient relative overflow-hidden rounded-[1.5rem] text-white">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <span className="inline-flex items-center rounded-full bg-white/18 px-3.5 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
                Cosmetic dentistry in Bradford
              </span>
              <h1 className="mt-5 max-w-xl font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-white sm:text-5xl lg:text-[3.75rem]">
                Cosmetic Dentistry: Transforming smiles, changing lives
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                Welcome to your definitive guide on Cosmetic Dentistry, where science meets art to
                enhance your smile. Explore teeth whitening, porcelain veneers, and more to achieve
                a dazzling smile and transform your confidence and appearance.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-black text-white hover:bg-[#1B3745]">
                  <a href={BOOKING_URL}>
                    Book Now
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <a href="#procedures">Explore procedures</a>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/85 sm:text-sm">
                <li>GDC registered clinicians</li>
                <li>Teeth whitening &amp; veneers</li>
                <li>Financing options available</li>
              </ul>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative hidden h-[400px] overflow-hidden rounded-[1.5rem] bg-black/15 shadow-2xl lg:block">
                <img
                  src="/media/hims/card-whitening.jpg"
                  alt="Cosmetic dentistry smile design at Pav Dental"
                  className="size-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-6">
                  <p className="font-display text-lg font-normal text-white">
                    Bespoke porcelain veneers, bonding &amp; implants
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
