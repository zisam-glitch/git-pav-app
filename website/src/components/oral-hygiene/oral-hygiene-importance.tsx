import { BookButton, Section, SectionHead, WhyCards } from "@/components/hims";

const BENEFITS = [
  "Prevent gum disease",
  "Stop bleeding and swollen gums",
  "Reduce bad breath",
  "Remove plaque and hard tartar",
  "Improve overall health",
  "Protect dental work like crowns and implants",
];

export function OralHygieneImportance() {
  return (
    <Section id="importance" theme="white" aria-labelledby="hygiene-importance-heading">
      <SectionHead
        id="hygiene-importance-heading"
        title="Why Your Oral Hygiene Matters"
        action={<BookButton>Book Now</BookButton>}
      >
        Good hygiene care helps to:
      </SectionHead>
      <div className="mt-10">
        <WhyCards
          items={BENEFITS.map((b) => {
            const [lead, ...rest] = b.split(" ");
            return { lead, rest: rest.join(" "), text: "" };
          })}
        />
      </div>
      <p className="mt-10 max-w-3xl text-[20px] leading-[1.4] text-[#55565a]">
        Poor gum health has been linked to heart disease, diabetes complications, pregnancy risks,
        and infections. Regular dental hygiene visits keep your smile and your health protected.
      </p>
    </Section>
  );
}
