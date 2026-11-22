import { ArrowDownRight, HeartHandshake, PenLine, Share2 } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";
import { PETITION } from "@/content/petition";

const CARD_ICONS = [PenLine, Share2] as const;

/** The petition page's opening: the live page's heading, text, two buttons and two cards. */
export function PetitionHero() {
  return (
    <Section theme="white" space="default">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/petition-hero.jpg"
            alt="Bradford community supporting accessible NHS dental care"
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
            <HeartHandshake className="size-3.5 text-terracotta" aria-hidden="true" />
            <span>{PETITION.eyebrow}</span>
          </span>

          <Heading as="h1" size="hero" accent="Funding Petition" tone="terracotta" className="mt-4">
            NHS Dental
          </Heading>

          <p className="mt-5 text-lead font-medium text-fg">{PETITION.lead}</p>
          {PETITION.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-body leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookButton>{PETITION.bookLabel}</BookButton>
            <ButtonLink to="/contact-us" variant="outline">
              {PETITION.contactLabel}
            </ButtonLink>
          </div>
        </div>
      </SplitFeature>

      <ul className="mt-12 grid list-none gap-6 sm:grid-cols-2">
        {PETITION.cards.map((card, index) => {
          const Icon = CARD_ICONS[index] ?? PenLine;
          const isSage = index === 1;
          return (
            <li key={card.title}>
              <Tile
                tone={isSage ? "sage" : "cream"}
                lift
                className="flex h-full flex-col justify-between gap-6 border border-border/70 p-6 md:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-pill bg-white text-terracotta shadow-soft">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <a
                      href="#sign-form"
                      aria-label={card.title}
                      className="inline-flex size-8 items-center justify-center rounded-pill border border-border bg-white text-fg t-colors hover:border-black hover:bg-black hover:text-white"
                    >
                      <ArrowDownRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                  <h2 className="mt-5 text-h3-md text-fg">{card.title}</h2>
                  <p className="mt-3 text-body leading-relaxed text-muted">{card.text}</p>
                </div>
              </Tile>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

