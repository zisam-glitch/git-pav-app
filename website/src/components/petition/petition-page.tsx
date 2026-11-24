import { CONTAINER } from "@/components/pricing/tokens";
import { PetitionContact } from "./petition-contact";
import { PetitionFormBar } from "./petition-form-bar";
import { PetitionHero } from "./petition-hero";
import { PetitionMedia } from "./petition-media";

/**
 * The petition page: the case on the left, the sign form beside it, then the video and the
 * contact form. The live page's list of signers is not shown (see `content/petition.ts`).
 */
export function PetitionPage() {
  return (
    <div className="bg-[#f7f5f2] text-[#1b1b1b]">
      <section className="pt-12 pb-16 md:pt-20 md:pb-24">
        <div className={`${CONTAINER} grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12`}>
          <PetitionHero />
          <PetitionFormBar />
        </div>
      </section>
      <PetitionMedia />
      <PetitionContact />
    </div>
  );
}
