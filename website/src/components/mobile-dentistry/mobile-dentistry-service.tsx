import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

export function MobileDentistryService() {
  return (
    <section className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Mobile surgery
            </p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
              We Come <span className="text-[#754B3D]">to You</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-black/65">
              We have a modern, well-equipped mobile surgery that allows us to visit you in the
              comfort of your own home. Our mobile unit brings comprehensive dental services
              directly to your doorstep.
            </p>
            <p className="mt-4 text-base leading-relaxed text-black/65">
              With many combined years of dental experience in both traditional and mobile
              dentistry, along with the latest technology and equipment, we aim to provide every
              patient with attentive, comfortable care.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  Make an appointment <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#F2EDE5] shadow-[0_10px_32px_rgba(0,0,0,0.06)]">
            <img
              src="/media/hims/mobile-van-editorial.jpg"
              alt="Mobile dental surgery"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="bg-[#1B3745] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
                  Mobile Surgery
                </p>
                <p className="mt-1 text-sm text-white/90">
                  Fully equipped for comprehensive dental care at your doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
