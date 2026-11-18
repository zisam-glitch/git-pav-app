import React from "react";

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
  { name: "Teal", filter: "hue-rotate(150deg) saturate(1.1)" },
  { name: "Cyan", filter: "hue-rotate(165deg) saturate(1.2)" },
  { name: "Sky Blue", filter: "hue-rotate(175deg) saturate(1.1) brightness(1.1)" },
  { name: "Blue", filter: "hue-rotate(180deg) saturate(1.3)" },
  { name: "Navy", filter: "hue-rotate(180deg) saturate(1.5) brightness(0.65)" },
  { name: "Royal Blue", filter: "hue-rotate(185deg) saturate(1.4) brightness(0.8)" },
  { name: "Purple", filter: "hue-rotate(240deg) saturate(1.2)" },
  { name: "Violet", filter: "hue-rotate(255deg) saturate(1.3)" },
  { name: "Magenta", filter: "hue-rotate(300deg) saturate(1.4)" },
  { name: "Fuchsia", filter: "hue-rotate(290deg) saturate(1.5)" },
  { name: "Lavender", filter: "hue-rotate(250deg) saturate(0.7) brightness(1.2)" },
  { name: "Maroon", filter: "hue-rotate(340deg) saturate(1.3) brightness(0.75)" },
  { name: "Brown", filter: "hue-rotate(25deg) saturate(0.8) brightness(0.7)" },
  { name: "Bronze", filter: "hue-rotate(25deg) saturate(1.2) brightness(0.85)" },
  { name: "Copper", filter: "hue-rotate(15deg) saturate(1.4) brightness(0.8)" },
  { name: "Silver", filter: "saturate(0.15) brightness(1.4)" },
  { name: "Gray", filter: "grayscale(1) brightness(0.9)" },
  { name: "Black", filter: "brightness(0.2)" },
  { name: "White", filter: "brightness(1.8) contrast(0.9)" },
];

export function MouthguardsColour() {
  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
            Choose Your Colour
          </h2>
          <p className="mt-4 text-[#6b5848] text-sm sm:text-base leading-relaxed">
            You can choose from a variety of colour options for your custom mouthguard. Select your favorite colour or contact us for custom colour matching.
          </p>
        </div>

        {/* Single Colors */}
        <div className="mb-12">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {COLOR_FILTERS.map((color) => (
              <div
                key={color.name}
                className="group relative aspect-square rounded-xl shadow-sm hover:scale-105 transition-all cursor-pointer overflow-hidden bg-white"
                title={color.name}
              >
                <img
                  src="/media/mg.png"
                  alt={color.name}
                  className="w-full h-full object-cover"
                  style={{ filter: color.filter }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                  <span className="text-white text-xs font-medium">{color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}