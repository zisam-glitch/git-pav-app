import { Heading, Media, Section, SplitFeature } from "@/components/hims";
import { Cta, type CtaProps } from "@/components/ui/hero-05-utils/cta";

export interface Hero05Props {
  tagline: string;
  title: string;
  description: string;
  landscapeImage?: string;
  landscapeAlt?: string;
  animation?: "none" | "subtle";
  primaryCTA?: CtaProps;
  secondaryCTA?: CtaProps;
  variant?: "standard" | "compact";
}

export function Hero05({
  tagline,
  title,
  description,
  landscapeImage,
  landscapeAlt = "",
  primaryCTA,
  secondaryCTA,
}: Readonly<Hero05Props>) {
  return (
    <Section theme="white" space="default">
      <SplitFeature
        reverse
        media={
          <Media
            src={landscapeImage || undefined}
            alt={landscapeAlt}
            ratio="4 / 3"
            tone="cream"
            priority
          />
        }
      >
        <div>
          {tagline ? <p className="text-small font-medium text-terracotta">{tagline}</p> : null}
          {title ? (
            <Heading as="h1" size="hero" className="mt-3">
              {title}
            </Heading>
          ) : null}
          {description ? <p className="mt-4 text-lead text-muted">{description}</p> : null}
          {primaryCTA?.ctaEnabled || secondaryCTA?.ctaEnabled ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primaryCTA?.ctaEnabled ? <Cta cta={primaryCTA} /> : null}
              {secondaryCTA?.ctaEnabled ? (
                <Cta cta={{ ...secondaryCTA, variant: secondaryCTA.variant ?? "link" }} />
              ) : null}
            </div>
          ) : null}
        </div>
      </SplitFeature>
    </Section>
  );
}

export default Hero05;
