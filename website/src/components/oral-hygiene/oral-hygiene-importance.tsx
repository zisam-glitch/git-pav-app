import { OralHygienePointList } from "./oral-hygiene-point-list";

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
    <OralHygienePointList
      id="importance"
      theme="cream"
      title="Why Your Oral Hygiene"
      accent="Matters"
      lead="Good hygiene care helps to:"
      items={BENEFITS}
      note="Poor gum health has been linked to heart disease, diabetes complications, pregnancy risks, and infections. Regular dental hygiene visits keep your smile and your health protected."
    />
  );
}
