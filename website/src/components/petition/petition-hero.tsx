import { ArrowDownRight, HeartHandshake, PenLine, Share2 } from "lucide-react";
import { BookButton, ButtonLink, Heading, Media, Section, SplitFeature } from "@/components/hims";
import { RowCard } from "@/components/hims/row-card";
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

      <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2">
        {PETITION.cards.map((card, index) => {
          const Icon = CARD_ICONS[index] ?? PenLine;
          return (
            <RowCard
              key={card.title}
              className="h-full md:items-start md:justify-start"
              action={
                <a
                  href="#sign-form"
                  aria-label={card.title}
                  className="inline-flex size-10 items-center justify-center rounded-pill bg-black text-white t-colors hover:bg-black/80"
                >
                  <ArrowDownRight className="size-4" aria-hidden="true" />
                </a>
              }
            >
              <Icon className="size-5 text-terracotta" aria-hidden="true" />
              <h2 className="mt-4 text-h4 text-fg">{card.title}</h2>
              <p className="mt-2 text-body text-muted">{card.text}</p>
            </RowCard>
          );
        })}
      </ul>
    </Section>
  );
}
