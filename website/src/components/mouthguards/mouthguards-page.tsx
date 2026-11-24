import { BookButton, CallButton, CtaBand, FloatingCta } from "@/components/hims";
import { ContactForm } from "@/components/home/contact-form";
import { MouthguardsColour } from "./mouthguards-colour";
import { MouthguardsHero } from "./mouthguards-hero";
import { MouthguardsOrdering } from "./mouthguards-ordering";
import { MouthguardsPersonalisation } from "./mouthguards-personalisation";
import { MouthguardsUsers } from "./mouthguards-users";
import { MouthguardsWhyChoose } from "./mouthguards-why-choose";

export function MouthguardsPage() {
  return (
    <main className="bg-white">
      <MouthguardsHero />
      <MouthguardsOrdering />
      <MouthguardsColour />
      <MouthguardsPersonalisation />
      <MouthguardsUsers />
      <MouthguardsWhyChoose />
      <ContactForm />
      <CtaBand
        theme="brown"
        title="Make an"
        accent="Appointment"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Make an Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Designed for comfort, accuracy and full protection
      </CtaBand>
      <FloatingCta>
        <BookButton>Make an Appointment</BookButton>
      </FloatingCta>
    </main>
  );
}
