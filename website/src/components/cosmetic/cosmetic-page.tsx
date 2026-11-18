import { CosmeticHero } from "./cosmetic-hero";
import { CosmeticAbout } from "./cosmetic-about";
import { CosmeticProcedures } from "./cosmetic-procedures";
import { CosmeticBenefits } from "./cosmetic-benefits";
import { CosmeticFinancing } from "./cosmetic-financing";
import { CosmeticShowcase } from "./cosmetic-showcase";
import { CosmeticFaq } from "./cosmetic-faq";

export function CosmeticPage() {
  return (
    <main className="bg-[#FBF8F5] text-black/88">
      <CosmeticHero />
      <CosmeticAbout />
      <CosmeticProcedures />
      <CosmeticBenefits />
      <CosmeticFinancing />
      <CosmeticShowcase />
      <CosmeticFaq />
    </main>
  );
}
