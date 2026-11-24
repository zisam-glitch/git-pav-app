import { PenLine, Share2 } from "lucide-react";
import { BookButton } from "@/components/hims";
import { PETITION } from "@/content/petition";

const CARD_ICONS = [PenLine, Share2] as const;

/** The case: a heavy uppercase headline, the live text and two buttons. */
export function PetitionHero() {
  return (
    <div>
      <span className="inline-block border-2 border-black bg-[#ffc671] px-3 py-1 text-[13px] font-bold tracking-wide text-black uppercase">
        {PETITION.eyebrow}
      </span>
      <h1 className="mt-5 text-[clamp(38px,5.6vw,84px)] leading-[0.98] font-extrabold tracking-[-0.02em] text-black uppercase">
        NHS Dental Funding Petition
      </h1>
      <p className="mt-6 text-[20px] leading-snug font-semibold">{PETITION.lead}</p>
      {PETITION.paragraphs.map((paragraph) => (
        <p key={paragraph} className="mt-4 max-w-[640px] text-[18px] leading-relaxed text-black/80">
          {paragraph}
        </p>
      ))}
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="#sign-form"
          className="border-2 border-black bg-black px-6 py-3 text-[16px] font-bold text-white shadow-[4px_4px_0_0_#8a4242] t-colors hover:bg-[#8a4242]"
        >
          {PETITION.cards[0].title}
        </a>
        <BookButton
          variant="outline"
          className="h-auto rounded-none border-2 border-black bg-white px-6 py-3 text-[16px] font-bold text-black shadow-[4px_4px_0_0_#000] hover:bg-[#ffc671]"
        >
          {PETITION.bookLabel}
        </BookButton>
        <a
          href="/contact-us"
          className="border-2 border-black bg-white px-6 py-3 text-[16px] font-bold text-black shadow-[4px_4px_0_0_#000] t-colors hover:bg-[#ffc671]"
        >
          {PETITION.contactLabel}
        </a>
      </div>
    </div>
  );
}

/** The two ways to help, as numbered hard-bordered boxes. */
export function PetitionCards() {
  return (
    <section className="mx-auto w-full max-w-[1392px] px-4 py-14 md:py-20">
      <ul className="grid list-none gap-6 md:grid-cols-2">
        {PETITION.cards.map((card, index) => {
          const Icon = CARD_ICONS[index] ?? PenLine;
          return (
            <li
              key={card.title}
              className={`flex gap-5 border-2 border-black p-7 shadow-[6px_6px_0_0_#000] ${index === 0 ? "bg-[#ffc671]" : "bg-[#e4eee6]"}`}
            >
              <span className="text-[56px] leading-none font-extrabold">0{index + 1}</span>
              <div>
                <Icon className="size-6" aria-hidden="true" />
                <h2 className="mt-3 text-[26px] leading-tight font-extrabold uppercase">
                  {card.title}
                </h2>
                <p className="mt-2 text-[17px] leading-relaxed text-black/80">{card.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
