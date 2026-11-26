import { BookButton, Section, SectionHead, WhyCards } from "@/components/hims";

const SOLUTIONS = [
  "Full Dentures",
  "Partial Dentures",
  "Implant-Supported Dentures",
  "Flexible Dentures",
] as const;

export function DenturesSolutions() {
  return (
    <Section id="solutions" theme="white" aria-labelledby="dentures-solutions-heading">
      <SectionHead
        id="dentures-solutions-heading"
        title="We offer a variety of denture solutions, including:"
        action={<BookButton>Book Consultation</BookButton>}
      >
        We Are The Dentists That Come To You.
      </SectionHead>
      <div className="mt-10">
        <WhyCards
          items={SOLUTIONS.map((t) => {
            const [lead, ...rest] = t.split(" ");
            return { lead, rest: rest.join(" "), text: "" };
          })}
        />
      </div>
    </Section>
  );
}
