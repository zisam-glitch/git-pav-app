import { HeartHandshake } from "lucide-react";
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
          <p className="inline-flex items-center gap-2 text-small font-medium text-terracotta">
            <HeartHandshake className="size-4" aria-hidden="true" />
            <span>{PETITION.eyebrow}</span>
          </p>

          <Heading as="h1" size="hero" accent="Funding Petition" tone="terracotta" className="mt-3">
            NHS Dental
          </Heading>

          <p className="mt-5 text-lead font-medium text-fg">{PETITION.lead}</p>
          {PETITION.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-body text-muted">
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
        {PETITION.cards.map((card) => (
          <li key={card.title}>
            <Tile tone="cream" className="h-full p-6 md:p-8">
              <h2 className="text-h4 text-fg">{card.title}</h2>
              <p className="mt-3 text-body text-muted">{card.text}</p>
            </Tile>
          </li>
        ))}
      </ul>
    </Section>
  );
}
