import { HUB_CARD, Section, SectionHead } from "@/components/hims";

const INDICATORS = [
  "Bleeding gums",
  "Bad breath",
  "Gum swelling or tenderness",
  "Stains on teeth",
  "Loose teeth",
  "Sensitive gums",
  "Diabetes or medical conditions that affect healing",
];

export function OralHygieneWhoNeeds() {
  return (
    <Section theme="white" space="sm" aria-labelledby="hygiene-who-heading">
      <SectionHead id="hygiene-who-heading" title="Who Needs Hygiene Treatment?">
        You may need to see our hygienist if you have:
      </SectionHead>
      <div className={`${HUB_CARD} mt-10 p-7 md:p-10`}>
        <ul className="grid list-none gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {INDICATORS.map((item) => (
            <li key={item} className="border-b border-black/10 py-4 text-[18px] text-[#2a2a2c]">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-3xl text-[17px] leading-[1.5] text-[#55565a]">
          Regular hygiene appointments are also essential if you wear braces, dentures, crowns,
          veneers, bridges, or implants.
        </p>
      </div>
    </Section>
  );
}
