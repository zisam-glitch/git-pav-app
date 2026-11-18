import { BookButton, ButtonLink, CallButton, CtaBand, Heading, Section } from "@/components/hims";
import { TeamShowcase } from "@/components/ui/team-showcase";
import { TEAM_MEMBERS } from "@/content/team-members";

export function Team() {
  const members = TEAM_MEMBERS.map((member) => ({
    id: member.slug,
    name: member.name,
    role: member.role,
    image: member.photo.src,
    gdc: member.gdc,
  }));

  return (
    <>
      <Section theme="white" space="default">
        <div className="mx-auto max-w-2xl text-center">
          <Heading as="h2" size="h2" accent="clinicians and care team" tone="terracotta">
            Care led by real
          </Heading>
          <p className="mt-4 text-lead text-muted">
            The dedicated dentists, compliance leads, and support team behind Pav Dental in
            Bradford.
          </p>
        </div>

        <div className="mt-10">
          <TeamShowcase members={members} />
        </div>

        <div className="mt-8 flex justify-center">
          <ButtonLink to="/team" variant="outline">
            Meet our dentists
          </ButtonLink>
        </div>
      </Section>

      <CtaBand
        theme="brown"
        title="Get In"
        accent="Touch"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <ButtonLink to="/contact-us" variant="glass">
              Contact Us
            </ButtonLink>
            <CallButton variant="glass" />
          </>
        }
      >
        Ready to take control of your dental health? Contact us to book your appointment today!
      </CtaBand>
    </>
  );
}
