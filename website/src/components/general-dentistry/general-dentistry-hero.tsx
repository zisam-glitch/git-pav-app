import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";

export function GeneralDentistryHero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] min-h-screen overflow-hidden bg-bg pt-16   flex items-center"
      aria-label="General dentistry services"
    >
      {/* Background layer with subtle kenburns and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85"
          alt=""
          className="kenburns h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto w-full min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-12 sm:px-6 flex flex-col justify-center items-center text-center">
        <p className="mb-4 text-xs font-medium text-primary">
          Comprehensive dental care
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-medium sm:text-5xl lg:text-6xl text-[#2a1c12]">
          General Dentistry: Your <span className="text-primary">Gateway to Lifelong Oral Health</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg leading-relaxed">
          Welcome to your guide to General Dentistry, covering check-ups to fillings. Discover how it maintains and improves your dental health for lifelong healthy smiles.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="accent-gradient text-white rounded-full px-8 font-bold shadow-sm hover:opacity-95"
          >
            <a href="#services">Our services</a>
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
          <li>Preventative care</li>
          <li>Family dentistry</li>
          <li>Comprehensive treatments</li>
        </ul>
      </div>
    </section>
  );
}