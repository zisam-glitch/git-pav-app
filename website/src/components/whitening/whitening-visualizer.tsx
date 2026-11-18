import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { VITA_SHADES } from "./whitening-data";

// Picks readable text color against a given shade's fill.
function getReadableTextColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#221c16" : "#fbf8f2";
}

export function WhiteningVisualizer() {
  const [shadeIndex, setShadeIndex] = useState(5); // Default to B1 (Pearl Bright)
  const currentShade = VITA_SHADES[shadeIndex];
  const isCustomSuite = shadeIndex >= 5;

  return (
    <section id="shade-visualizer" className="py-20 sm:py-28 bg-[#fdfaf5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
          <div className="max-w-xl mb-14">
            <h2 className="font-display text-3xl sm:text-5xl leading-[1.1] font-semibold text-[#221c16]">
              Find your shade before your first tray
            </h2>
            <p className="text-[#5b4f44] mt-4 text-base leading-relaxed max-w-md">
              Every whitening plan starts with a shade match. Move through the
              fan deck below the way your dentist would, and we'll match you to
              the system built for your starting point.
            </p>
          </div>

          {/* Shade fan deck */}
          <div
            role="group"
            aria-label="Select your current tooth shade"
            className="relative"
          >
            <div className="flex items-end gap-[3px] sm:gap-1.5 overflow-x-auto pb-4">
              {VITA_SHADES.map((s, idx) => {
                const selected = idx === shadeIndex;
                const textColor = getReadableTextColor(s.color);
                return (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setShadeIndex(idx)}
                    aria-pressed={selected}
                    aria-label={`Shade ${s.code}, ${s.name}`}
                    style={{
                      backgroundColor: s.color,
                      height: selected ? "108px" : "76px",
                    }}
                    className={`group relative flex-shrink-0 w-7 sm:w-9 rounded-t-[3px] border border-b-0 border-[#d8c5af]/70 transition-[height] duration-200 ease-out flex flex-col justify-end items-center pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29463b] ${selected
                      ? "shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-10"
                      : "opacity-90 hover:opacity-100"
                      }`}
                  >
                    <span
                      className="text-[9px] sm:text-[10px] font-mono font-medium"
                      style={{ color: textColor }}
                    >
                      {s.code}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
        <div className="h-px bg-[#221c16]/15 w-full" />

        <div className="flex justify-between text-[11px] text-[#6b5848] mt-2">
          <span>Deepest stain</span>
          <span>Brightest white</span>
        </div>
        {/* Readout */}
        <div className="mt-12 grid sm:grid-cols-[1fr_auto_1fr] gap-8 sm:gap-10 items-start">
          <div>
            <p className="text-sm text-[#6b5848]">
              Shade {shadeIndex + 1} of {VITA_SHADES.length}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-sm text-[#8a5a2a] font-medium">
                {currentShade.code}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#221c16]">
                {currentShade.name}
              </h3>
            </div>
            <p className="text-sm text-[#5b4f44] mt-2 leading-relaxed max-w-xs">
              {currentShade.desc}
            </p>
          </div>

          <div className="hidden sm:block w-px bg-[#221c16]/10 self-stretch" />

          <div>
            <p className="text-sm text-[#6b5848]">Recommended system</p>
            <p className="font-display text-xl sm:text-2xl font-semibold text-[#29463b] mt-1">
              {isCustomSuite ? "Custom Home Suite" : "Home UV LED Kit"}
            </p>
            <p className="text-sm text-[#5b4f44] mt-1">
              {isCustomSuite ? "£295" : "£99"} · expected lift of{" "}
              {currentShade.step + 1} shades
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-12 pt-8 border-t border-[#221c16]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-[#5b4f44] max-w-sm">
            Dentist-fitted trays seal against your gum line, so gel stays on
            enamel and off soft tissue.
          </p>
          <Button
            asChild
            className="bg-[#29463b] hover:bg-[#1f362e] text-white rounded-full px-7 h-11 text-sm font-medium shadow-none w-full sm:w-auto"
          >
            <a href="#comparison-matrix">
              Get fitted for shade {currentShade.code}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}