import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PETITION } from "@/content/petition";
import { BOOKING_URL } from "@/lib/enquiry";

/** The petition page's opening: the live page's heading, text and two buttons. */
export function PetitionHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#faf6f0] to-white pb-12 pt-12 sm:pb-16 sm:pt-16">
      <div className="pointer-events-none absolute -left-40 -top-40 size-[500px] rounded-full bg-primary/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-20 size-[500px] rounded-full bg-gold/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-[#d9383a] sm:text-sm">
          <HeartHandshake className="size-4" aria-hidden="true" />
          <span>{PETITION.eyebrow}</span>
        </p>

        <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-bold leading-[1.12] text-[#2a1c12] sm:text-5xl lg:text-6xl">
          {PETITION.title}
        </h1>

        <p className="mt-6 text-base font-semibold text-[#844d1e] sm:text-lg">{PETITION.lead}</p>
        {PETITION.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {paragraph}
          </p>
        ))}

        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="accent-gradient w-full gap-2 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 sm:w-auto"
          >
            <a href={BOOKING_URL}>{PETITION.bookLabel}</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full gap-2  bg-white px-7 text-sm font-medium text-fg shadow-2xs hover:bg-[#faf6f0] sm:w-auto"
          >
            <a href="/contact-us">{PETITION.contactLabel}</a>
          </Button>
        </div>

        <ul className="mx-auto mt-12 grid max-w-3xl list-none grid-cols-1 gap-5 text-left sm:grid-cols-2">
          {PETITION.cards.map((card) => (
            <li key={card.title} className="rounded-xl   bg-white/90 p-6 shadow-2xs">
              <h2 className="font-display text-lg font-bold text-fg">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{card.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
