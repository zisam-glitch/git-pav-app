import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopHeroProps {
  onCategorySelect?: (category: string) => void;
}

const HIGHLIGHTS = [
  "Free UK delivery over £40",
  "Dentist-formulated",
  "100% satisfaction guarantee",
];

export function ShopHero({ onCategorySelect: _onCategorySelect }: ShopHeroProps) {
  return (
    <section
      id="top"
      className="bg-[#FBF8F5] pt-24 pb-8 sm:pt-28 sm:pb-12"
      aria-label="Shop dental products"
    >
      <div className="mx-auto max-w-[108rem] px-3 sm:px-6 lg:px-10">
        <div className="hims-tile-warm overflow-hidden rounded-[1.5rem] border border-black/6 px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="mx-auto grid max-w-[87rem] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Pav Dental Shop · Bradford
              </p>
              <h1 className="mt-4 font-display text-4xl font-normal leading-[1.06] tracking-[-0.04em] text-black sm:text-5xl lg:text-6xl">
                Designed by <span className="text-[#754B3D]">Dentists</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/65 sm:text-lg">
                Elevate your daily smile routine with professional teeth whitening, acoustic sonic
                brushes, and custom at-home impression kits delivered directly from our clinic in
                Bradford.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 px-7 text-sm">
                  <a href="#catalog" className="inline-flex items-center gap-2">
                    <span>Browse Products</span>
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-7 text-sm">
                  <a href="#guarantee">Our Guarantee</a>
                </Button>
              </div>

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-black/75">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-black text-white">
                      <Check className="size-3" strokeWidth={2.5} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-black/8 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <div className="aspect-[4/3] overflow-hidden rounded-[1.125rem] bg-[#F2EDE5]">
                <img
                  src="/media/hims/bento-whitening.jpg"
                  alt="Pav Dental Bradford clinic interior"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-xs text-black/65">
                <span className="font-medium text-black">786 Leeds Road, Bradford BD3 9TY</span>
                <span>Same-day dispatch Mon–Fri before 2 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
