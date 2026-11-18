import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";

export function MobileDentistryLocation() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Location
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            Pav Dental Mobile visits patients across the UK. Your Smile with Convenient Dental Care Right at Your Doorstep.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm  ">
            <div className="size-12 rounded-lg bg-[#cf9448]/15 text-[#925a27] flex items-center justify-center mb-4">
              <MapPin className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#2a1c12] mb-2">
              UK-Wide Service
            </h3>
            <p className="text-sm text-[#6b5848] leading-relaxed">
              We visit patients across the entire United Kingdom, bringing quality dental care to your location.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm  ">
            <div className="size-12 rounded-lg bg-[#cf9448]/15 text-[#925a27] flex items-center justify-center mb-4">
              <Phone className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#2a1c12] mb-2">
              Easy Booking
            </h3>
            <p className="text-sm text-[#6b5848] leading-relaxed">
              Simple appointment scheduling with flexible timing to suit your needs and availability.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm  ">
            <div className="size-12 rounded-lg bg-[#cf9448]/15 text-[#925a27] flex items-center justify-center mb-4">
              <Mail className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#2a1c12] mb-2">
              Contact Us
            </h3>
            <p className="text-sm text-[#6b5848] leading-relaxed">
              Reach out to discuss your mobile dental care needs and schedule your visit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}