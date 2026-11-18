import React from "react";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/home/spotlight";

interface ShopHeroProps {
  onCategorySelect?: (category: string) => void;
}

export function ShopHero({ onCategorySelect }: ShopHeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#faf6f0] border-b border-[#e2d4c0] py-20 sm:py-28"
      aria-label="Shop dental products"
    >
      {/* Background layer with subtle gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/media/hero-clinic.jpg"
          alt="Pav Dental Bradford clinic interior"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf6f0] via-[#faf6f0]/95 to-[#faf6f0]/80" />
      </div>

      <Spotlight />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
       <div className='pt-16'></div>
        <h1 className="max-w-2xl mx-auto font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
          Designed by <span className="text-[#925a27]">Dentists</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-base text-[#6b5848] sm:text-lg leading-relaxed">
          Elevate your daily smile routine with professional teeth whitening, acoustic sonic brushes, and custom at-home impression kits delivered directly from our clinic in Bradford.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#925a27] hover:bg-[#7a491e] text-white rounded-full px-8 font-bold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2"
          >
            <a href="#catalog">Browse Products</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-7 border-[#925a27] text-[#925a27] bg-white text-sm font-semibold hover:bg-[#faf6f0] transition-colors focus-visible:outline-2 focus-visible:outline-[#925a27] focus-visible:outline-offset-2"
          >
            <a href="#guarantee">Our Guarantee</a>
          </Button>
        </div>
        
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#6b5848]">
          <li className="hover:text-[#925a27] transition-colors">Free UK delivery</li>
          <li className="hover:text-[#925a27] transition-colors">Dentist-formulated</li>
          <li className="hover:text-[#925a27] transition-colors">100% satisfaction guarantee</li>
        </ul>
      </div>
    </section>
  );
}