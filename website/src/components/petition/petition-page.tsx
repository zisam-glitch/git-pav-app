import { PetitionContact } from "./petition-contact";
import { PetitionFormBar } from "./petition-form-bar";
import { PetitionCards, PetitionHero } from "./petition-hero";
import { PetitionMedia } from "./petition-media";

/**
 * The petition page as a bold campaign page (laid out from Mobbin references: a split hero with
 * the sign form in a hard-bordered card, a framed video, numbered action boxes and a gold
 * call-to-action band). The live page's list of signers is not shown (see `content/petition.ts`).
 */
export function PetitionPage() {
  return (
    <div className="bg-white text-black">
      <section className="border-b-2 border-black bg-[#ece8ff]">
        <div className="mx-auto grid w-full max-w-[1392px] items-start gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <PetitionHero />
          <PetitionFormBar />
        </div>
      </section>
      <PetitionCards />
      <PetitionMedia />
      <PetitionContact />
    </div>
  );
}
