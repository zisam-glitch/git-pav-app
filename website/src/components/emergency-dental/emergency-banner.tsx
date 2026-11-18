import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

export function EmergencyBanner() {
  return (
    <section className="bg-gradient-to-r from-red-700 via-red-600 to-[#b52618] text-white py-12 sm:py-16 relative overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <span className="inline-block text-xs uppercase font-extrabold text-red-200 mb-2 bg-black/20 px-3 py-1 rounded-full">
              Fast Relief · Open 24/7 · Same Day Slots
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black">
              Say Goodbye TO Your Dental Pain!
            </h2>
            <p className="mt-2 text-sm sm:text-base text-red-100/90 max-w-xl">
              Don't suffer through the night. Our friendly, caring dentists can see you in Bradford immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 flex-shrink-0">
            <Button
              asChild
              className="bg-white hover:bg-white/90 text-red-700 font-display font-black text-lg px-8 h-14 rounded-full shadow-2xl transition-transform active:scale-95"
            >
              <a href="tel:07311871456" className="flex items-center gap-2.5">
                <Phone className="size-5 fill-red-600 text-red-600" />
                Call 07311 871456
              </a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-2 border-white/50 text-white bg-black/20 hover:bg-black/35 font-bold h-14 px-6 rounded-full"
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
