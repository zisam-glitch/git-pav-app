import React from "react";
import { CalendarDays, Phone, MapPin, Clock, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL } from "@/lib/enquiry";

const REASONS = [
  "GDC-registered surgical dental team",
  "Sedation available for anxious patients",
  "Same-day emergency slots, 7 days a week",
  "Full aftercare and 30-day follow-up included",
  "0% finance on treatments over £250",
];

export function ExtractionBook() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0] border-b border-[#e2d4c0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
              Book Your Appointment Today
            </h2>
            <p className="mt-5 text-[#6b5848] leading-relaxed max-w-md text-sm sm:text-base">
              Dental pain should never be put off. Our team is ready to see
              you today — call or book online to secure your slot.
            </p>

            <ul className="mt-6 space-y-2.5 mb-8">
              {REASONS.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-[#2a1c12]">
                  <span className="size-5 rounded-md accent-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="size-3 text-white stroke-[3]" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Phone, label: "0800 1938 786" },
                { icon: MapPin, label: "786 Leeds Road, Bradford, BD3 9TY" },
                { icon: Clock, label: "Mon–Sat 8:00am – 7:00pm · Sun 10:00am – 4:00pm" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-[#f0e8dc] flex items-center justify-center">
                    <Icon className="size-4 text-[#925a27]" />
                  </div>
                  <span className="text-sm text-[#2a1c12] font-medium">{label}</span>
                </div>
              ))}
            </div>

            <Button
              asChild
              className="accent-gradient rounded-full px-10 h-12 text-white font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <a href={BOOKING_URL} className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                Book Appointment Now
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
