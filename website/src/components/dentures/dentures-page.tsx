import { BookButton, CallButton, CtaBand, FloatingCta } from "@/components/hims";
import { DenturesContact } from "./dentures-contact";
import { DenturesFaq } from "./dentures-faq";
import { DenturesProduct } from "./dentures-product";
import { DenturesSolutions } from "./dentures-solutions";

export function DenturesPage() {
  return (
    <main className="bg-white">
      <DenturesProduct />
      <DenturesSolutions />
      <DenturesFaq />
      <DenturesContact />
      <CtaBand
        theme="brown"
        title="Book your free consultation"
        accent="today"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Book your free consultation today with one of our GDC-registered dentists to start your
        journey towards a confident, healthy smile.
      </CtaBand>
      <FloatingCta>
        <BookButton>Make an Appointment</BookButton>
      </FloatingCta>
    </main>
  );
}
