import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

export function Hero() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Our Practice · Bradford
            </p>
            <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.05] text-black sm:text-5xl lg:text-6xl">
              A Legacy of Care and <span className="text-[#754B3D]">Innovation</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
              Our dental clinic isn&apos;t just about delivering exceptional oral healthcare;
              it&apos;s a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a
              passionate believer that dentistry could – and should – extend beyond traditional
              practice, providing unparalleled convenience and accessibility.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  Book Appointment
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/services">View Services</a>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
            <img
              src="/media/about.png"
              alt="Pav Dental Clinic in Bradford"
              className="aspect-[16/11] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
