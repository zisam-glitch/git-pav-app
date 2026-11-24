import { Check } from "lucide-react";
import { BookButton } from "@/components/hims";
import { CONTAINER, MUTED_TITLE, TITLE } from "@/components/pricing/tokens";
import { PETITION } from "@/content/petition";

/** The opening card: beige, text on the left, the photo bleeding off the right edge. */
export function PetitionHero() {
  return (
    <section className="px-3 pt-3 md:px-4 md:pt-4">
      <div className="mx-auto grid max-w-[1392px] overflow-hidden rounded-[28px] bg-[#f1e9dc] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="px-6 py-12 md:px-14 md:py-20">
          <p className="text-[14px] tracking-wide text-[#b5644a]">
            {PETITION.eyebrow.toLowerCase()}
          </p>
          <h1 className={`${TITLE} mt-4`}>
            NHS Dental <span className={MUTED_TITLE}>Funding Petition</span>
          </h1>
          <p className="mt-6 text-[20px] leading-snug font-medium">{PETITION.lead}</p>
          {PETITION.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 max-w-[560px] text-[18px] leading-[1.45] text-[#4a4a4d]"
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#sign-form"
              className="inline-flex h-12 items-center rounded-full bg-[#1b1b1b] px-7 text-[16px] font-medium text-white t-colors hover:bg-black"
            >
              {PETITION.cards[0].title}
            </a>
            <BookButton variant="outline" className="bg-transparent">
              {PETITION.bookLabel}
            </BookButton>
          </div>
        </div>
        <img
          src="/images/generated/petition-hero.jpg"
          alt="Bradford community supporting accessible NHS dental care"
          className="h-full min-h-[320px] w-full object-cover"
        />
      </div>
    </section>
  );
}

/** The two ways to help, as tick-list cards. */
export function PetitionCards() {
  return (
    <section className="py-14 md:py-20">
      <div className={CONTAINER}>
        <ul className="grid list-none gap-4 md:grid-cols-2">
          {PETITION.cards.map((card) => (
            <li key={card.title} className="rounded-[22px] bg-[#f6f6f4] p-7 md:p-10">
              <span className="grid size-7 place-items-center rounded-full bg-[#f3b968]">
                <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-[28px] leading-[1.1] font-medium tracking-[-0.02em]">
                {card.title}
              </h2>
              <p className="mt-3 max-w-[480px] text-[17px] leading-[1.45] text-[#6b6b70]">
                {card.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
