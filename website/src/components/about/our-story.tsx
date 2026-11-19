import { CheckCircle2 } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";

const DREAM_STEPS = [
  {
    step: "01",
    title: "Dream",
    body: "Envisioning a patient-centered clinic where the best dental care meets the flexibility of mobile services.",
  },
  {
    step: "02",
    title: "Creating a Partnership",
    body: "Building a foundation of shared passion and complementary expertise.",
  },
  {
    step: "03",
    title: "Reaching Shared Value between the Partnership",
    body: "Defining their commitment to patient well-being and professional excellence.",
  },
  {
    step: "04",
    title: "Creating a Very Detailed Roadmap",
    body: "Outlining every stage, from cutting-edge technology acquisition to community outreach.",
  },
] as const;

const APP_FEATURES = [
  "Schedule routine checkups and cleanings at your home or office.",
  "Book emergency appointments for swift relief.",
  "Consult virtually with our dentists for immediate advice.",
] as const;

export function OurStory() {
  return (
    <>
      <Section theme="cream" space="default">
        <div className="max-w-2xl">
          <Heading as="h2" size="h2-md" accent="The Team" tone="terracotta" inline>
            The Dream and
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Dr. Pav&apos;s dream was shared, nurtured, and diligently planned alongside his close
            friend and colleague, Dr. Hassan. Together, they meticulously crafted a plan,
            encompassing these crucial steps:
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {DREAM_STEPS.map((item) => (
            <Tile key={item.step} tone="white" className="p-6 md:p-8">
              <p className="text-caption font-medium text-terracotta">{item.step}</p>
              <h3 className="mt-2 text-h4 text-fg">{item.title}</h3>
              <p className="mt-3 text-body text-muted">{item.body}</p>
            </Tile>
          ))}
        </div>
      </Section>

      <Section theme="brown" space="lg">
        <SplitFeature
          reverse
          media={
            <Media
              src="/images/generated/about-legacy.jpg"
              alt="Serene dental suite in golden light honouring Dr. Pav's vision"
              ratio="4 / 3"
              tone="brown"
              className="bg-white/10"
            />
          }
        >
          <div>
            <Heading as="h2" size="hero" accent="Fulfilled" tone="gold" inline>
              A Legacy
            </Heading>
            <p className="mt-5 text-lead text-white/80">
              Tragically, Dr. Pav passed away before witnessing the clinic&apos;s realization. Their
              shared vision now rests with Dr. Hassan as a profound responsibility. Fueled by a deep
              respect for their collaboration, Dr Hassan vowed to complete the final step:
            </p>

            <Tile tone="glass" className="mt-6 space-y-4 p-6">
              <div>
                <h3 className="text-h4 text-gold">Executing</h3>
                <p className="mt-1 text-body text-white/85">
                  Bringing this dental clinic to life, serving our community with the same care and
                  innovation Dr. Pav championed.
                </p>
              </div>
              <div className="border-t border-white/15 pt-4">
                <h3 className="text-h4 text-gold">Inspiration and Growth</h3>
                <p className="mt-1 text-body text-white/85">
                  &ldquo;We can achieve all our dreams if we are brave enough to pursue them.&rdquo;
                  This philosophy, shared by Dr. Pav and Dr. Hassan, will forever guide our
                  practice.
                </p>
              </div>
            </Tile>

            <p className="mt-6 text-body text-white/80">
              While we must forgive past failings and present obstacles, the future of this clinic
              demands unwavering standards. We will never compromise on the quality, compassion, or
              dedication to access that Dr. Pav envisioned.
            </p>
            <p className="mt-4 text-body text-white/80">
              We invite you to join us on this journey, as we honor a remarkable legacy and build a
              future where dental care is truly accessible to all.
            </p>
          </div>
        </SplitFeature>
      </Section>

      <Section theme="sand" space="default">
        <SplitFeature
          media={
            <Media
              src="/images/generated/about-future.jpg"
              alt="Pav Dental App alongside our Bradford Hub and Mobile clinic"
              ratio="4 / 3"
              tone="cream"
            />
          }
        >
          <div>
            <Heading as="h2" size="h2-md" accent="of Dentistry" tone="copper" inline>
              The Future
            </Heading>
            <p className="mt-4 text-lead text-muted">
              We believe the Pav Dental App, alongside our Hub and Mobile clinic, represents the
              future of dentistry. It&apos;s a future shaped by Dr. Pav&apos;s belief in
              accessibility and patient empowerment.
            </p>
            <p className="mt-4 text-body text-fg">
              We&apos;re proud to announce the Pav Dental App – think of it as the Uber of
              dentistry! With just a few taps, you can:
            </p>
            <ul className="mt-5 space-y-3">
              {APP_FEATURES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-body text-fg">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-copper" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BookButton>Book Now</BookButton>
              <ButtonLink to="/services" variant="outline">
                View Services
              </ButtonLink>
            </div>
          </div>
        </SplitFeature>
      </Section>
    </>
  );
}
