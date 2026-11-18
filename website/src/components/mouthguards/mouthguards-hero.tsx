import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";
import { BOOKING_URL } from "@/lib/enquiry";

export function MouthguardsHero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] min-h-screen overflow-hidden bg-bg pt-16 border-b border-[#e8ddd0] flex items-center"
      aria-label="Custom sports mouthguards"
    >
      {/* Background layer with subtle kenburns and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=85"
          alt="Athlete wearing protective sports gear"
          className="kenburns h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto w-full min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <p className="mb-4 text-xs font-medium text-primary">
          Custom Protection
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-medium sm:text-5xl lg:text-6xl text-[#2a1c12]">
          Custom Sports <span className="text-primary">Mouthguards</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg leading-relaxed">
          Designed for comfort, accuracy and full protection. At Pav Dental, you can order a high quality custom mouthguard in the way that suits you best.
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
            <a href="#ordering">Contact us</a>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <li>Digital scan options</li>
          <li>Home mould kits</li>
          <li>Custom colours</li>
          <li>Personalisation available</li>
        </ul>
      </div>
    </section>
  );
}