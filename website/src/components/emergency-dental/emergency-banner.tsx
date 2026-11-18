import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

export function EmergencyBanner() {
  return (
    <section className="bg-[#2a1c12] text-white py-12 sm:py-16 relative overflow-hidden border-y border-[#3d2a1d]">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <span className="inline-block text-xs uppercase font-extrabold text-[#cf9448] mb-2 bg-[#372418] border border-[#523825] px-3 py-1 rounded-full">
              Fast Relief · Open 24/7 · Same Day Slots
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black">
              Say Goodbye TO Your Dental Pain!
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/85 max-w-xl">
              Don't suffer through the night. Our friendly, caring dentists can see you in Bradford immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 flex-shrink-0">
            <Button
              asChild
              className="bg-[#cf9448] hover:bg-[#c2873d] text-[#1a1a1a] font-display font-black text-lg px-8 h-14 rounded-full shadow-xl transition-transform active:scale-95"
            >
              <a href="tel:07311871456" className="flex items-center gap-2.5">
                <Phone className="size-5 fill-[#1a1a1a] text-[#1a1a1a]" />
                Call 07311 871456
              </a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-2 border-[#cf9448]/60 text-white bg-[#372418] hover:bg-[#462f20] font-bold h-14 px-6 rounded-full"
            >
              <a href={BOOKING_URL}>
                Book Online
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
