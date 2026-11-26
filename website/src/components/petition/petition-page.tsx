import { PetitionContact } from "./petition-contact";
import { PetitionFormBar } from "./petition-form-bar";
import { PetitionCards, PetitionHero } from "./petition-hero";
import { PetitionMedia } from "./petition-media";

/**
 * The petition page, minimal and editorial: black on white, a very large headline, hairline
 * rules instead of cards, one narrow sign form, a large video and a plain contact form. The live
 * page's list of signers is not shown (see `content/petition.ts`).
 */
export function PetitionPage() {
  return (
    <div className="bg-white text-black">
      <PetitionHero />
      <PetitionCards />
      <PetitionFormBar />
      <PetitionMedia />
      <PetitionContact />
    </div>
  );
}
