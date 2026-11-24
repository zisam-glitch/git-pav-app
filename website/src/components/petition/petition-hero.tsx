import { PenLine, Share2 } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { CLAY, LEAD, MUTED_TITLE, SOFT_CARD, TITLE } from "@/components/pricing/tokens";
import { PETITION } from "@/content/petition";

const CARD_ICONS = [PenLine, Share2] as const;

/** The case for the petition: heading, live text, two buttons and the two "what you can do" cards. */
export function PetitionHero() {
  return (
    <div>
      <span className="inline-block rounded-full bg-[#f3f0a8] px-4 py-1.5 text-[13px] font-medium text-[#1b1b1b]">
        {PETITION.eyebrow}
      </span>

      <h1 className={`${TITLE} mt-5`}>
        NHS Dental <span className={MUTED_TITLE}>Funding Petition</span>
      </h1>

      <p className={`${LEAD} mt-6 font-medium text-[#1b1b1b]`}>{PETITION.lead}</p>
      {PETITION.paragraphs.map((paragraph) => (
        <p key={paragraph} className={`${LEAD} mt-4`}>
          {paragraph}
        </p>
      ))}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <BookButton>{PETITION.bookLabel}</BookButton>
        <ButtonLink to="/contact-us" variant="outline">
          {PETITION.contactLabel}
        </ButtonLink>
      </div>

      <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2">
        {PETITION.cards.map((card, index) => {
          const Icon = CARD_ICONS[index] ?? PenLine;
          return (
            <li key={card.title} className={`${SOFT_CARD} p-6`}>
              <span className="grid size-10 place-items-center rounded-full bg-[#f7f5f2]">
                <Icon className={`size-5 ${CLAY}`} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-[22px] font-medium tracking-[-0.01em] text-[#1b1b1b]">
                {card.title}
              </h2>
              <p className="mt-2 text-[16px] leading-[1.45] text-[#6b6b70]">{card.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
