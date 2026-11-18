import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function EmergencyBanner() {
  return (
    <section className="py-6 sm:py-10">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="hims-navy-gradient rounded-[1.5rem] px-6 py-12 text-white sm:px-10 sm:py-16">
          <div className="mx-auto flex max-w-[87rem] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <span className="inline-block rounded-full bg-white/12 px-3.5 py-1 text-xs font-medium text-[#ECD880]">
                Open 24/7 · Same-Day Emergency Appointments
              </span>
              <h2 className="mt-4 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-5xl">
                Say goodbye to your dental pain
              </h2>
              <p className="mt-3 max-w-xl text-base text-white/75">
                Book an emergency dental appointment online 24/7 or call our Bradford clinic now.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button asChild variant="gold" size="lg">
                <a href={PRACTICE_PHONE_HREF}>
                  <Phone className="size-4" />
                  Call 0800 1938 786
                </a>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a href={BOOKING_URL}>Book Online</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
