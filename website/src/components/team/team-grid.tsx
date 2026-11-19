import { Link } from "@tanstack/react-router";
import { BookButton, CallButton, CtaBand, Heading, Section } from "@/components/hims";
import { TEAM_MEMBERS } from "@/content/team-members";
import { TeamPhoto } from "./team-photo";

/** The team page: one card per person, each linking to their own profile page. */
export function TeamGrid() {
  return (
    <>
      <Section theme="white" space="default">
        <div className="mx-auto max-w-2xl text-center">
          <Heading as="h1" size="hero" accent="& Staff" tone="terracotta" inline>
            Dentists
          </Heading>
          <p className="mt-4 text-lead text-muted">
            We have a dedicated team consisting of highly skilled dentists and staff who works
            relentlessly to preserve your happy smile.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM_MEMBERS.map((member, index) => (
            <li key={member.slug}>
              <Link
                to="/team/$slug"
                params={{ slug: member.slug }}
                className="group flex h-full flex-col rounded-xl bg-tile-cream p-4 t-lift"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                  <TeamPhoto
                    member={member}
                    priority={index < 4}
                    className="size-full object-cover object-top t-zoom"
                  />
                </div>
                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <div>
                    <h2 className="text-h4 text-fg">{member.name}</h2>
                    <p className="mt-1 text-small text-muted">{member.role}</p>
                  </div>
                  {member.gdc ? (
                    <p className="mt-3 text-caption font-medium text-terracotta">
                      GDC: {member.gdc}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        theme="brown"
        title="Ready to book"
        accent="with our team?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Open 24 hours, 7 days a week.
      </CtaBand>
    </>
  );
}
