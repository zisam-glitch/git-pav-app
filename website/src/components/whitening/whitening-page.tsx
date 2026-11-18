import { WhiteningHero } from "./whitening-hero";
import { WhiteningVisualizer } from "./whitening-visualizer";
import { WhiteningComparison } from "./whitening-comparison";
import { WhiteningProducts } from "./whitening-products";
import { WhiteningFaq } from "./whitening-faq";

export function WhiteningPage() {
  return (
    <main className="bg-[#FBF8F5] text-black/88">
      <WhiteningHero />
      <WhiteningVisualizer />
      <WhiteningComparison />
      <WhiteningProducts />
      <WhiteningFaq />
    </main>
  );
}
