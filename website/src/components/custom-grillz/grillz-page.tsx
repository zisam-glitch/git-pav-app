import { GrillzHero } from "./grillz-hero";
import { GrillzStyles } from "./grillz-styles";
import { GrillzPricing } from "./grillz-pricing";
import { GrillzProcess } from "./grillz-process";
import { GrillzFaq } from "./grillz-faq";

export function CustomGrillzPage() {
  return (
    <main className="bg-[#FBF8F5] text-black/88">
      <GrillzHero />
      <GrillzStyles />
      <GrillzPricing />
      <GrillzProcess />
      <GrillzFaq />
    </main>
  );
}
