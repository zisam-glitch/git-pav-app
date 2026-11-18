import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";
import { BOOKING_URL } from "@/lib/enquiry";

export function MobileDentistryHero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] min-h-screen overflow-hidden bg-bg pt-16 border-b border-[#e8ddd0] flex items-center"
      aria-label="Mobile dental care"
    >
      {/* Background layer with subtle kenburns and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1588776864544-9b2a4a7d2a4c?auto=format&fit=crop&w=1200&q=85"
          alt=""
          className="kenburns h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto w-full min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-12 sm:px-6 flex flex-col justify-center items-center text-center">
        <div className="inline-block bg-[#925a27] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
          Coming Soon
        </div>
        <h1 className="max-w-2xl font-display text-4xl font-medium sm:text-5xl lg:text-6xl text-[#2a1c12]">
          Mobile Dental Care at <span className="text-primary">Doorstep</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg leading-relaxed">
          Experience Convenient Mobile Dental Care with Comprehensive Dentistry Delivered to Your Doorstep. Pav Dental Mobile brings quality dental services to your home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="accent-gradient text-white rounded-full px-8 font-bold shadow-sm hover:opacity-95"
          >
            <a href={BOOKING_URL}>Make an Appointment</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-7 border-[#925a27] text-[#925a27] bg-white text-sm font-semibold hover:bg-[#faf6f0]"
          >
            <a href="#contact">Contact us</a>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <li>Home visits</li>
          <li>Care home services</li>
          <li>Full dental services</li>
          <li>NHS partners</li>
        </ul>
      </div>
    </section>
  );
}