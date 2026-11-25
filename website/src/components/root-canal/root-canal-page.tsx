import { ContactForm } from "@/components/home/contact-form";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  DarkQuestion,
  FloatingCta,
  IncludedList,
  Section,
} from "@/components/hims";
import { Clock, Gem, ShieldCheck, Stethoscope } from "lucide-react";
import { RootCanalConsent } from "./root-canal-consent";
import { RootCanalContact } from "./root-canal-contact";
import { RootCanalFaq } from "./root-canal-faq";
import { RootCanalHero } from "./root-canal-hero";
import { RootCanalHow } from "./root-canal-how";
import { RootCanalPricing } from "./root-canal-pricing";

export function RootCanalPage() {
  return (
    <main className="bg-white">
      <RootCanalHero />
      <RootCanalPricing />
      <RootCanalHow />
      <Section theme="white" aria-labelledby="root-canal-included-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="root-canal-included-heading"
            className="text-[clamp(34px,4vw,52px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            Everything beyond the procedure comes with{" "}
            <span className="text-[#4a5c66]">Pav Dental</span>
          </h2>
        </div>
        <IncludedList
          items={[
            { text: "Local anaesthesia for comfort", icon: Stethoscope },
            { text: "Most root canals take 45–90 minutes", icon: Clock },
            { text: "A crown to protect the tooth", icon: Gem },
            { text: "Clear aftercare guidance", icon: ShieldCheck },
          ]}
        />
      </Section>
      <Section theme="white" space="sm" aria-label="Could you need a root canal?">
        <DarkQuestion
          lead="Could you need a"
          highlight="root canal?"
          text="You may need a root canal if the tooth pulp is infected or inflamed due to deep decay, cracks, repeated dental procedures, or trauma. Symptoms often include severe pain, sensitivity, or swelling."
          chips={["Severe pain", "Sensitivity", "Swelling", "Deep decay"]}
          cta={
            <ButtonLink href="#consent" variant="gold">
              Read the consent
            </ButtonLink>
          }
        />
      </Section>
      <RootCanalConsent />
      <RootCanalFaq />
      <ContactForm />
      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
