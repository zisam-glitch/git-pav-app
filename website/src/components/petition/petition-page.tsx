import { PetitionContact } from "./petition-contact";
import { PetitionFormBar } from "./petition-form-bar";
import { PetitionCards, PetitionHero } from "./petition-hero";
import { PetitionMedia } from "./petition-media";

/**
 * The petition page, laid out from the Hims web screens on Mobbin: a beige hero card with the
 * photo on the right, tick-list cards, a photo card holding the sign form (the "Unlock the free
 * guide" card), a framed video and a centred contact form. The live page's list of signers is
 * not shown (see `content/petition.ts`).
 */
export function PetitionPage() {
  return (
    <div className="bg-white text-[#1b1b1b]">
      <PetitionHero />
      <PetitionCards />
      <PetitionFormBar />
      <PetitionMedia />
      <PetitionContact />
    </div>
  );
}
