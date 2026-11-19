import { Link } from "@tanstack/react-router";
import { ButtonLink, Carousel, Heading, Section } from "@/components/hims";
import { TEAM_MEMBERS } from "@/content/team-members";

export function HomeTeamCarousel() {
  return (
    <Section id="team" theme="white" space="default">
      <div className="mx-auto max-w-2xl text-center">
        <Heading as="h2" size="h2" accent="clinicians and care team" tone="terracotta">
          Care led by real
        </Heading>
        <p className="mt-4 text-lead text-muted">
          Meet the dentists, compliance leads, and support team caring for patients in Bradford.
        </p>
      </div>

      <Carousel label="Pav Dental team" className="mt-10">
        {TEAM_MEMBERS.map((member) => (
          <Link
            key={member.slug}
            to="/team/$slug"
            params={{ slug: member.slug }}
            className="group flex h-full flex-col rounded-lg bg-tile-cream p-4 t-lift"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-sand">
              <img
                src={member.photo.src}
                alt={member.photo.alt}
                loading="lazy"
                className="size-full object-cover object-top t-zoom"
              />
            </div>
            <div className="mt-4 flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-body font-medium text-fg">{member.name}</h3>
                <p className="mt-1 text-small text-muted">{member.role}</p>
              </div>
              {member.gdc ? (
                <p className="mt-3 text-caption font-medium text-terracotta">GDC {member.gdc}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </Carousel>

      <div className="mt-8 flex justify-center">
        <ButtonLink to="/team" variant="outline">
          Meet the full team
        </ButtonLink>
      </div>
    </Section>
  );
}
