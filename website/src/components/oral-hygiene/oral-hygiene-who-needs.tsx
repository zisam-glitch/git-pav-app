import { OralHygienePointList } from "./oral-hygiene-point-list";

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
    <OralHygienePointList
      theme="cream"
      title="Who Needs Hygiene"
      accent="Treatment?"
      lead="You may need to see our hygienist if you have:"
      items={INDICATORS}
      note="Regular hygiene appointments are also essential if you wear braces, dentures, crowns, veneers, bridges, or implants."
    />
  );
}
