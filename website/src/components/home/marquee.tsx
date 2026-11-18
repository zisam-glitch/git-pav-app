import { useState } from "react";
import { Pause, Play } from "lucide-react";

const ITEMS = [
  "Emergency dental",
  "Mobile dentistry",
  "Aesthetics",
  "General care",
  "Tooth extraction",
  "Whitening",
  "Oral surgery",
  "Same-day treatment",
];

export function Marquee() {
  const [paused, setPaused] = useState(false);
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="relative flex items-center border-y border-black/6 bg-[#FBF8F5] py-4">
      <div className="min-w-0 flex-1 overflow-hidden" aria-hidden="true">
        <div className="marquee-track text-sm font-medium text-black/55" data-paused={paused}>
          {loop.map((t, i) => (
            <span key={`${t}-${i}`} className="flex items-center gap-6 whitespace-nowrap">
              {t}
              <span className="size-1 rounded-full bg-[#1B3745]" />
            </span>
          ))}
        </div>
      </div>
      <div className="shrink-0 bg-[#FBF8F5] px-3 sm:px-4">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Resume services marquee" : "Pause services marquee"}
          className="inline-flex size-8 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:bg-[#F2EDE5]"
        >
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
