import {
  AlertCircle,
  Beaker,
  CheckCircle2,
  Droplets,
  FileText,
  Flag,
  Layers,
  ShieldCheck,
} from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CompareTable,
  ConsentPanel,
  CtaBand,
  DarkQuestion,
  FeatureBento,
  FloatingCta,
  IncludedList,
  Section,
  ServiceHeroLayout,
  StepsPanel,
  type ConsentItem,
} from "@/components/hims";
import { WhiteningFaq } from "./whitening-faq";
import { PRODUCTS_DATA } from "./whitening-data";

const [STRIPS, KIT, OFFICE] = PRODUCTS_DATA;

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

const STEPS = [
  {
    title: "Choose",
    accent: "your range",
    text: "Pick from whitening strips, home whitening kits, or a combined home and in-office course, each designed by dentists to remove stains and discoloration.",
    image: "/images/generated/whitening-strips.jpg",
    alt: "Mint dissolving whitening strips beside an open box on a warm backdrop",
  },
  {
    title: "Whiten",
    accent: "your way",
    text: "Use dissolving strips on the go, a day or night kit at home, or book an in-office session with our hybrid dual-action gel.",
    image: "/images/generated/whitening-home-kit.jpg",
    alt: "Whitening gel syringes, polishing paste and a tray on a warm backdrop",
  },
  {
    title: "Maintain",
    accent: "your smile",
    text: "Continue with the BEAM Professional Whitening Kit at home after your in-office session to keep your smile bright.",
    image: "/images/generated/whitening-home-in-office.jpg",
    alt: "In-office whitening gel, applicator and retractor on a warm backdrop",
  },
];

export function WhiteningPage() {
  return (
    <main className="bg-white">
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
            <h1 className="text-hero">
              <span className="text-[#8b8d92]">Designed by Dentists</span>
              <span className="block text-[#2a2a2c]">Developed for You</span>
            </h1>
            <p className="mt-6 max-w-xl text-lead text-muted">
              We offer a carefully curated selection of whitening ranges designed to effectively
              remove stains and discoloration, giving you the confidence to flash your pearly
              whites.
            </p>
          </>
        }
      >
        <ul className="list-none space-y-4">
          {[STRIPS, KIT, OFFICE].map((p) => (
            <li key={p.id} className="flex items-center gap-4 text-[17px] text-[#2a2a2c]">
              <img
                src={p.image}
                alt=""
                aria-hidden
                className="size-11 shrink-0 rounded-full object-cover"
              />
              <span>
                {p.name} <span className="text-[#6b6b70] tabular-nums">· {p.price}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <BookButton>Book Now</BookButton>
          <ButtonLink href="#products" variant="outline">
            Explore ranges
          </ButtonLink>
          <CallButton variant="ghost" />
        </div>
        <div className="t-hero-links mt-7 flex flex-wrap gap-x-6 gap-y-2 text-small text-muted">
          <a
            href="#products"
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

      <Section id="products" theme="white" aria-labelledby="whitening-products-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="whitening-products-heading"
            className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            <span className="text-[#8a4242]">Award Winning</span> Whitening
          </h2>
          <p className="mt-4 text-lead text-muted">
            Experience our award-winning whitening treatments for a brilliantly radiant smile.
            Discover the difference of our acclaimed whitening services today.
          </p>
        </div>
        <div className="mt-12">
          <FeatureBento
            feature={{
              title: OFFICE.name,
              kicker: OFFICE.tags[0],
              price: OFFICE.price,
              image: OFFICE.image,
              alt: OFFICE.alt,
              href: "#compare",
            }}
            items={[
              {
                title: STRIPS.name,
                kicker: STRIPS.tags[0],
                price: STRIPS.price,
                image: STRIPS.image,
                alt: STRIPS.alt,
                href: "#compare",
              },
              {
                title: KIT.name,
                kicker: KIT.tags[0],
                price: KIT.price,
                image: KIT.image,
                alt: KIT.alt,
                href: "#compare",
              },
            ]}
            help={{
              title: "Talk to our team",
              text: "Not sure which range suits you? Book an appointment and we will guide you.",
              cta: <BookButton variant="gold">Appointment</BookButton>,
            }}
          />
        </div>
      </Section>

      <Section theme="white" space="sm" aria-label="Whitening, built for you">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]">
            Whitening, <span className="text-[#4a5c66]">built for you</span>
          </h2>
        </div>
        <StepsPanel steps={STEPS} />
      </Section>

      <Section id="compare" theme="white" aria-labelledby="whitening-compare-heading">
        <div className="mx-auto max-w-[900px]">
          <h2
            id="whitening-compare-heading"
            className="text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            A range of <span className="text-[#4a5c66]">options</span>
          </h2>
          <p className="mt-4 max-w-xl text-lead text-muted">
            Whitening is not one-size-fits-all. Compare our three ranges and choose the one that
            fits your smile.
          </p>
          <div className="mt-10">
            <CompareTable
              columns={[
                { name: STRIPS.name, sub: STRIPS.price },
                { name: KIT.name, sub: KIT.price },
                { name: OFFICE.name, sub: OFFICE.price },
              ]}
              rows={[
                {
                  label: "Ranges",
                  cells: [STRIPS.tags.join(" · "), KIT.tags.join(" · "), OFFICE.tags.join(" · ")],
                },
                {
                  label: "What it is",
                  cells: [
                    "Mint-flavored dissolving strips with an enamel-safe formula",
                    "Premium UK-made whitening gel crafted by dentists",
                    "In-office gel with a hybrid dual-action formula",
                  ],
                },
                {
                  label: "Formula",
                  cells: [
                    "Premium strength, non-slip technology",
                    "Potassium nitrate, calcium and fluoride to minimize sensitivity",
                    "6% Hydrogen Peroxide + PAP, with a pre-whitening varnish",
                  ],
                },
                {
                  label: "What's included",
                  cells: [
                    "14 applications (28 strips)",
                    "4 x 3ml syringes and a 30ml pre-polishing paste",
                    "In-office session, then the BEAM Professional Whitening Kit at home",
                  ],
                },
                {
                  label: "Best for",
                  cells: [
                    "On-the-go touch-ups and smile maintenance",
                    "Day or night whitening at home",
                    "A professional start with ongoing at-home care",
                  ],
                },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section theme="white" aria-labelledby="whitening-included-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="whitening-included-heading"
            className="text-[clamp(34px,4vw,52px)] leading-[1.08] font-normal tracking-[-0.025em] text-[#2a2a2c]"
          >
            Everything beyond your whitening comes with{" "}
            <span className="text-[#4a5c66]">Pav Dental</span>
          </h2>
        </div>
        <IncludedList
          items={[
            { text: "Designed by dentists", icon: ShieldCheck },
            { text: "UK-made whitening gel", icon: Flag },
            { text: "Enamel-safe formulas", icon: Droplets },
            { text: "Hydrogen peroxide or carbamide peroxide", icon: Beaker },
            { text: "Everything in the pack to get started", icon: Layers },
          ]}
        />
      </Section>

      <Section theme="white" space="sm" aria-label="Is whitening right for you?">
        <DarkQuestion
          lead="Could whitening be"
          highlight="right for you?"
          text="If your teeth are sensitive to cold, heat or acid, or you are not sure whitening is suitable, talk to your dentist before you start."
          chips={["Strips", "Home kits", "In-office", "Aftercare"]}
          cta={
            <ButtonLink href="#consent" variant="gold">
              Check suitability
            </ButtonLink>
          }
        />
      </Section>

      <ConsentPanel
        id="consent"
        theme="white"
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

      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
