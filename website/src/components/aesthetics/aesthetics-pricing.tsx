import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";

const DERMAL_FILLERS = [
  { service: "0.5ML", price: "£100" },
  { service: "0.7ML", price: "£150" },
  { service: "1ML", price: "£250" },
  { service: "2ML", price: "£350" },
  { service: "3ML", price: "£400" },
  { service: "4ML", price: "£450" },
];

const BOTOX = [
  { service: "1 Area", price: "£180" },
  { service: "2 Areas", price: "£240" },
  { service: "3 Areas", price: "£300" },
  { service: "4 Areas", price: "£400" },
];

const OTHERS = [
  { service: "Profhilo First Dose", price: "£249" },
  { service: "Sosum Booster", price: "£160" },
];

export function AestheticsPricing() {
  return (
    <section id="pricing" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Aesthetics price list
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Transparent aesthetics{" "}
            <span className="text-[#754B3D]">pricing</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Offers and packages are available. Please enquire with our team today on{" "}
            <a href="tel:08000996375" className="font-medium text-[#1B3745] underline underline-offset-4">
              0800 099 6375
            </a>{" "}
            to find out more.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal className="h-full">
            <div className="hims-tile-warm h-full rounded-[1.5rem] border border-black/6 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
              <div className="border-b border-black/8 pb-4">
                <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                  Dermal Fillers
                </h3>
                <p className="mt-1 text-xs font-medium text-[#754B3D]">Volume &amp; contour</p>
              </div>
              <div className="divide-y divide-black/8">
                {DERMAL_FILLERS.map((row) => (
                  <div key={row.service} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="text-sm font-medium text-black/85">{row.service}</span>
                    <span className="font-display text-lg text-[#1B3745] tabular-nums">
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="h-full">
            <div className="hims-tile-sage h-full rounded-[1.5rem] border border-black/6 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
              <div className="border-b border-black/8 pb-4">
                <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                  Botox
                </h3>
                <p className="mt-1 text-xs font-medium text-[#1B3745]">Wrinkle smoothing</p>
              </div>
              <div className="divide-y divide-black/8">
                {BOTOX.map((row) => (
                  <div key={row.service} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="text-sm font-medium text-black/85">{row.service}</span>
                    <span className="font-display text-lg text-[#1B3745] tabular-nums">
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-4 rounded-[1.5rem] border border-black/6 bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
            <div className="border-b border-black/8 pb-4">
              <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                Others — Skin Boosters &amp; Bio-Remodeling
              </h3>
              <p className="mt-1 text-xs font-medium text-[#754B3D]">
                Profhilo® &amp; Sosum Booster
              </p>
            </div>
            <div className="grid gap-x-10 divide-y divide-black/8 sm:grid-cols-2 sm:divide-y-0">
              {OTHERS.map((row) => (
                <div
                  key={row.service}
                  className="flex items-center justify-between gap-4 py-3.5 sm:border-b sm:border-black/8"
                >
                  <span className="text-sm font-medium text-black/85">{row.service}</span>
                  <span className="font-display text-lg text-[#754B3D] tabular-nums">
                    {row.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href={BOOKING_URL}>
              Book Your Aesthetics Assessment
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="tel:08000996375">
              <Phone className="size-4" />
              Enquire: 0800 099 6375
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
