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
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[87rem]">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-black/55">
                Custom finishes
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Choose Your <span className="text-[#754B3D]">Colour</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                You can choose from a variety of colour options, including single colour, two
                colour combinations, mixed colours, or glitter and special finishes for a more
                unique look.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {COLOR_FILTERS.map((color) => (
                <div
                  key={color.name}
                  className="overflow-hidden rounded-[1.25rem] border border-black/6 bg-white p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-[#FAF8F2]">
                    <img
                      src="/media/mg.png"
                      alt={color.name}
                      className="h-full w-full object-contain p-1.5"
                      style={{ filter: color.filter }}
                    />
                  </div>
                  <p className="mt-2 truncate text-center text-xs font-medium text-black/80">
                    {color.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
