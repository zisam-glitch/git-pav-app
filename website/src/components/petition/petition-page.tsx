import { PetitionContact } from "./petition-contact";
import { PetitionFormBar } from "./petition-form-bar";
import { PetitionHero } from "./petition-hero";
import { PetitionMedia } from "./petition-media";

/**
 * The petition page, in the order of the live page: heading and text, the two cards, the sign
 * form, the video, then the contact form. The live page's list of signers is not shown (see
 * `content/petition.ts`).
 */
export function PetitionPage() {
  return (
    <div className="min-h-screen bg-white text-fg">
      <PetitionHero />
      <PetitionFormBar />
      <PetitionMedia />
      <PetitionContact />
    </div>
  );
}
