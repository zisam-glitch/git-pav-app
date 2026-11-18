import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { BOOKING_URL } from "@/lib/enquiry";

/** The petition page's opening: the live page's heading, text and two buttons. */
export function PetitionHero() {
  return (
    <section className="bg-[#FBF8F5] pt-10 pb-14 sm:pt-14 sm:pb-16">
      <div className="mx-auto max-w-[87rem] px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2EDE5] px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-[#8A3A34]">
          <HeartHandshake className="size-3.5" aria-hidden="true" />
          <span>{PETITION.eyebrow}</span>
        </span>

        <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-normal leading-[1.06] tracking-[-0.04em] text-black sm:text-5xl lg:text-6xl">
          {PETITION.title}
        </h1>

        <p className="mt-6 text-base font-medium text-[#754B3D] sm:text-lg">{PETITION.lead}</p>
        {PETITION.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-black/65 sm:text-base"
          >
            {paragraph}
          </p>
        ))}

        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={BOOKING_URL}>{PETITION.bookLabel}</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="/contact-us">{PETITION.contactLabel}</a>
          </Button>
        </div>

        <ul className="mx-auto mt-12 grid max-w-3xl list-none grid-cols-1 gap-5 text-left sm:grid-cols-2">
          {PETITION.cards.map((card) => (
            <li
              key={card.title}
              className="rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <h2 className="font-display text-xl font-normal tracking-[-0.025em] text-black">
                {card.title}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-black/65">{card.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
