import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ContentBlock } from "@/components/content/content-blocks";
import { BookButton, ButtonLink, CallButton, CtaBand, Heading, Section } from "@/components/hims";
import { CheckList } from "@/components/hims/check-list";
import { NumberedList } from "@/components/hims/numbered-list";
import { PersonCapsule } from "@/components/hims/person-capsule";
import { SectionHeader } from "@/components/hims/section-header";
import { StackedFlow } from "@/components/hims/stacked-flow";
import { TEAM_MEMBERS, type TeamMember } from "@/content/team-members";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { teamPersonJsonLd } from "@/lib/seo";
import { TeamPhoto } from "./team-photo";

const LINK_CLASS =
  "font-medium text-terracotta underline underline-offset-4 t-colors hover:text-rust";

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

/** One profile section: its H2 and the blocks under it, up to the next H2. The quote is shown on its own band. */
type Group = { title?: string; blocks: ContentBlock[] };

function splitProfile(blocks: ContentBlock[]): { groups: Group[]; quotes: string[] } {
  const groups: Group[] = [];
  const quotes: string[] = [];
  for (const block of blocks) {
    if (block.kind === "quote") {
      quotes.push(block.text);
    } else if (block.kind === "heading" && block.level !== 3) {
      groups.push({ title: block.text, blocks: [] });
    } else {
      if (groups.length === 0) groups.push({ blocks: [] });
      groups[groups.length - 1].blocks.push(block);
    }
  }
  return { groups, quotes };
}

/** Lists of qualifications are numbered, as on the live profiles. */
const NUMBERED_TITLE = /qualification|education/i;

function listItemText(item: string | { text: string }): string {
  return typeof item === "string" ? item : item.text;
}

function ProfileBlock({ block, numbered }: { block: ContentBlock; numbered: boolean }): ReactNode {
  switch (block.kind) {
    case "heading":
      return <h3 className="mt-10 text-h4 text-fg first:mt-0">{block.text}</h3>;
    case "paragraph":
      return <p className="mt-3 text-body text-muted first:mt-0">{block.text}</p>;
    case "list": {
      const items = block.items.map(listItemText);
      return numbered ? (
        <NumberedList
          size="text"
          className="mt-5 first:mt-0"
          items={items.map((text) => ({ title: text }))}
        />
      ) : (
        <CheckList
          className={
            items.length > 8 ? "mt-5 first:mt-0 md:grid-cols-2 md:gap-x-8" : "mt-5 first:mt-0"
          }
          items={items}
        />
      );
    }
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
  const peerMembers = TEAM_MEMBERS.filter((m) => m.slug !== member.slug).slice(0, 4);
  const { groups, quotes } = splitProfile(member.blocks);

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
          className="inline-flex items-center gap-2 rounded-pill border border-border bg-white px-4 py-1.5 text-small font-medium text-fg t-colors hover:border-black hover:text-terracotta"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Team
        </Link>

        <div className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-14 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-24">
          <div className="mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-[120px] bg-sand shadow-[0_30px_30px_rgb(0_0_0/0.16)] md:max-w-none">
            <TeamPhoto
              member={member}
              priority
              className="size-full object-cover object-[50%_25%]"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-small font-medium text-fg">
                {member.role}
              </span>
              {member.gdc ? (
                <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-small font-medium text-terracotta">
                  GDC: {member.gdc}
                </span>
              ) : null}
            </div>

            <Heading as="h1" size="hero" className="mt-5">
              {member.name}
            </Heading>

            {member.summary.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-lead text-muted">
                {paragraph}
              </p>
            ))}

            {hasFacts ? (
              <dl className="mt-8 divide-y divide-border border-y border-border">
                {member.languages ? (
                  <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="text-small text-subtle">Languages</dt>
                    <dd className="text-body text-fg">{member.languages}</dd>
                  </div>
                ) : null}
                {member.availability ? (
                  <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="text-small text-subtle">Availability</dt>
                    <dd className="text-body text-fg">{member.availability}</dd>
                  </div>
                ) : null}
                {member.contact ? (
                  <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="text-small text-subtle">Contact</dt>
                    <dd className="text-body text-fg">{withContactLinks(member.contact)}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton>Book Now</BookButton>
              <CallButton variant="outline" />
            </div>
          </div>
        </div>
      </Section>

      <Section theme="white" space="default">
        <div className="divide-y divide-border">
          {groups.map((group, index) => {
            const numbered = group.title ? NUMBERED_TITLE.test(group.title) : false;
            return (
              <div
                key={`${group.title ?? "intro"}-${index}`}
                className="py-10 first:pt-0 last:pb-0 md:py-14"
              >
                <StackedFlow
                  lead={group.title ? <h2 className="text-h3-md text-fg">{group.title}</h2> : null}
                >
                  <div>
                    {group.blocks.map((block, blockIndex) => (
                      <ProfileBlock key={blockIndex} block={block} numbered={numbered} />
                    ))}
                  </div>
                </StackedFlow>
              </div>
            );
          })}
        </div>
      </Section>

      {quotes.map((quote) => (
        <Section key={quote} theme="navy" space="lg">
          <figure className="mx-auto max-w-4xl text-center">
            <blockquote className="text-h3-md text-balance text-white">{quote}</blockquote>
          </figure>
        </Section>
      ))}

      <Section theme="sand" space="default">
        <SectionHeader
          title="More of our"
          accent="Bradford colleagues"
          tone="terracotta"
          action={
            <ButtonLink to="/team" variant="outline">
              All Dentists &amp; Staff
            </ButtonLink>
          }
        />
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
          {peerMembers.map((peer) => (
            <li key={peer.slug}>
              <PersonCapsule
                slug={peer.slug}
                name={peer.name}
                role={peer.role}
                gdc={peer.gdc}
                photo={
                  <TeamPhoto member={peer} className="size-full object-cover object-[50%_25%]" />
                }
              />
            </li>
          ))}
        </ul>
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
