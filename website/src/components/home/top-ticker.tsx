import { Clock, Phone, ShieldCheck, Sparkles, Stethoscope, Truck } from "lucide-react";
import { useState } from "react";
import { Pause, Play } from "lucide-react";

const ITEMS = [
  { icon: Clock, text: "Open 00:00 – 24:00, 7 days" },
  { icon: ShieldCheck, text: "GDC registered clinicians" },
  { icon: Stethoscope, text: "£35 complete dental check-up" },
  { icon: Phone, text: "24/7 emergency dental care" },
  { icon: Truck, text: "Mobile dentistry across Bradford" },
  { icon: Sparkles, text: "Free online appointment booking" },
] as const;

/** The thin benefits ticker above the header (Hims "Why Hims?" bar). It has a pause button and stands still for reduced motion. */
export function TopTicker() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="flex h-[31px] items-center gap-2 bg-[#f7f4ee] pr-3 pl-4 text-[13px] text-fg md:h-[31px]">
      <div className="relative min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto">
        <ul
          className={
            "flex w-max items-center gap-16 motion-safe:animate-[marquee_45s_linear_infinite]" +
            (paused ? " [animation-play-state:paused]" : "")
          }
        >
          {[0, 1].map((copy) =>
            ITEMS.map(({ icon: Icon, text }) => (
              <li
                key={`${copy}-${text}`}
                aria-hidden={copy === 1 ? true : undefined}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon aria-hidden className="size-3.5 shrink-0" />
                <span>{text}</span>
              </li>
            )),
          )}
        </ul>
      </div>
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? "Play scrolling benefits" : "Pause scrolling benefits"}
        onClick={() => setPaused((v) => !v)}
        className="grid size-6 shrink-0 place-items-center rounded-full text-fg t-colors hover:bg-black/5 motion-reduce:hidden"
      >
        {paused ? (
          <Play aria-hidden className="size-3" />
        ) : (
          <Pause aria-hidden className="size-3" />
        )}
      </button>
    </div>
  );
}
