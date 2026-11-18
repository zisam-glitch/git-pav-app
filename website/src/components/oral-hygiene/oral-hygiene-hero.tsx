import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

export function OralHygieneHero() {
  return (
    <section className="pt-4 pb-8 sm:pt-8 sm:pb-12" aria-label="Pav Dental Oral Hygiene Care">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-tile-sage relative overflow-hidden rounded-[1.5rem] border border-black/6">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/6 bg-white px-3.5 py-1 text-xs font-medium text-[#1B3745]">
                <Shield className="size-3.5 text-[#1B3745]" />
                Preventative dental care
              </span>
              <h1 className="mt-5 max-w-xl font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-black sm:text-5xl lg:text-[3.75rem]">
                Pav Dental{" "}
                <span className="text-[#754B3D]">Oral Hygiene Care</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-black/65 sm:text-lg">
                Healthy gums and a clean mouth are essential for a confident smile, fresh breath,
                and long-lasting teeth. We combine gentle hygiene treatment with tailored home care
                advice so every patient understands how to protect their teeth for life.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={BOOKING_URL}>
                    Make an Appointment
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="/contact-us">Contact us</a>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 max-w-md border-t border-black/8 pt-6">
                <div>
                  <p className="text-xs text-black/50">Polish Only</p>
                  <p className="mt-0.5 font-display text-xl text-black">£45</p>
                </div>
                <div>
                  <p className="text-xs text-black/50">Scale Only</p>
                  <p className="mt-0.5 font-display text-xl text-black">£65</p>
                </div>
                <div>
                  <p className="text-xs text-black/50">Scale &amp; Polish</p>
                  <p className="mt-0.5 font-display text-xl text-[#754B3D]">£75</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-black/6 bg-white p-3 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-[#F2EDE5]">
                  <img
                    src="/media/hims/suite-editorial.jpg"
                    alt="Dental hygiene consultation at Pav Dental"
                    className="size-full object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between px-2 pb-1 text-xs text-black/60">
                  <span>Gentle scale, polish &amp; gum care</span>
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
