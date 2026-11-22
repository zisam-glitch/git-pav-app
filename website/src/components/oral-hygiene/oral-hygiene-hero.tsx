import { PoundSterling, Scissors, Sparkles } from "lucide-react";
import { BookButton, ButtonLink } from "@/components/hims";
import { TreatmentHero } from "@/components/hims/treatment-hero";

const ANCHOR =
  "inline-flex min-h-11 items-center underline underline-offset-4 t-colors hover:text-terracotta";

export function OralHygieneHero() {
  return (
    <TreatmentHero
      label="Pav Dental Oral Hygiene Care"
      title="Pav Dental"
      accent="Oral Hygiene Care"
      lead={
        <>
          Healthy gums and a clean mouth are essential for a confident smile, fresh breath, and long
          lasting teeth. At Pav Dental, our professional hygiene care focuses on preventing gum
          disease, stopping bleeding gums, reducing bad breath, and maintaining strong oral health
          for life.
          <span className="mt-4 block">
            We combine gentle hygiene treatment with education and tailored advice, so every patient
            understands how to look after their teeth at home.
          </span>
        </>
      }
      facts={[
        { icon: Sparkles, text: "Basic – Polish Only (£45)" },
        { icon: Scissors, text: "Intermediate – Scale Only (£65)" },
        { icon: PoundSterling, text: "Advanced – Scale & Polish (£75)" },
      ]}
      actions={
        <>
          <BookButton>Make an Appointment</BookButton>
          <ButtonLink to="/contact-us" variant="outline">
            Contact us
          </ButtonLink>
        </>
      }
      note={
        <span className="flex flex-wrap gap-x-6">
          <a href="#pricing" className={ANCHOR}>
            Our Hygiene Services (£45 – £75)
          </a>
          <a href="#importance" className={ANCHOR}>
            Why Your Oral Hygiene Matters
          </a>
        </span>
      }
      tiles={[
        {
          src: "/images/generated/oral-hygiene-hero.jpg",
          alt: "Warm sunlit Pav Dental oral hygiene treatment room with gentle scaling and polishing instruments",
          tone: "sage",
        },
      ]}
    />
  );
}
