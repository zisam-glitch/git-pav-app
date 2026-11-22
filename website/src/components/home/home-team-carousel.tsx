import { ButtonLink, Heading, Section } from "@/components/hims";
import { LeaderCarousel } from "@/components/hims/leader-carousel";
import { PersonCapsule } from "@/components/hims/person-capsule";
import { TeamPhoto } from "@/components/team/team-photo";
import { TEAM_MEMBERS } from "@/content/team-members";

/**
 * The home team row, built like the Hims executive slider (the same capsule portraits as `/about` and `/team`):
 * tall capsule photo, name, role and, for clinicians, the GDC number, each linking to the profile.
 */
export function HomeTeamCarousel() {
  return (
    <Section id="team" theme="white" space="default">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-caption font-medium text-copper">Clinical leadership</p>
        <Heading as="h2" size="h2" accent="clinicians and care team" tone="terracotta" className="mt-2">
          Care led by real
        </Heading>
        <p className="mt-4 text-lead text-muted">
          Meet the dentists, compliance leads, and support team caring for patients in Bradford.
        </p>
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

      <div className="mt-2 flex justify-center">
        <ButtonLink to="/team" variant="outline">
          Meet the full team
        </ButtonLink>
      </div>
    </Section>
  );
}
