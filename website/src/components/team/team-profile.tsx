import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Languages, Phone } from "lucide-react";
import type { ContentBlock } from "@/components/content/content-blocks";
import { BookButton, CallButton, CtaBand, Heading, Section, Tile } from "@/components/hims";
import type { TeamMember } from "@/content/team-members";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { teamPersonJsonLd } from "@/lib/seo";
import { TeamPhoto } from "./team-photo";

const LINK_CLASS = "font-medium text-terracotta underline underline-offset-4 hover:text-copper";

/** Turns the practice's phone number and email inside a line of text into links, and leaves the rest as written. */
function withContactLinks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = text;
  while (rest) {
    // The nearest of the two, found by plain text search (no pattern is built from them).
    const hits = [PRACTICE_PHONE, PRACTICE_EMAIL]
      .map((token) => ({ token, at: rest.indexOf(token) }))
      .filter((hit) => hit.at !== -1);
    if (hits.length === 0) {
      parts.push(rest);
      break;
    }
    const first = hits.reduce((nearest, hit) => (hit.at < nearest.at ? hit : nearest));
    if (first.at > 0) parts.push(rest.slice(0, first.at));
    const href = first.token === PRACTICE_PHONE ? PRACTICE_PHONE_HREF : `mailto:${PRACTICE_EMAIL}`;
    parts.push(
      <a key={parts.length} href={href} className={LINK_CLASS}>
        {first.token}
      </a>,
    );
    rest = rest.slice(first.at + first.token.length);
  }
  return parts;
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-body text-fg">
      <Icon className="mt-0.5 size-5 shrink-0 text-terracotta" aria-hidden="true" />
      <span>
        <span className="sr-only">{label}: </span>
        {children}
      </span>
    </li>
  );
}

function ProfileBlock({ block }: { block: ContentBlock }): ReactNode {
  switch (block.kind) {
    case "heading":
      return block.level === 3 ? (
        <h3 className="mt-8 text-h4 text-fg">{block.text}</h3>
      ) : (
        <h2 className="mt-10 text-h3-md text-fg">{block.text}</h2>
      );
    case "paragraph":
      return <p className="mt-4 text-body text-muted">{block.text}</p>;
    case "list":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-muted">
          {block.items.map((item) => {
            const text = typeof item === "string" ? item : item.text;
            return <li key={text}>{text}</li>;
          })}
        </ul>
      );
    case "quote":
      return (
        <Tile tone="cream" as="aside" className="mt-10 p-6 md:p-8">
          <blockquote className="text-h4 text-fg">{block.text}</blockquote>
        </Tile>
      );
    default:
      return null;
  }
}

/** One person's page: photo, role, name, introduction and the sections of their profile. */
export function TeamProfile({ member }: { member: TeamMember }) {
  const hasFacts = Boolean(member.languages || member.availability || member.contact);
  const personData = teamPersonJsonLd(member.slug, {
    name: member.name,
    role: member.role,
    photo: member.photo.src,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so no text in the data can end the script early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personData).replace(/</g, "\\u003c") }}
      />

      <Section theme="cream" space="default">
        <Link
          to="/team"
          className="inline-flex items-center gap-2 text-label text-fg t-colors hover:text-terracotta"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Team
        </Link>

        <div className="mt-8 grid items-start gap-8 md:grid-cols-[300px_1fr] md:gap-12">
          <div className="overflow-hidden rounded-xl bg-sand">
            <TeamPhoto
              member={member}
              priority
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </div>

          <div>
            <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-small font-medium text-fg">
              {member.role}
            </span>
            <Heading as="h1" size="hero" className="mt-4">
              {member.name}
            </Heading>
            {member.gdc ? (
              <p className="mt-3 text-label text-terracotta">GDC: {member.gdc}</p>
            ) : null}

            {member.summary.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-lead text-muted">
                {paragraph}
              </p>
            ))}

            {hasFacts ? (
              <ul className="mt-6 space-y-3 rounded-xl border border-border bg-white p-5">
                {member.languages ? (
                  <Fact icon={Languages} label="Languages">
                    {member.languages}
                  </Fact>
                ) : null}
                {member.availability ? (
                  <Fact icon={Clock} label="Availability">
                    {member.availability}
                  </Fact>
                ) : null}
                {member.contact ? (
                  <Fact icon={Phone} label="Contact">
                    {withContactLinks(member.contact)}
                  </Fact>
                ) : null}
              </ul>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton>Book Now</BookButton>
              <CallButton variant="outline" />
            </div>
          </div>
        </div>
      </Section>

      <Section theme="white" width="prose" space="default">
        <div className="-mt-6">
          {member.blocks.map((block, index) => (
            <ProfileBlock key={index} block={block} />
          ))}
        </div>
      </Section>

      <CtaBand
        theme="brown"
        title="Care led by"
        accent="our Bradford team"
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
