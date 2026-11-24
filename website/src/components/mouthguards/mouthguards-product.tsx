import { useState } from "react";
import { BookButton, ButtonLink, CallButton, Section } from "@/components/hims";
import { cn } from "@/lib/utils";
import { COLOR_FILTERS, FINISH_OPTIONS, PERSONALISATION_OPTIONS } from "./mouthguards-colours";

const HERO = "/images/generated/mouthguards-hero.jpg";
const GUARD = "/media/mg.png";

/**
 * The Hims product-detail opening (hims.com/hair-loss/minoxidil): a tall rounded gallery on the
 * left whose guard changes colour as you pick, and a panel on the right with the option groups
 * (finish, colour, personalisation) ending in the booking buttons instead of "Add to cart".
 */
export function MouthguardsProduct() {
  const [color, setColor] = useState<(typeof COLOR_FILTERS)[number]>(COLOR_FILTERS[0]);
  const [finish, setFinish] = useState<(typeof FINISH_OPTIONS)[number]>(FINISH_OPTIONS[0]);
  const [view, setView] = useState<"guard" | "photo">("guard");
  const [optionId, setOptionId] = useState<(typeof PERSONALISATION_OPTIONS)[number]["id"]>("name");
  const [text, setText] = useState("");
  const option = PERSONALISATION_OPTIONS.find((o) => o.id === optionId) ?? PERSONALISATION_OPTIONS[0];

  return (
    <Section
      id="top"
      theme="white"
      space="none"
      className="pt-6 pb-14 md:pt-10 md:pb-20"
      aria-label="Custom sports mouthguards"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <div className="relative grid aspect-[4/3.6] place-items-center overflow-hidden rounded-[28px] bg-[#f1e8e1]">
            {view === "guard" ? (
              <img
                src={GUARD}
                alt={`${color.name} custom mouthguard preview`}
                className="size-[62%] object-contain drop-shadow-[0_24px_30px_rgba(60,40,30,0.18)]"
                style={{ filter: color.filter }}
              />
            ) : (
              <img
                src={HERO}
                alt="Custom sports mouthguard on a warm cream tray in soft studio light"
                className="size-full object-cover"
              />
            )}
            {text.trim() && view === "guard" ? (
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-4 py-1.5 text-[15px] font-medium text-[#2a2a2c] backdrop-blur">
                {text.trim()}
              </span>
            ) : null}
          </div>
          <ul className="mt-4 flex list-none justify-center gap-3" aria-label="Gallery">
            {(
              [
                ["guard", GUARD, "Colour preview"],
                ["photo", HERO, "Studio photo"],
              ] as const
            ).map(([id, src, label]) => (
              <li key={id}>
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={view === id}
                  onClick={() => setView(id)}
                  className={cn(
                    "size-16 overflow-hidden rounded-full bg-[#f1e8e1] ring-offset-2 t-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                    view === id ? "ring-2 ring-black" : "opacity-80 hover:opacity-100",
                  )}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Option panel */}
        <div>
          <span className="inline-block rounded-full bg-[#8a4242] px-3 py-1 text-[13px] font-medium text-white">
            Athletic &amp; Everyday Oral Protection
          </span>
          <h1 className="mt-4 text-[clamp(38px,4.4vw,60px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#2a2a2c]">
            Custom Sports Mouthguards
          </h1>
          <p className="mt-4 text-[19px] font-medium text-[#2a2a2c]">
            Designed for comfort, accuracy and full protection
          </p>
          <p className="mt-3 text-lead text-muted">
            At Pav Dental, you can order a high quality custom mouthguard in the way that suits you
            best. Every mouthguard is created using precise digital or physical impressions with
            full control over colour, style and custom features.
          </p>

          <div id="colour" className="mt-8 scroll-mt-28">
            <h2 className="text-[15px] font-medium text-[#2a2a2c]">Choose Your Colour</h2>
            <p className="mt-1 text-small text-muted">
              You can choose from a variety of colour options, including single colour, two colour
              combinations, mixed colours, or glitter and special finishes for a more unique look.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Finish style">
              {FINISH_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={finish === f}
                  onClick={() => setFinish(f)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-[16px] border px-4 py-3.5 text-left text-[15px] t-colors",
                    finish === f
                      ? "border-black bg-white shadow-[0_0_0_1px_#000]"
                      : "border-[#dcdcd8] bg-white hover:border-[#9a9a96]",
                  )}
                >
                  <span>{f}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border",
                      finish === f ? "border-black bg-black text-white" : "border-[#c9c9c5]",
                    )}
                  >
                    {finish === f ? "✓" : ""}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-5 text-[14px] text-muted">
              Colour: <span className="font-medium text-[#2a2a2c]">{color.name}</span>
            </p>
            <ul className="mt-2 flex list-none flex-wrap gap-2" aria-label="Colour swatches">
              {COLOR_FILTERS.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    aria-label={c.name}
                    aria-pressed={color.name === c.name}
                    title={c.name}
                    onClick={() => {
                      setColor(c);
                      setView("guard");
                    }}
                    className={cn(
                      "size-9 overflow-hidden rounded-full bg-[#f1e8e1] ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                      color.name === c.name ? "ring-2 ring-black" : "hover:ring-2 hover:ring-black/30",
                    )}
                  >
                    <img
                      src={GUARD}
                      alt=""
                      loading="lazy"
                      className="size-full scale-125 object-contain"
                      style={{ filter: c.filter }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div id="personalisation" className="mt-8 scroll-mt-28 border-t border-[#e6e6e2] pt-6">
            <h2 className="text-[15px] font-medium text-[#2a2a2c]">Add Personalisation</h2>
            <p className="mt-1 text-small text-muted">
              Personalise your mouthguard with your name, initials, team name, number, or even a
              custom logo if required.
            </p>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Personalisation type">
              {PERSONALISATION_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={optionId === o.id}
                  onClick={() => setOptionId(o.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[14px] t-colors",
                    optionId === o.id
                      ? "border-black bg-black text-white"
                      : "border-[#dcdcd8] bg-white hover:border-[#9a9a96]",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <label htmlFor="mg-personalisation-input" className="sr-only">
              {option.label}
            </label>
            <input
              id="mg-personalisation-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={option.placeholder}
              className="mt-3 w-full rounded-[16px] border border-[#dcdcd8] bg-white px-4 py-3.5 text-[15px] focus-visible:border-black focus-visible:outline-none"
            />
          </div>

          <div className="mt-8 grid gap-3">
            <BookButton size="lg" className="w-full justify-center">
              Make an Appointment
            </BookButton>
            <ButtonLink href="#contact" variant="outline" size="lg" className="w-full justify-center">
              Contact us
            </ButtonLink>
            <CallButton variant="ghost" />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
            <a href="#ordering" className="underline underline-offset-4 t-colors hover:text-terracotta">
              How to Order Your Mouthguard
            </a>
            <a href="#users" className="underline underline-offset-4 t-colors hover:text-terracotta">
              Who Can Use Our Mouthguards
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
