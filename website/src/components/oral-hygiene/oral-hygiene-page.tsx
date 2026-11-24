import { Activity, Droplets, HeartPulse, ShieldCheck, Sparkles, Wind } from "lucide-react";
import {
  BookButton,
  CallButton,
  CompareTable,
  CtaBand,
  DarkQuestion,
  FeatureBento,
  FloatingCta,
  IncludedList,
  Section,
  StepsPanel,
  ButtonLink,
} from "@/components/hims";
import { ContactForm } from "@/components/home/contact-form";
import { OralHygieneConsent } from "./oral-hygiene-consent";
import { OralHygieneFaq } from "./oral-hygiene-faq";
import { OralHygieneHero } from "./oral-hygiene-hero";

const H2 = "text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]";

const BASIC = {
  name: "Basic – Polish Only",
  price: "£45",
  desc: "A gentle professional polish to remove surface stains and plaque build-up. Ideal for patients who maintain good oral hygiene and simply want fresher breath and a brighter smile. This treatment focuses on improving appearance and smoothness of the teeth but does not include deep stain or tartar removal.",
  best: "Best for: light staining from tea, coffee, or smoking.",
  image: "/images/generated/home-checkup.jpg",
};
const INTER = {
  name: "Intermediate – Scale Only",
  price: "£65",
  desc: "A professional scale to remove hardened plaque and tartar from around the teeth and gumline. This treatment focuses on improving gum health by removing deposits that cannot be cleaned at home. It helps reduce inflammation, bleeding gums, and bad breath.",
  best: "Best for: patients with noticeable tartar build-up or early gum concerns.",
  image: "/images/generated/home-tile-checkup.jpg",
};
const ADV = {
  name: "Advanced – Scale & Polish",
  price: "£75",
  desc: "A comprehensive clean combining full scaling and polishing for optimal oral health and aesthetics. Tartar and plaque are thoroughly removed from above and just below the gumline, followed by polishing to smooth the teeth and enhance shine. Topical anaesthesia can be used for added comfort if you have sensitive gums.",
  best: "Best for: moderate build-up, gum inflammation, or patients wanting the most complete clean and refresh.",
  image: "/images/generated/oral-hygiene-showcase.jpg",
};

const STEPS = [
  {
    title: "Choose",
    accent: "your clean",
    text: "Pick polish only, scale only, or a full scale and polish, depending on staining, tartar build-up and how your gums feel.",
    image: "/images/generated/oral-hygiene-showcase.jpg",
    alt: "Hygiene scaling and polishing instruments arranged in warm studio light",
  },
  {
    title: "Relax",
    accent: "and stay comfortable",
    text: "Hygiene treatment is usually very comfortable. If your gums are sensitive, we can apply a numbing gel to make the treatment easier and more relaxing.",
    image: "/images/generated/oral-hygiene-hero.jpg",
    alt: "Warm sunlit Pav Dental hygiene treatment room",
  },
  {
    title: "Maintain",
    accent: "your health",
    text: "Most patients benefit from hygiene care every 3 to 6 months. Our dentist or hygienist will recommend the right interval for you.",
    image: "/images/generated/home-checkup.jpg",
    alt: "A relaxed dental check-up appointment",
  },
];

const NEEDS = [
  "Bleeding gums",
  "Bad breath",
  "Gum swelling or tenderness",
  "Stains on teeth",
  "Loose teeth",
  "Sensitive gums",
  "Diabetes or medical conditions that affect healing",
];

export function OralHygienePage() {
  return (
    <main className="bg-white">
      <OralHygieneHero />

      <Section id="importance" theme="white" aria-labelledby="oral-hygiene-importance-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="oral-hygiene-importance-heading" className={H2}>
            Why Your Oral Hygiene <span className="text-[#8a4242]">Matters</span>
          </h2>
          <p className="mt-4 text-lead text-muted">Good hygiene care helps to:</p>
        </div>
        <IncludedList
          items={[
            { text: "Prevent gum disease", icon: ShieldCheck },
            { text: "Stop bleeding and swollen gums", icon: Droplets },
            { text: "Reduce bad breath", icon: Wind },
            { text: "Remove plaque and hard tartar", icon: Sparkles },
            { text: "Improve overall health", icon: HeartPulse },
            { text: "Protect dental work like crowns and implants", icon: Activity },
          ]}
        />
        <p className="mx-auto mt-8 max-w-xl text-center text-lead text-muted">
          Poor gum health has been linked to heart disease, diabetes complications, pregnancy risks,
          and infections. Regular dental hygiene visits keep your smile and your health protected.
        </p>
      </Section>

      <Section id="pricing" theme="white" aria-labelledby="oral-hygiene-services-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="oral-hygiene-services-heading" className={H2}>
            Our Hygiene <span className="text-[#8a4242]">Services</span>
          </h2>
        </div>
        <div className="mt-12">
          <FeatureBento
            feature={{
              title: ADV.name,
              kicker: "Most complete clean",
              price: ADV.price,
              image: ADV.image,
              alt: "Hygiene scaling and polishing instruments in warm studio light",
              href: "#compare",
            }}
            items={[
              { title: BASIC.name, price: BASIC.price, image: BASIC.image, alt: "", href: "#compare" },
              { title: INTER.name, price: INTER.price, image: INTER.image, alt: "", href: "#compare" },
            ]}
            help={{
              title: "Talk to our team",
              text: "Not sure which clean you need? Our dentist or hygienist will recommend the right one for you.",
              cta: <BookButton variant="gold">Make an Appointment</BookButton>,
            }}
          />
        </div>
      </Section>

      <Section theme="white" space="sm" aria-label="Hygiene care, built for you">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className={H2}>
            Hygiene care, <span className="text-[#4a5c66]">built for you</span>
          </h2>
        </div>
        <StepsPanel steps={STEPS} />
      </Section>

      <Section id="compare" theme="white" aria-labelledby="oral-hygiene-compare-heading">
        <div className="mx-auto max-w-[900px]">
          <h2 id="oral-hygiene-compare-heading" className={H2}>
            A range of <span className="text-[#4a5c66]">options</span>
          </h2>
          <div className="mt-10">
            <CompareTable
              columns={[
                { name: BASIC.name, sub: BASIC.price },
                { name: INTER.name, sub: INTER.price },
                { name: ADV.name, sub: ADV.price },
              ]}
              rows={[
                { label: "What it is", cells: [BASIC.desc, INTER.desc, ADV.desc] },
                { label: "Best for", cells: [BASIC.best, INTER.best, ADV.best] },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section theme="white" space="sm" aria-label="Do you need hygiene treatment?">
        <DarkQuestion
          lead="You may need to see our hygienist"
          highlight="if you have:"
          text="Regular hygiene appointments are also essential if you wear braces, dentures, crowns, veneers, bridges, or implants."
          chips={NEEDS}
          cta={
            <ButtonLink href="#faq" variant="gold">
              Read the FAQs
            </ButtonLink>
          }
        />
      </Section>

      <OralHygieneConsent />
      <OralHygieneFaq />
      <ContactForm />
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
