import React from "react";
import { Check } from "lucide-react";
import { PRODUCTS_DATA } from "./whitening-data";

export function WhiteningProducts() {
  return (
    <section className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Detailed Product Specifications
          </h2>
          <p className="mt-3 text-[#6b5848] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            From daily maintenance to dental-chair transformation, discover our clinically engineered solutions.
          </p>
        </div>

        {/* Product rows */}
        <div className="space-y-16 sm:space-y-24">
          {PRODUCTS_DATA.map((product, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={product.id}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
                  flip ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image side */}
                <div className={`relative ${flip ? "lg:order-2" : "lg:order-1"}`}>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden   shadow-sm bg-white">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  </div>
                </div>

                {/* Text side */}
                <div className={`${flip ? "lg:order-1" : "lg:order-2"} pt-4 lg:pt-0`}>
                 

                  <h3 className="font-display text-2xl sm:text-4xl font-bold text-[#2a1c12]">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-3">
                    <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#925a27]">
                      {product.price}
                    </p>
                  </div>

                  <p className="mt-4 text-sm sm:text-base text-[#6b5848] leading-relaxed">
                    {product.description}
                  </p>

                  {/* Benefits with solid icons */}
                  <ul className="mt-6 space-y-2.5">
                    {product.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-xs sm:text-sm text-[#2a1c12]">
                        <span className="size-5 rounded-md bg-[#faf6f0]  /40 text-[#925a27] flex items-center justify-center flex-shrink-0">
                          <Check className="size-3 stroke-[3]" />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
