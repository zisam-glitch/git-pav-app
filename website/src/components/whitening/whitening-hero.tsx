import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

export function WhiteningHero() {
  return (
    <section className="pt-4 pb-8 sm:pt-8 sm:pb-12" aria-label="Teeth whitening">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-tile-warm relative overflow-hidden rounded-[1.5rem] border border-black/6">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-medium text-[#1B3745] border border-black/6">
                <Sparkles className="size-3.5 text-[#754B3D]" />
                Teeth whitening in Bradford
              </span>
              <h1 className="mt-5 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl lg:text-[3.75rem]">
                Designed by dentists,{" "}
                <span className="text-[#754B3D]">developed for you</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
                We offer a carefully curated selection of whitening ranges designed to effectively
                remove stains and discoloration, giving you the confidence to flash your pearly
                whites.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={BOOKING_URL}>
                    Book Now
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#comparison-matrix">Compare treatments</a>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 max-w-md border-t border-black/8 pt-6">
                <div>
                  <p className="text-xs text-black/50">Strips</p>
                  <p className="mt-0.5 font-display text-xl text-black">£65</p>
                </div>
                <div>
                  <p className="text-xs text-black/50">Home kit</p>
                  <p className="mt-0.5 font-display text-xl text-black">£295</p>
                </div>
                <div>
                  <p className="text-xs text-black/50">Home &amp; In Office</p>
                  <p className="mt-0.5 font-display text-xl text-[#754B3D]">£495</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-black/6 bg-white p-3 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-[#F2EDE5]">
                  <img
                    src="https://res.cloudinary.com/db1i46uiv/image/upload/v1717833609/Untitled_514_x_411_px_2000_x_1600_px_1_likgak.png"
                    alt="Pav Dental dentist-crafted teeth whitening range"
                    className="size-full object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between px-2 pb-1 text-xs text-black/60">
                  <span>Award Winning Whitening</span>
                  <span className="font-medium text-[#1B3745]">Informed Consent Included</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
