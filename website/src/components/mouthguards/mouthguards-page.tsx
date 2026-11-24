import { BookButton, CallButton, CtaBand } from "@/components/hims";
import { ContactForm } from "@/components/home/contact-form";
import { MouthguardsOrdering } from "./mouthguards-ordering";
import { MouthguardsProduct } from "./mouthguards-product";
import { MouthguardsUsers } from "./mouthguards-users";
import { MouthguardsWhyChoose } from "./mouthguards-why-choose";

export function MouthguardsPage() {
  return (
    <main className="bg-white">
      <MouthguardsProduct />
      <MouthguardsOrdering />
      <MouthguardsWhyChoose />
      <MouthguardsUsers />
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
    </main>
  );
}
