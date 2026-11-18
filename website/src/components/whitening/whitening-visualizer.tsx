import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";
import { VITA_SHADES } from "./whitening-data";

function getReadableTextColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1B3745" : "#FBF8F5";
}

export function WhiteningVisualizer() {
  const [shadeIndex, setShadeIndex] = useState(2);
  const currentShade = VITA_SHADES[shadeIndex]!;
  const needsInOffice = shadeIndex <= 2;
  const needsHomeKit = shadeIndex > 2 && shadeIndex <= 5;

  const recommended = needsInOffice
    ? { name: "Home & In Office Whitening", price: "£495", note: "6% Hydrogen Peroxide + PAP in-clinic session paired with BEAM take-home kit" }
    : needsHomeKit
      ? { name: "Home Teeth Whitening", price: "£295", note: "UK-made dentist gel with potassium nitrate, calcium & fluoride" }
      : { name: "Whitening Strips", price: "£65", note: "14 dissolving mint-flavoured applications for ongoing maintenance" };

  return (
    <section id="shade-visualizer" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                  Interactive shade guide
                </p>
                <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                  Match your shade before{" "}
                  <span className="text-[#754B3D]">your appointment</span>
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
                  Select your closest baseline shade on the guide below to see which dentist-curated
                  whitening range fits your smile goals.
                </p>
              </div>

              <div role="group" aria-label="Select your current tooth shade" className="w-full lg:w-auto">
                <div className="flex items-end gap-1.5 overflow-x-auto pb-3">
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
                          height: selected ? "112px" : "78px",
                        }}
                        className={`flex w-9 shrink-0 flex-col items-center justify-end rounded-t-xl border border-black/10 pb-2 transition-[height,box-shadow] duration-200 ease-out sm:w-11 ${
                          selected
                            ? "z-10 ring-2 ring-[#1B3745] shadow-[0_6px_18px_rgba(0,0,0,0.1)]"
                            : "opacity-90 hover:opacity-100"
                        }`}
                      >
                        <span className="font-mono text-[10px] font-medium" style={{ color: textColor }}>
                          {s.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between border-t border-black/10 pt-2 text-[11px] text-black/50">
                  <span>Deeper staining</span>
                  <span>Brightest natural shade</span>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-6 rounded-[1.25rem] bg-[#FAF8F2] border border-black/6 p-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                  Shade {shadeIndex + 1} of {VITA_SHADES.length}
                </p>
                <div className="mt-1.5 flex items-baseline gap-2.5">
                  <span className="rounded-full bg-[#F2EDE5] px-2.5 py-0.5 font-mono text-xs font-medium text-[#754B3D]">
                    {currentShade.code}
                  </span>
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black sm:text-3xl">
                    {currentShade.name}
                  </h3>
                </div>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-black/65">
                  {currentShade.desc}
                </p>
              </div>

              <div className="hidden h-16 w-px bg-black/10 sm:block" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                  Suggested range
                </p>
                <p className="mt-1.5 font-display text-2xl font-normal tracking-[-0.03em] text-[#1B3745]">
                  {recommended.name}{" "}
                  <span className="text-[#754B3D]">— {recommended.price}</span>
                </p>
                <p className="mt-1.5 text-sm text-black/65">{recommended.note}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-black/8 pt-6 sm:flex-row sm:items-center">
              <p className="max-w-md text-sm text-black/60">
                Every whitening course starts with a dental check and informed consent for tooth
                whitening so your enamel and gums stay protected.
              </p>
              <Button asChild>
                <a href={BOOKING_URL}>Book Appointment for Shade {currentShade.code}</a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
