import { useState } from "react";
import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { cn } from "@/lib/utils";
import { PRODUCTS_DATA, VITA_SHADES } from "./whitening-data";

function isLightSwatch(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export function WhiteningVisualizer() {
  const [shadeIndex, setShadeIndex] = useState(5);
  const currentShade = VITA_SHADES[shadeIndex];
  const recommended =
    PRODUCTS_DATA.find((item) => item.id === currentShade.recommendedId) ?? PRODUCTS_DATA[1];

  return (
    <Section
      id="shade-visualizer"
      theme="brown"
      space="lg"
      aria-labelledby="whitening-shade-heading"
    >
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3.5 py-1 text-caption font-medium text-gold">
            Interactive VITA 8-Shade Guide
          </span>
          <div id="whitening-shade-heading" className="mt-4">
            <Heading size="h2-md" accent="shade guide" tone="gold" inline>
              Explore our
            </Heading>
          </div>
          <p className="mt-4 text-lead text-white/80">
            Move through the shade guide to see which of our three dentist-developed whitening
            ranges best matches your smile goals.
          </p>
        </div>

        <div
          role="group"
          aria-label="Select your current tooth shade"
          className="overflow-x-auto pb-2"
        >
          <div className="flex items-end gap-2">
            {VITA_SHADES.map((shade, idx) => {
              const selected = idx === shadeIndex;
              const lightText = !isLightSwatch(shade.color);
              return (
                <button
                  key={shade.code}
                  type="button"
                  onClick={() => setShadeIndex(idx)}
                  aria-pressed={selected}
                  aria-label={`Shade ${shade.code}, ${shade.name}`}
                  style={{
                    backgroundColor: shade.color,
                    height: selected ? "116px" : "80px",
                  }}
                  className={cn(
                    "flex w-10 shrink-0 flex-col items-center justify-end rounded-t-lg border pb-2.5 transition-[height,border-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:w-11",
                    selected
                      ? "z-10 border-gold ring-2 ring-gold shadow-card"
                      : "border-white/25 opacity-85 hover:opacity-100",
                  )}
                >
                  <span
                    className={cn(
                      "text-caption font-medium tabular-nums",
                      lightText ? "text-white" : "text-fg",
                    )}
                  >
                    {shade.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between border-t border-white/15 pt-3 text-small text-white/75">
        <span>Deeper shade (A4)</span>
        <span>Brighter shade (BL1)</span>
      </div>

      <Tile tone="glass" className="mt-8 border border-white/15 p-6 md:p-8">
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-gold tabular-nums">
                Shade {shadeIndex + 1} of {VITA_SHADES.length}
              </span>
              <span
                aria-hidden
                className="inline-block size-5 rounded-full border border-white/30"
                style={{ backgroundColor: currentShade.color }}
              />
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="rounded-pill border border-white/20 bg-white/10 px-3 py-0.5 text-small font-medium text-gold tabular-nums">
                {currentShade.code}
              </span>
              <h3 className="text-h3-md text-white">{currentShade.name}</h3>
            </div>
            <p className="mt-3 max-w-md text-body leading-relaxed text-white/80">
              {currentShade.desc}
            </p>
          </div>

          <div className="border-t border-white/15 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <span className="inline-flex items-center rounded-pill border border-white/15 bg-white/10 px-3 py-0.5 text-caption font-medium text-gold">
              Suggested whitening range
            </span>
            <p className="mt-3 text-h3-md text-white">
              {recommended.name} —{" "}
              <span className="text-gold tabular-nums">{recommended.price}</span>
            </p>
            <p className="mt-2 text-small leading-relaxed text-white/80">
              {recommended.tags.join(" · ")}. Final shade assessment and suitability are confirmed
              by your dentist at your appointment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <BookButton variant="gold">Book Now</BookButton>
              <ButtonLink href="#comparison-matrix" variant="glass">
                Compare treatments
              </ButtonLink>
            </div>
          </div>
        </div>
      </Tile>
    </Section>
  );
}
