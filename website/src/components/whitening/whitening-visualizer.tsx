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
    <Section id="shade-visualizer" theme="white">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-xl">
          <Heading size="h2-md" accent="shade guide" tone="terracotta" inline>
            Explore our
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Move through the shade guide to see which of our three dentist-developed whitening
            ranges best matches your smile goals.
          </p>
        </div>

        <div
          role="group"
          aria-label="Select your current tooth shade"
          className="overflow-x-auto pb-2"
        >
          <div className="flex items-end gap-1.5">
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
                    height: selected ? "108px" : "76px",
                  }}
                  className={cn(
                    "flex w-9 shrink-0 flex-col items-center justify-end rounded-t-md border pb-2 transition-[height,border-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:w-10",
                    selected
                      ? "z-10 border-black shadow-card"
                      : "border-border-strong/50 opacity-90 hover:opacity-100",
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

      <div className="mt-4 flex justify-between border-t border-border pt-2 text-small text-muted">
        <span>Deeper shade</span>
        <span>Brighter shade</span>
      </div>

      <Tile tone="cream" className="mt-8 p-6 md:p-8">
        <div className="grid items-start gap-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-small text-muted">
              Shade {shadeIndex + 1} of {VITA_SHADES.length}
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="rounded-pill border border-border bg-white px-3 py-0.5 text-small font-medium text-fg tabular-nums">
                {currentShade.code}
              </span>
              <h3 className="text-h3-md text-fg">{currentShade.name}</h3>
            </div>
            <p className="mt-3 max-w-md text-body text-muted">{currentShade.desc}</p>
          </div>

          <div className="border-t border-border pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <p className="text-small text-muted">Suggested whitening range</p>
            <p className="mt-2 text-h3-md text-fg">
              {recommended.name} — <span className="tabular-nums">{recommended.price}</span>
            </p>
            <p className="mt-2 text-small text-muted">
              {recommended.tags.join(" · ")}. Final shade assessment and suitability are confirmed
              by your dentist at your appointment.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <BookButton>Book Now</BookButton>
              <ButtonLink href="#comparison-matrix" variant="outline">
                Compare treatments
              </ButtonLink>
            </div>
          </div>
        </div>
      </Tile>
    </Section>
  );
}
