import { BookButton, CallButton } from "@/components/hims";
import { ClosingBand } from "@/components/hims/closing-band";
import { ContactForm } from "@/components/home/contact-form";
import { MouthguardsColour } from "./mouthguards-colour";
import { MouthguardsHero } from "./mouthguards-hero";
import { MouthguardsOrdering } from "./mouthguards-ordering";
import { MouthguardsPersonalisation } from "./mouthguards-personalisation";
import { MouthguardsUsers } from "./mouthguards-users";
import { MouthguardsWhyChoose } from "./mouthguards-why-choose";

export function MouthguardsPage() {
  return (
    <main>
      <MouthguardsHero />
      <MouthguardsOrdering />
      <MouthguardsWhyChoose />
      <MouthguardsColour />
      <MouthguardsPersonalisation />
      <MouthguardsUsers />
      <ContactForm />
      <ClosingBand
        title="Make an"
        highlight="Appointment"
        lead="Designed for comfort, accuracy and full protection"
        actions={
          <>
            <BookButton variant="butter">Make an Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      />
    </main>
  );
}
