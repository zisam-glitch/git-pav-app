import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";
import { BOOKING_URL } from "@/lib/enquiry";

export function CosmeticHero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] min-h-screen overflow-hidden bg-bg pt-16   flex items-center"
      aria-label="Cosmetic dentistry and smile design"
    >
      {/* Background layer with subtle kenburns and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/media/hero-smile.jpg"
          alt=""
          className="kenburns h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/30" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto grid w-full min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 text-xs font-medium text-primary">
            Aesthetic dental excellence
          </p>
          <h1 className="max-w-xl font-display text-4xl font-medium sm:text-5xl lg:text-6xl text-[#2a1c12]">
            Cosmetic dentistry &amp; bespoke <span className="text-primary">smile design</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
            Experience clinic-grade veneers, composite bonding, and digital smile makeovers tailored to your facial aesthetics by GDC-registered specialists in Bradford.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="accent-gradient text-white rounded-full px-8 font-bold shadow-sm hover:opacity-95"
            >
              <a href={BOOKING_URL}>Book consultation</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-7  text-[#925a27] bg-white text-sm font-semibold hover:bg-[#faf6f0]"
            >
              <a href="#procedures">View treatments</a>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <li>GDC registered specialists</li>
            <li>0% APR finance available</li>
            <li>Digital 3D smile preview</li>
          </ul>
        </div>

        <div className="relative hidden h-[420px] overflow-hidden rounded-xl   bg-white shadow-md lg:block">
          <img
            src="https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=85"
            alt="Modern cosmetic smile design surgery"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#2a1c12]/95 p-4 text-sm text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Bespoke porcelain &amp; composite makeovers</p>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
