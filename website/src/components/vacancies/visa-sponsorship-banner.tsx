import { ArrowRight } from "lucide-react";
import { Heading, Media, Section, SplitFeature } from "@/components/hims";
import { Button } from "@/components/ui/button";

interface VisaSponsorshipBannerProps {
  onApplySponsorship: () => void;
}

/**
 * The foreign visa and sponsorship band: the live heading and paragraph, Apply Now, and the wired picture.
 * Hims reference: dark feature band (`Section theme="brown"`, `docs/redesign/website/hims-patterns/people-recipe.md`).
 */
export function VisaSponsorshipBanner({ onApplySponsorship }: VisaSponsorshipBannerProps) {
  return (
    <Section id="sponsorship" theme="brown" space="lg">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/vacancies-sponsorship.jpg"
            alt="Clinical dental environment welcoming international dental professionals"
            ratio="4 / 3"
            tone="brown"
            className="bg-white/10"
          />
        }
      >
        <div>
          <Heading as="h2" size="hero" accent="and Sponsorship" tone="gold" inline>
            Foreign Visa
          </Heading>
          <p className="mt-5 text-lead text-white/80">
            Pav Dental is seeking qualified dentists from abroad and offering foreign visa
            sponsorship to support their relocation and employment. This position is designed to
            provide skilled dental professionals with an opportunity to work in a new environment,
            expand their expertise, and contribute to the oral health of the community.
          </p>
          <div className="mt-8">
            <Button type="button" variant="gold" onClick={onApplySponsorship}>
              <span>Apply Now</span>
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </SplitFeature>
    </Section>
  );
}
