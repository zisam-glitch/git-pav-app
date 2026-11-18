import { MouthguardsHero } from "./mouthguards-hero";
import { MouthguardsOrdering } from "./mouthguards-ordering";
import { MouthguardsWhyChoose } from "./mouthguards-why-choose";
import { MouthguardsColour } from "./mouthguards-colour";
import { MouthguardsPersonalisation } from "./mouthguards-personalisation";
import { MouthguardsUsers } from "./mouthguards-users";

export function MouthguardsPage() {
  return (
    <main className="bg-[#FBF8F5]">
      <MouthguardsHero />
      <MouthguardsOrdering />
      <MouthguardsWhyChoose />
      <MouthguardsColour />
      <MouthguardsPersonalisation />
      <MouthguardsUsers />
    </main>
  );
}
