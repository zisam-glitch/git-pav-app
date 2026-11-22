import { BookButton, ButtonLink, CallButton, CtaBand, Heading, Section } from "@/components/hims";
import { LeaderCarousel } from "@/components/hims/leader-carousel";
import { PersonCapsule } from "@/components/hims/person-capsule";
import { TeamPhoto } from "@/components/team/team-photo";
import { TEAM_MEMBERS } from "@/content/team-members";

/**
 * The people on `/about`: a slider of capsule portraits (live photo, name, role, GDC number), each linking to the
 * profile, then the live "Get In Touch" band. Hims reference: the executive slider of the "Clinical excellence"
 * capture (`docs/redesign/website/hims-patterns/clinical-excellence.md`).
 */
export function Team() {
  return (
    <>
      <Section theme="white" space="default">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Heading
            as="h2"
            size="h2-md"
            accent="clinicians and care team"
            tone="terracotta"
            className="max-w-3xl"
          >
            Care led by real
          </Heading>
          <ButtonLink to="/team" variant="outline">
            Meet our dentists
          </ButtonLink>
        </div>

        <LeaderCarousel label="Pav Dental team" className="mt-10">
          {TEAM_MEMBERS.map((member, index) => (
            <PersonCapsule
              key={member.slug}
              slug={member.slug}
              name={member.name}
              role={member.role}
              gdc={member.gdc}
              photo={
                <TeamPhoto
                  member={member}
                  priority={index < 4}
                  className="size-full object-cover object-[50%_25%]"
                />
              }
            />
          ))}
        </LeaderCarousel>
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
