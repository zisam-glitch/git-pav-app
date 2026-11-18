import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";
import { BOOKING_URL } from "@/lib/enquiry";

export function RootCanalHero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] min-h-screen overflow-hidden bg-bg pt-16   flex items-center"
      aria-label="Advanced root canal therapy"
    >
      {/* Background layer with subtle kenburns and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/media/hero-clinic.jpg"
          alt="Pav Dental clinical treatment room"
          className="kenburns h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto w-full min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <p className="mb-4 text-xs font-medium text-primary">
          Microscope-enhanced endodontics
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-medium sm:text-5xl lg:text-6xl text-[#2a1c12]">
          Advanced root canal therapy from <span className="text-primary">£195</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg leading-relaxed">
          Gentle, pain-free endodontic therapy designed to save your natural teeth using operating microscopes, 3D digital imaging, and flexible rotary systems in Bradford.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="accent-gradient text-white rounded-full px-8 font-bold shadow-sm hover:opacity-95"
          >
            <a href={BOOKING_URL}>Book appointment</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-7  text-[#925a27] bg-white text-sm font-semibold hover:bg-[#faf6f0]"
          >
            <a href="#pricing">View prices</a>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <li>95%+ tooth preservation</li>
          <li>100% pain-free promise</li>
          <li>Same-day emergency access</li>
        </ul>
      </div>
    </section>
  );
}
