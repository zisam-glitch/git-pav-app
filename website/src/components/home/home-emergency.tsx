import { BookButton, ButtonLink, CallButton, Heading, Media, Section } from "@/components/hims";

export function HomeEmergency() {
  return (
    <Section id="emergency" theme="white" width="max" space="sm" className="px-2 md:px-4">
      <div className="rounded-xl bg-brown py-14 text-white md:py-[7.5rem]">
        <div className="wrap-bento">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div>
              <p className="text-label text-gold">Urgent Dental Care</p>
              <Heading as="h2" size="hero" accent="in Bradford" tone="gold" className="mt-3">
                24/7 Emergency Dental Services
              </Heading>
              <p className="mt-5 text-lead text-white">
                We offer same day emergency dental care 24-hours a day, seven days a week.
              </p>
              <p className="mt-4 max-w-2xl text-body text-white/80">
                We understand that dental emergencies can occur at any time, which is why we offer
                same day emergency dental care 24-hours a day, seven days a week, including National
                and Bank Holidays. Our dedicated team is always on hand to provide immediate and
                effective dental treatment, ensuring that you receive the care you need when you
                need it most.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <BookButton variant="gold">Book Online</BookButton>
                <CallButton variant="glass" />
                <ButtonLink to="/services/emergency-dental" variant="glass">
                  Read More
                </ButtonLink>
              </div>
            </div>

            <Media
              alt="Pav Dental emergency dental suite ready for same-day urgent care"
              ratio="4 / 3"
              tone="brown"
              className="bg-white/7"
            />
          </div>

          <div className="mt-10 grid gap-2 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-6 rounded-md bg-brown-deep p-6 md:p-8">
              <div>
                <p className="text-caption text-gold">EMERGENCY CONSULTATIONS</p>
                <h3 className="mt-2 text-h3-md text-white">£45 consultation</h3>
                <p className="mt-1 text-h4 text-gold">£90* out-of-hours consultation</p>
                <p className="mt-3 text-body text-white/80">
                  Covering Bradford 24 Hours 7 days of the week including National and Bank
                  Holidays.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <CallButton variant="gold" size="sm" />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-md bg-white/7 p-6 md:p-8">
              <div>
                <p className="text-caption text-gold">SAME-DAY ACCESS</p>
                <h3 className="mt-2 text-h3-md text-white">
                  Require emergency dental care and want same day treatment?
                </h3>
                <p className="mt-3 text-body text-white/80">
                  Call our Bradford emergency line or book online for fast urgent assessment.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink to="/services/emergency-dental" variant="light" size="sm">
                  VISIT
                </ButtonLink>
                <BookButton variant="glass" size="sm">
                  Book Now
                </BookButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
