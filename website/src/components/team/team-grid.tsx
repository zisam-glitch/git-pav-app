import { BookButton, CallButton, CtaBand, Heading, Section } from "@/components/hims";
import { PersonCapsule } from "@/components/hims/person-capsule";
import { TEAM_MEMBERS } from "@/content/team-members";
import { TeamPhoto } from "./team-photo";

/**
 * The team page: the live heading and lead, then one capsule portrait per person (live photo, name, role and GDC
 * number), each linking to their own profile page. Hims reference: the executive capsules of the "Clinical
 * excellence" capture (`docs/redesign/website/hims-patterns/clinical-excellence.md`).
 */
export function TeamGrid() {
  return (
    <>
      <Section theme="white" space="default">
        <header className="mx-auto max-w-3xl text-center">
          <Heading as="h1" size="hero" accent="& Staff" tone="terracotta" inline>
            Dentists
          </Heading>
          <p className="mt-5 text-lead text-muted">
            We have a dedicated team consisting of highly skilled dentists and staff who works
            relentlessly to preserve your happy smile.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </header>

        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 md:mt-20 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-20">
          {TEAM_MEMBERS.map((member, index) => (
            <li key={member.slug}>
              <PersonCapsule
                as="h2"
                size="lg"
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
            </li>
          ))}
        </ul>

        <p className="mt-16 text-center text-small text-muted">
          <a
            href="https://olr.gdc-uk.org/SearchRegister"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fg underline underline-offset-4 t-colors hover:text-terracotta"
          >
            Verify on the GDC Register
          </a>
        </p>
      </Section>

      <CtaBand
        theme="navy"
        title="Ready to book"
        accent="with our team?"
        tone="butter"
        actions={
          <>
            <BookButton variant="butter">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Open 24 hours, 7 days a week.
      </CtaBand>
    </>
  );
}
