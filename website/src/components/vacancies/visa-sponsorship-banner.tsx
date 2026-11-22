import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Heading, Media, Section, SplitFeature, Tile } from "@/components/hims";
import { Button } from "@/components/ui/button";

interface VisaSponsorshipBannerProps {
  onApplySponsorship: () => void;
}

const SPONSORSHIP_PILLARS = [
  {
    step: "01",
    title: "Skilled Worker Sponsorship",
    body: "Direct employer visa sponsorship supporting relocation to our Bradford practice.",
  },
  {
    step: "02",
    title: "GDC & Clinical Mentorship",
    body: "Structured induction and clinical guidance alongside our experienced Bradford team.",
  },
  {
    step: "03",
    title: "Long-Term Career Growth",
    body: "Modern digital dentistry suites, multidisciplinary support, and community impact.",
  },
] as const;

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
          <span className="inline-block rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-caption font-medium text-gold">
            International Dental Talent
          </span>
          <Heading as="h2" size="hero" accent="and Sponsorship" tone="gold" inline className="mt-4">
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

      {/* Hims dark spotlight pillar cards (Mobbin e4eccce0) */}
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {SPONSORSHIP_PILLARS.map((pillar) => (
          <Tile key={pillar.step} tone="glass" className="border border-white/15 p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-pill bg-gold/15 text-caption font-medium text-gold">
                {pillar.step}
              </span>
              <CheckCircle2 aria-hidden="true" className="size-4 text-gold" />
            </div>
            <h3 className="mt-4 text-h4 text-gold">{pillar.title}</h3>
            <p className="mt-2 text-body text-white/80">{pillar.body}</p>
          </Tile>
        ))}
      </div>
    </Section>
  );
}

