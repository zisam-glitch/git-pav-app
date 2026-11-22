import { Heading, Section } from "@/components/hims";

/** The live page repeats these cards as a looping strip: three "Intermediate" and two "Premium" slides. */
const DENTURE_SLIDES = [
  "Intermediate - acrylic with clasps",
  "Premium - Flexible denture",
  "Intermediate - acrylic with clasps",
  "Premium - Flexible denture",
  "Intermediate - acrylic with clasps",
] as const;

export function DenturesShowcase() {
  return (
    <Section theme="brown" space="lg">
      <Heading as="h2" size="h2-md" tone="gold">
        Dentures
      </Heading>
      <ul className="-mx-5 mt-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:mt-12 md:px-0">
        {DENTURE_SLIDES.map((text, index) => (
          <li
            key={`${text}-${index}`}
            className="flex min-h-56 w-[78%] shrink-0 snap-start items-end rounded-2xl border border-white/20 bg-white/5 p-6 sm:w-[44%] md:min-h-72 md:w-[calc((100%-1rem)/3)] md:p-8"
          >
            <p className="text-lead text-white">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
