import { BookButton, CallButton, Heading, Section, Tile } from "@/components/hims";

export function ExtractionGuarantee() {
  return (
    <Section theme="brown" width="bento" space="lg">
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <p className="text-label text-gold">Immediate Relief</p>
          <Heading as="h2" size="hero" accent="Same Day Treatment" tone="gold" className="mt-3">
            Guaranteed Tooth Extraction
          </Heading>
          <p className="mt-5 text-lead text-white">
            We understand that tooth pain can be unbearable and waiting is not an option.
            That&rsquo;s why we guarantee same-day tooth extraction services to provide you with
            immediate relief.
          </p>
          <p className="mt-4 text-body text-white/80">
            Our highly skilled dental professionals are dedicated to ensuring that your experience
            is as comfortable and stress-free as possible. Using the latest techniques and
            state-of-the-art equipment, we can quickly and safely remove the affected tooth,
            alleviating your pain and preventing further complications.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookButton variant="gold">Make an Appointment</BookButton>
            <CallButton variant="glass" />
          </div>
        </div>

        <div className="grid gap-4">
          <Tile tone="glass" className="p-6 md:p-8">
            <p className="text-caption font-medium text-gold">SAME-DAY CARE</p>
            <h3 className="mt-2 text-h4 text-white">Alleviating your pain promptly</h3>
            <p className="mt-3 text-body text-white/80">
              In addition to our same-day extraction services, we offer comprehensive aftercare
              support to help you recover swiftly and return to your daily routine with minimal
              disruption.
            </p>
          </Tile>

          <Tile tone="glass" className="p-6 md:p-8">
            <p className="text-caption font-medium text-gold">ONGOING GUIDANCE</p>
            <h3 className="mt-2 text-h4 text-white">Post-extraction support</h3>
            <p className="mt-3 text-body text-white/80">
              Our team is always available to answer any questions and provide guidance on how to
              care for your mouth post-extraction.
            </p>
          </Tile>
        </div>
      </div>
    </Section>
  );
}
