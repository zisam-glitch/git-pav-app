import { BookButton, ButtonLink, PhotoHero } from "@/components/hims";

export function ExtractionHero() {
  return (
    <PhotoHero
      label="Pav Dental: Same day Tooth Extraction"
      image="/images/generated/tooth-extraction-hero.jpg"
      alt="Serene Pav Dental oral surgery suite in warm natural light prepared for same-day tooth extraction"
      title="Pav Dental:"
      accent="Same day Tooth Extraction"
      lead="At Pav Dental, our experienced oral surgeons are dedicated to providing you with the highest standard of care. Utilizing the latest techniques and technologies, we ensure a comfortable and effective treatment experience."
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
        <p className="flex flex-wrap gap-x-8 gap-y-1 text-[15px] text-white/90">
          <a href="#pricing" className="underline underline-offset-4">
            Our Tooth Extraction Prices (£95 – £295)
          </a>
          <a href="#post-op" className="underline underline-offset-4">
            Post Operative Instructions
          </a>
        </p>
      }
    />
  );
}
