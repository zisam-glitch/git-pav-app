import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";

export function OralHygieneHero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] min-h-screen overflow-hidden bg-bg pt-16 border-b border-[#e8ddd0] flex items-center"
      aria-label="Professional dental hygiene services"
    >
      {/* Background layer with subtle kenburns and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=85"
          alt="Dental hygiene consultation at Pav Dental"
          className="kenburns h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/40" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto w-full min-h-[calc(100svh-4rem)] max-w-6xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <p className="mb-4 text-xs font-medium text-primary">
          Professional dental hygiene
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-medium sm:text-5xl lg:text-6xl text-[#2a1c12]">
          Keep your smile <span className="text-primary">healthy & bright</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg leading-relaxed">
          Comprehensive dental hygiene services including professional cleaning, scaling, polishing, and preventative care to maintain optimal oral health.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="accent-gradient text-white rounded-full px-8 font-bold shadow-sm hover:opacity-95"
          >
            <a href="#importance">Learn more</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-7 border-[#925a27] text-[#925a27] bg-white text-sm font-semibold hover:bg-[#faf6f0]"
          >
            <a href="#pricing">View prices</a>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <li>Professional cleaning</li>
          <li>Gum disease prevention</li>
          <li>Oral health education</li>
        </ul>
      </div>
    </section>
  );
}