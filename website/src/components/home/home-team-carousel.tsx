import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink, Carousel, Heading, Section } from "@/components/hims";
import { TEAM_MEMBERS } from "@/content/team-members";

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

      <Carousel label="Pav Dental team" className="mt-10">
        {TEAM_MEMBERS.map((member) => (
          <Link
            key={member.slug}
            to="/team/$slug"
            params={{ slug: member.slug }}
            className="group flex h-full flex-col rounded-xl bg-tile-cream p-4 t-lift hover:bg-white"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-sand">
              <img
                src={member.photo.src}
                alt={member.photo.alt}
                loading="lazy"
                className="t-zoom size-full object-cover object-top"
              />
            </div>
            <div className="mt-4 flex flex-1 flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-body font-medium text-fg">{member.name}</h3>
                  <p className="mt-1 text-small text-muted">{member.role}</p>
                </div>
                <ArrowUpRight
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
                />
              </div>
              {member.gdc ? (
                <div>
                  <span className="inline-flex items-center rounded-pill bg-white px-2.5 py-1 text-caption font-medium text-terracotta">
                    GDC {member.gdc}
                  </span>
                </div>
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
