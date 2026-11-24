import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import {
  ServiceHeroLayout,
  BookButton,
  ButtonLink,
  CallButton,
  ConsentPanel,
  CtaBand,
  Heading,
  Tile,
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
    <main className="bg-bg">
      <ServiceHeroLayout
        label="Teeth whitening services"
        images={[
          {
            src: "/images/generated/whitening-hero.jpg",
            alt: "Bright minimalist teeth whitening consultation room and care vessels in warm sunlight",
          },
          { src: "/images/generated/whitening-home-in-office.jpg", alt: "" },
          { src: "/images/generated/whitening-home-kit.jpg", alt: "" },
          { src: "/images/generated/whitening-strips.jpg", alt: "" },
        ]}
        head={
          <>
            <span className="inline-flex items-center rounded-pill border border-border bg-cream px-3.5 py-1 text-caption font-medium text-terracotta">
              Professional Teeth Whitening
            </span>
            <Heading
              as="h1"
              size="hero"
              accent="Developed for You"
              tone="terracotta"
              className="mt-4"
            >
              Designed by Dentists
            </Heading>
          </>
        }
      >
        <p className="mt-5 max-w-xl text-lead text-muted">
          We offer a carefully curated selection of whitening ranges designed to effectively remove
          stains and discoloration, giving you the confidence to flash your pearly whites.
        </p>

        <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
          <Tile tone="grey" className="border border-border/60 p-3.5">
            <p className="text-caption font-medium text-copper">Whitening Strips</p>
            <p className="mt-1 text-h4 font-medium text-fg tabular-nums">£65</p>
          </Tile>
          <Tile tone="grey" className="border border-border/60 p-3.5">
            <p className="text-caption font-medium text-copper">Home Kits</p>
            <p className="mt-1 text-h4 font-medium text-fg tabular-nums">£295</p>
          </Tile>
          <Tile tone="grey" className="border border-border/60 p-3.5">
            <p className="text-caption font-medium text-copper">Home &amp; In-Office</p>
            <p className="mt-1 text-h4 font-medium text-fg tabular-nums">£495</p>
          </Tile>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <BookButton>Book Now</BookButton>
          <ButtonLink href="#products" variant="outline">
            Explore ranges
          </ButtonLink>
          <CallButton variant="ghost" />
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-small text-muted">
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
      </ServiceHeroLayout>

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
