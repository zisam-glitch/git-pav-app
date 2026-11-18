import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";
import { BOOKING_URL } from "@/lib/enquiry";
import { PRODUCTS_DATA } from "./whitening-data";

export function WhiteningProducts() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Whitening options
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Award-winning{" "}
            <span className="text-[#754B3D]">whitening treatments</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/65">
            Experience our award-winning whitening treatments for a brilliantly radiant smile.
            Discover the difference of our dentist-curated whitening services today.
          </p>
        </Reveal>

        <div className="mt-14 space-y-10 sm:space-y-14">
          {PRODUCTS_DATA.map((product, i) => {
            const flip = i % 2 === 1;
            const tileClass = i % 2 === 0 ? "hims-tile-warm" : "hims-tile-sage";
            return (
              <Reveal key={product.id} delay={0.04 * i}>
                <div className="grid items-center gap-8 rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-10 lg:grid-cols-2 lg:gap-14">
                  <div className={flip ? "lg:order-2" : "lg:order-1"}>
                    <div className={`${tileClass} overflow-hidden rounded-[1.25rem] border border-black/6 p-3`}>
                      <div className="aspect-[4/3] overflow-hidden rounded-[1rem] bg-white">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={flip ? "lg:order-1" : "lg:order-2"}>
                    <div className="flex flex-wrap gap-2">
                      {product.formats.map((format) => (
                        <span
                          key={format}
                          className="rounded-full bg-[#F2EDE5] px-3 py-1 text-xs font-medium text-[#1B3745]"
                        >
                          {format}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-4 font-display text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">
                      {product.name}
                    </h3>

                    <p className="mt-2 font-display text-3xl font-normal tracking-[-0.03em] text-[#754B3D]">
                      {product.price}
                    </p>

                    <p className="mt-4 text-base leading-relaxed text-black/65">
                      {product.description}
                    </p>

                    <ul className="mt-6 divide-y divide-black/8 border-t border-black/8">
                      {product.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-3 py-3 text-sm text-black/85">
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-black text-white">
                            <Check className="size-3" />
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button asChild>
                        <a href={BOOKING_URL}>
                          Book Now
                          <ArrowRight className="size-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
