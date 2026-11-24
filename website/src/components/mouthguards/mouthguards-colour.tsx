import { useState } from "react";
import { BookButton, ButtonLink, Heading, Section, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FINISH_OPTIONS = [
  "Single colour",
  "Two colour combinations",
  "Mixed colours",
  "Glitter and special finishes",
] as const;

const COLOR_FILTERS = [
  { name: "Original Pink", filter: "none" },
  { name: "Hot Pink", filter: "hue-rotate(350deg) saturate(1.3)" },
  { name: "Light Pink", filter: "hue-rotate(350deg) saturate(0.8) brightness(1.2)" },
  { name: "Deep Pink", filter: "hue-rotate(350deg) saturate(1.4) brightness(0.85)" },
  { name: "Red", filter: "hue-rotate(0deg) saturate(1.2)" },
  { name: "Dark Red", filter: "hue-rotate(0deg) saturate(1.5) brightness(0.7)" },
  { name: "Coral", filter: "hue-rotate(10deg) saturate(1.2)" },
  { name: "Orange", filter: "hue-rotate(30deg) saturate(1.3)" },
  { name: "Yellow", filter: "hue-rotate(60deg) saturate(1.4) brightness(1.15)" },
  { name: "Gold", filter: "hue-rotate(45deg) saturate(1.5) brightness(1.2)" },
  { name: "Lime", filter: "hue-rotate(90deg) saturate(1.3) brightness(1.1)" },
  { name: "Green", filter: "hue-rotate(120deg) saturate(1.2)" },
  { name: "Forest", filter: "hue-rotate(120deg) saturate(1.4) brightness(0.75)" },
  { name: "Teal", filter: "hue-rotate(205deg) saturate(1.1)" },
  { name: "Cyan", filter: "hue-rotate(220deg) saturate(1.2)" },
  { name: "Sky Blue", filter: "hue-rotate(235deg) saturate(1.1) brightness(1.1)" },
  { name: "Blue", filter: "hue-rotate(250deg) saturate(1.3)" },
  { name: "Navy", filter: "hue-rotate(255deg) saturate(1.5) brightness(0.65)" },
  { name: "Royal Blue", filter: "hue-rotate(260deg) saturate(1.4) brightness(0.8)" },
  { name: "Purple", filter: "hue-rotate(280deg) saturate(1.2)" },
  { name: "Violet", filter: "hue-rotate(295deg) saturate(1.3)" },
  { name: "Magenta", filter: "hue-rotate(325deg) saturate(1.4)" },
  { name: "Fuchsia", filter: "hue-rotate(315deg) saturate(1.5)" },
  { name: "Lavender", filter: "hue-rotate(280deg) saturate(0.7) brightness(1.2)" },
  { name: "Maroon", filter: "hue-rotate(340deg) saturate(1.3) brightness(0.75)" },
  { name: "Brown", filter: "hue-rotate(25deg) saturate(0.8) brightness(0.7)" },
  { name: "Bronze", filter: "hue-rotate(25deg) saturate(1.2) brightness(0.85)" },
  { name: "Copper", filter: "hue-rotate(15deg) saturate(1.4) brightness(0.8)" },
  { name: "Silver", filter: "saturate(0.15) brightness(1.4)" },
  { name: "Gray", filter: "grayscale(1) brightness(0.9)" },
  { name: "Black", filter: "brightness(0.2)" },
  { name: "White", filter: "brightness(1.8) contrast(0.9)" },
] as const;

export function MouthguardsColour() {
  const [selectedColor, setSelectedColor] = useState<(typeof COLOR_FILTERS)[number]>(
    COLOR_FILTERS[0],
  );
  const [selectedFinish, setSelectedFinish] = useState<(typeof FINISH_OPTIONS)[number]>(
    FINISH_OPTIONS[0],
  );

  return (
    <Section id="colour" theme="white" aria-labelledby="mouthguards-colour-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            32-Colour Custom Configurator
          </span>
          <div id="mouthguards-colour-heading" className="mt-4">
            <Heading size="h2-md" accent="Colour" tone="terracotta" inline>
              Choose Your
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">
            You can choose from a variety of colour options, including single colour, two colour
            combinations, mixed colours, or glitter and special finishes for a more unique look.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Finish style">
          {FINISH_OPTIONS.map((finish) => (
            <Button
              key={finish}
              type="button"
              size="sm"
              variant={selectedFinish === finish ? "default" : "outline"}
              aria-pressed={selectedFinish === finish}
              onClick={() => setSelectedFinish(finish)}
            >
              {finish}
            </Button>
          ))}
        </div>
      </div>

      <Tile tone="white" className="mt-8 border border-border p-5 md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-tile-cream p-2.5">
              <img
                src="/media/mg.png"
                alt={`${selectedColor.name} custom mouthguard preview`}
                className="size-full object-contain"
                style={{ filter: selectedColor.filter }}
              />
            </div>
            <div>
              <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3 py-0.5 text-caption font-medium text-copper">
                {selectedFinish}
              </span>
              <p className="mt-2 text-h3-md text-fg">{selectedColor.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <BookButton size="sm">Make an Appointment</BookButton>
            <ButtonLink href="#contact" variant="outline" size="sm">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </Tile>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {COLOR_FILTERS.map((color) => {
          const isSelected = selectedColor.name === color.name;
          return (
            <button
              key={color.name}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-xl border bg-white p-2.5 text-center t-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-black ring-2 ring-black shadow-card"
                  : "border-border hover:border-border-strong",
              )}
            >
              <span className="block aspect-square w-full overflow-hidden rounded-lg bg-tile-cream p-1.5">
                <img
                  src="/media/mg.png"
                  alt={`${color.name} custom mouthguard swatch`}
                  loading="lazy"
                  className="size-full object-contain t-zoom"
                  style={{ filter: color.filter }}
                />
              </span>
              <span className="text-caption font-medium text-fg">{color.name}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
