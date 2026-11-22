import { BookButton, ButtonLink, Heading, Media, Section } from "@/components/hims";
import { StackedFlow } from "@/components/hims/stacked-flow";
import { Commitments } from "@/components/hims/commitments";
import { KeyLineList } from "@/components/hims/key-line-list";
import { NumberedList } from "@/components/hims/numbered-list";
import { OpenBook } from "@/components/hims/open-book";
import { Statement } from "@/components/hims/statement";
import { BODY_L } from "@/components/hims/type-styles";

const DREAM_STEPS = [
  {
    title: "Dream : ",
    body: "Envisioning a patient-centered clinic where the best dental care meets the flexibility of mobile services.",
  },
  {
    title: "Creating a Partnership : ",
    body: "Building a foundation of shared passion and complementary expertise.",
  },
  {
    title: "Reaching Shared Value between the Partnership : ",
    body: "Defining their commitment to patient well-being and professional excellence.",
  },
  {
    title: "Creating a Very Detailed Roadmap : ",
    body: "Outlining every stage, from cutting-edge technology acquisition to community outreach.",
  },
] as const;

const COMMITMENTS = [
  {
    label: "Executing : ",
    children:
      "Bringing this dental clinic to life, serving our community with the same care and innovation Dr. Pav championed.",
  },
  {
    label: "Inspiration and Growth : ",
    children:
      "“We can achieve all our dreams if we are brave enough to pursue them.” This philosophy, shared by Dr. Pav and Dr. Hassan, will forever guide our practice.",
  },
] as const;

const APP_FEATURES = [
  { title: "Schedule routine checkups and cleanings at your home or office." },
  { title: "Book emergency appointments for swift relief." },
  { title: "Consult virtually with our dentists for immediate advice." },
] as const;

/**
 * The story of `/about` after the hero, in the Hims "clinical excellence" order
 * (`docs/redesign/website/hims-patterns/clinical-excellence.md`, `people-recipe.md`): a stacked flow with a
 * numbered list (the dream), a dark statement sheet with commitments (the legacy), and an open-book band with
 * the picture to the edge (the future). Every sentence is the live wording.
 */
export function OurStory() {
  return (
    <>
      <Section id="dream-team" theme="cream" space="default">
        <StackedFlow
          lead={
            <>
              <Heading as="h2" size="h2-md" accent="The Team" tone="terracotta" inline>
                The Dream and
              </Heading>
              <p className="mt-4 text-lead text-muted">
                Dr. Pav&apos;s dream was shared, nurtured, and diligently planned alongside his
                close friend and colleague, Dr. Hassan. Together, they meticulously crafted a plan,
                encompassing these crucial steps:
              </p>
            </>
          }
        >
          <NumberedList
            size="md"
            items={DREAM_STEPS.map((item) => ({ title: item.title, children: item.body }))}
          />
        </StackedFlow>
      </Section>

      <Statement id="legacy-fulfilled" theme="brown" sheet title="A Legacy" accent="Fulfilled">
        <p>
          Tragically, Dr. Pav passed away before witnessing the clinic&apos;s realization. Their
          shared vision now rests with Dr. Hassan as a profound responsibility. Fueled by a deep
          respect for their collaboration, Dr Hassan vowed to complete the final step:
        </p>
      </Statement>

      <Section theme="brown" space="none" className="pb-14 md:pb-[120px]">
        <Media
          src="/images/generated/about-legacy.jpg"
          alt="Serene dental suite in golden light honouring Dr. Pav's vision"
          ratio="16 / 9"
          tone="brown"
          className="bg-white/10"
        />
        <Commitments tone="dark" items={COMMITMENTS} className="mt-6" />
        <div
          style={BODY_L}
          className="mx-auto mt-12 max-w-[57rem] space-y-4 text-center text-pretty text-white/80 md:mt-16"
        >
          <p>
            While we must forgive past failings and present obstacles, the future of this clinic
            demands unwavering standards. We will never compromise on the quality, compassion, or
            dedication to access that Dr. Pav envisioned.
          </p>
          <p>
            We invite you to join us on this journey, as we honor a remarkable legacy and build a
            future where dental care is truly accessible to all.
          </p>
        </div>
      </Section>

      <OpenBook
        id="future-dentistry"
        theme="cream"
        sheet
        media={
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[520px]">
            <Media
              src="/images/generated/about-future.jpg"
              alt="Pav Dental App alongside our Bradford Hub and Mobile clinic"
              ratio="auto"
              tone="cream"
              className="absolute inset-0 rounded-none"
            />
          </div>
        }
      >
        <Heading as="h2" size="h2-md" accent="of Dentistry" tone="copper" inline>
          The Future
        </Heading>
        <p className="mt-4 text-lead text-muted">
          We believe the Pav Dental App, alongside our Hub and Mobile clinic, represents the future
          of dentistry. It&apos;s a future shaped by Dr. Pav&apos;s belief in accessibility and
          patient empowerment.
        </p>
        <p className="mt-4 text-body text-fg">
          We&apos;re proud to announce the Pav Dental App – think of it as the Uber of dentistry!
          With just a few taps, you can:
        </p>
        <KeyLineList size="md" items={APP_FEATURES} className="mt-6" />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <BookButton>Book Now</BookButton>
          <ButtonLink to="/services" variant="outline">
            View Services
          </ButtonLink>
        </div>
      </OpenBook>
    </>
  );
}
