import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";
import { BOOKING_URL } from "@/lib/enquiry";

export function VirtualDentistryHero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] min-h-screen overflow-hidden bg-bg pt-16   flex items-center"
      aria-label="Virtual dentistry services"
    >
      {/* Background layer with subtle kenburns and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85"
          alt="Virtual dental video consultation"
          className="kenburns h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto w-full min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <div className="inline-block bg-[#925a27] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
          No Appointment Or Insurance Required
        </div>
        <h1 className="max-w-2xl font-display text-4xl font-medium sm:text-5xl lg:text-6xl text-[#2a1c12]">
          Affordable <span className="text-primary">Healthcare Services</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg leading-relaxed">
          £35 Consultation Fee and £25 Prescription Cost. Quality medical advice and prescriptions at budget-friendly prices to ensure your health needs are met without breaking the bank.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="accent-gradient text-white rounded-full px-8 font-bold shadow-sm hover:opacity-95"
          >
            <a href={BOOKING_URL}>Book appointment</a>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <li>Virtual consultations</li>
          <li>Online prescriptions</li>
          <li>24/7 availability</li>
          <li>Home delivery options</li>
        </ul>
      </div>
    </section>
  );
}