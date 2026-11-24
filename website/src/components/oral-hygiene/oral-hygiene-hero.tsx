import { BookButton, ButtonLink, PhotoHero } from "@/components/hims";

export function OralHygieneHero() {
  return (
    <PhotoHero
      label="Pav Dental Oral Hygiene Care"
      image="/images/generated/oral-hygiene-hero.jpg"
      alt="Warm sunlit Pav Dental oral hygiene treatment room with gentle scaling and polishing instruments"
      title="Pav Dental"
      accent="Oral Hygiene Care"
      ticks={["Prevent gum disease", "Stop bleeding and swollen gums", "Reduce bad breath"]}
      actions={
        <>
          <BookButton className="bg-white text-black hover:bg-white/85">
            Make an Appointment
          </BookButton>
          <ButtonLink
            to="/contact-us"
            variant="outline"
            className="border-white/50 bg-transparent text-white hover:bg-white hover:text-black"
          >
            Contact us
          </ButtonLink>
        </>
      }
      note={
        <>
          <p>
            Healthy gums and a clean mouth are essential for a confident smile, fresh breath, and
            long lasting teeth. At Pav Dental, our professional hygiene care focuses on preventing
            gum disease, stopping bleeding gums, reducing bad breath, and maintaining strong oral
            health for life.
          </p>
          <p className="mt-3">
            We combine gentle hygiene treatment with education and tailored advice, so every patient
            understands how to look after their teeth at home.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[14px]">
            <a href="#pricing" className="underline underline-offset-4">
              Our Hygiene Services (£45 – £75)
            </a>
            <a href="#importance" className="underline underline-offset-4">
              Why Your Oral Hygiene Matters
            </a>
          </p>
        </>
      }
    />
  );
}
