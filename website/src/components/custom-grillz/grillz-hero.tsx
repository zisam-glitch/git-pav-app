import { ArrowRight, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

export function GrillzHero() {
  return (
    <section className="pt-4 pb-8 sm:pt-8 sm:pb-12" aria-label="Custom grillz and tooth gems">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient relative overflow-hidden rounded-[1.5rem] text-white">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-1 text-xs font-medium text-[#ECD880] backdrop-blur-sm">
                <Gem className="size-3.5" />
                Custom Grillz &amp; Tooth Gems
              </span>
              <h1 className="mt-5 max-w-xl font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-white sm:text-5xl lg:text-[3.75rem]">
                Crafted for stardom,{" "}
                <span className="text-[#ECD880]">fitted by dentists</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                Pav Dental crafts unique custom grillz in gold, silver, and diamond finishes,
                emphasizing clinical fit, comfort, and individuality.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <a href={BOOKING_URL}>
                    Book Now
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <a href="#styles">Explore styles</a>
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/12 pt-6 text-xs font-medium text-white/75 sm:text-sm">
                <li>Gold, silver &amp; VVS diamond</li>
                <li>1-year guarantee</li>
                <li>Worldwide delivery</li>
              </ul>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/6 p-3">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.1rem]">
                  <img
                    src="/media/hims/grillz-editorial.jpg"
                    alt="Dentist-fitted custom grillz consultation at Pav Dental"
                    className="size-full object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between px-2 pb-1 text-xs text-white/75">
                  <span>Tailored Elegance</span>
                  <span className="font-medium text-[#ECD880]">Perfect Fit, Guaranteed</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
