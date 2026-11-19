import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  ConsentPanel,
  CtaBand,
  Heading,
  Media,
  Section,
  SplitFeature,
  type ConsentItem,
} from "@/components/hims";
import { WhiteningComparison } from "./whitening-comparison";
import { WhiteningFaq } from "./whitening-faq";
import { WhiteningProducts } from "./whitening-products";
import { WhiteningVisualizer } from "./whitening-visualizer";

const WHITENING_CONSENT_ITEMS: readonly ConsentItem[] = [
  {
    title: "Suitability & Prescribing Dentist Review",
    desc: "It is advised that children under the age of 16 (18 in the European Union due to this being a legal requirement), pregnant women, and those sensitive to hydrogen peroxide should not use whitening strips. Patients with teeth sensitive to cold, heat or acid, or those who suffer from oral ulceration should discuss this with their prescribing dentist before undergoing a course of whitening treatment.",
    icon: FileText,
  },
  {
    title: "Temporary Sensitivity & Gum Contact",
    desc: "It is not uncommon to experience tooth sensitivity and / or gum irritation whilst whitening your teeth. Contact with gums should be minimised to avoid gum irritation, and if problems persist, discontinue use and consult your dentist.",
    icon: AlertCircle,
  },
  {
    title: "Temporary White Spots",
    desc: "Temporary white spots may appear after whitening; they are not harmful and will disappear within 24 hours.",
    icon: CheckCircle2,
  },
];

export function WhiteningPage() {
  return (
    <main className="bg-white">
      <Section
        id="top"
        theme="white"
        space="sm"
        className="pt-6 md:pt-10"
        aria-label="Teeth whitening services"
      >
        <SplitFeature
          reverse
          media={
            <Media
              src="/images/generated/whitening-hero.jpg"
              alt="Bright minimalist teeth whitening consultation room and care vessels in warm sunlight"
              ratio="4 / 3"
              tone="cream"
              priority
            />
          }
        >
          <div>
            <Heading as="h1" size="hero" accent="Developed for You" tone="terracotta">
              Designed by Dentists
            </Heading>
            <p className="mt-5 max-w-xl text-lead text-muted">
              We offer a carefully curated selection of whitening ranges designed to effectively
              remove stains and discoloration, giving you the confidence to flash your pearly
              whites.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton>Book Now</BookButton>
              <ButtonLink href="#products" variant="outline">
                Explore ranges
              </ButtonLink>
              <CallButton variant="ghost" />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
              <a
                href="#comparison-matrix"
                className="underline underline-offset-4 t-colors hover:text-terracotta"
              >
                Compare treatments (£65 – £495)
              </a>
              <a
                href="#consent"
                className="underline underline-offset-4 t-colors hover:text-terracotta"
              >
                Informed Consent for Tooth Whitening
              </a>
            </div>
          </div>
        </SplitFeature>
      </Section>

      <WhiteningProducts />
      <WhiteningVisualizer />
      <WhiteningComparison />

      <ConsentPanel
        id="consent"
        theme="cream"
        title="Informed Consent for"
        accent="Tooth Whitening"
        intro="Before starting a course of teeth whitening, please review the clinical guidance and suitability considerations with your prescribing dentist."
        items={WHITENING_CONSENT_ITEMS}
      />

      <WhiteningFaq />

      <CtaBand
        theme="brown"
        title="Get In"
        accent="Touch"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Appointment</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Ready to take control of your dental health? Contact us to book your appointment today!
      </CtaBand>
    </main>
  );
}
