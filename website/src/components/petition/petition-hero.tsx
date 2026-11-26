import { BookButton } from "@/components/hims";
import { PETITION } from "@/content/petition";

const WRAP = "mx-auto w-full max-w-[1392px] px-4";

/** A very large headline, then the live text in two columns under a hairline. */
export function PetitionHero() {
  return (
    <section className={`${WRAP} pt-16 pb-14 md:pt-28 md:pb-20`}>
      <p className="text-[14px] tracking-[0.14em] text-black/55 uppercase">{PETITION.eyebrow}</p>
      <h1 className="mt-6 text-[clamp(52px,10.5vw,168px)] leading-[0.92] font-medium tracking-[-0.045em]">
        NHS Dental
        <br />
        Funding Petition
      </h1>

      <div className="mt-14 grid gap-8 border-t border-black pt-8 md:mt-20 lg:grid-cols-2 lg:gap-16">
        <p className="text-[clamp(22px,2.2vw,32px)] leading-[1.2] font-medium tracking-[-0.01em]">
          {PETITION.lead}
        </p>
        <div>
          {PETITION.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-4 text-[19px] leading-[1.5] text-black/75">
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#sign-form"
              className="inline-flex h-12 items-center rounded-full bg-black px-7 text-[16px] font-medium text-white t-colors hover:bg-black/80"
            >
              {PETITION.cards[0].title}
            </a>
            <BookButton variant="outline">{PETITION.bookLabel}</BookButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The two ways to help, as a numbered list between hairlines. */
export function PetitionCards() {
  return (
    <section className={`${WRAP} pb-16 md:pb-24`}>
      <ul className="list-none border-t border-black">
        {PETITION.cards.map((card, index) => (
          <li
            key={card.title}
            className="grid gap-3 border-b border-black/20 py-8 md:grid-cols-[120px_1fr_1.2fr] md:gap-10 md:py-10"
          >
            <span className="text-[16px] text-black/55 tabular-nums">0{index + 1}</span>
            <h2 className="text-[clamp(28px,3.2vw,48px)] leading-[1.05] font-medium tracking-[-0.025em]">
              {card.title}
            </h2>
            <p className="max-w-[520px] text-[18px] leading-[1.5] text-black/70">{card.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
