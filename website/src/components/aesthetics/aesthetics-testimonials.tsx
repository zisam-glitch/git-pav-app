import { Section } from "@/components/hims";
import { SectionHeader } from "@/components/hims/section-header";
import { TitleCards } from "@/components/hims/title-cards";
import {
  AESTHETICS_TESTIMONIALS,
  TESTIMONIALS_HEADING,
  TESTIMONIALS_INTRO,
} from "@/content/testimonials";

/**
 * Patient comments under "What people say?": the live comments from `content/testimonials.ts`, word for word,
 * as soft cards (see `TitleCards`). No ratings, stars, names or counts.
 */
export function AestheticsTestimonials() {
  return (
    <Section theme="white">
      <SectionHeader
        title={TESTIMONIALS_HEADING.replace(/\s*say\?$/, "")}
        accent="say?"
        lead={TESTIMONIALS_INTRO}
      />
      <TitleCards
        items={AESTHETICS_TESTIMONIALS.map((item) => ({ title: item.title, body: item.text }))}
        columns={3}
        className="mt-10 md:mt-14"
      />
    </Section>
  );
}
