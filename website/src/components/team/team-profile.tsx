import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock, Languages, Phone, ShieldCheck } from "lucide-react";
import type { ContentBlock } from "@/components/content/content-blocks";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  Heading,
  Section,
  Tile,
} from "@/components/hims";
import { TEAM_MEMBERS, type TeamMember } from "@/content/team-members";
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
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-pill bg-cream text-terracotta">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <span className="block text-caption font-medium text-subtle">{label}</span>
        <span className="text-body text-fg">{children}</span>
      </div>
    </li>
  );
}

function ProfileBlock({ block }: { block: ContentBlock }): ReactNode {
  switch (block.kind) {
    case "heading":
      return block.level === 3 ? (
        <h3 className="mt-8 text-h4 text-fg">{block.text}</h3>
      ) : (
        <h2 className="mt-10 border-t border-border pt-8 text-h3-md text-fg first:mt-0 first:border-t-0 first:pt-0">
          {block.text}
        </h2>
      );
    case "paragraph":
      return <p className="mt-4 text-body leading-relaxed text-muted">{block.text}</p>;
    case "list":
      return (
        <ul className="mt-4 space-y-2.5 text-body text-muted">
          {block.items.map((item) => {
            const text = typeof item === "string" ? item : item.text;
            return (
              <li
                key={text}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-tile-cream px-4 py-3 text-fg"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-terracotta"
                />
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      );
    case "quote":
      return (
        <Tile tone="sage" as="aside" className="mt-10 border border-border/70 p-6 md:p-8">
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
  const peerMembers = TEAM_MEMBERS.filter((m) => m.slug !== member.slug).slice(0, 4);

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

        <div className="mt-8 grid items-start gap-8 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr] lg:gap-14">
          <div className="rounded-xl border border-border/70 bg-tile-sage p-3">
            <div className="overflow-hidden rounded-lg bg-sand">
              <TeamPhoto
                member={member}
                priority
                className="aspect-[4/5] w-full object-cover object-top"
              />
            </div>
            {member.gdc ? (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3.5 py-2.5 text-caption font-medium text-fg">
                <span className="inline-flex items-center gap-1.5 text-terracotta">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  <span>GDC: {member.gdc}</span>
                </span>
                <span className="text-subtle">UK Registered</span>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-small font-medium text-fg">
                {member.role}
              </span>
              {member.gdc ? (
                <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-white px-4 py-1.5 text-small font-medium text-terracotta">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  <span>GDC: {member.gdc}</span>
                </span>
              ) : null}
            </div>

            <Heading as="h1" size="hero" className="mt-4">
              {member.name}
            </Heading>

            {member.summary.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-lead text-muted">
                {paragraph}
              </p>
            ))}

            {hasFacts ? (
              <ul className="mt-6 grid gap-4 rounded-xl border border-border bg-white p-5 sm:grid-cols-2">
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
        <div>
          {member.blocks.map((block, index) => (
            <ProfileBlock key={index} block={block} />
          ))}
        </div>
      </Section>

      {/* Dark brown + gold clinical governance band */}
      <Section theme="brown" space="default">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-block rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-caption font-medium text-gold">
              Pav Dental Clinical Governance
            </span>
            <Heading
              as="h2"
              size="h2-md"
              accent="across every appointment"
              tone="gold"
              className="mt-4"
            >
              Regulated Bradford care
            </Heading>
            <p className="mt-4 text-body text-white/80">
              Our clinicians and practice support staff operate from 786 Leeds Road, Bradford, BD3
              9TY under CQC-aligned governance, cross-infection protocols, and transparent written
              treatment planning.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Tile tone="glass" className="border border-white/15 p-5">
              <p className="text-caption font-medium text-gold">24/7 Practice Access</p>
              <p className="mt-2 text-small text-white/85">
                Emergency and routine care available 00:00 – 24:00, seven days a week.
              </p>
            </Tile>
            <Tile tone="glass" className="border border-white/15 p-5">
              <p className="text-caption font-medium text-gold">Written Treatment Plans</p>
              <p className="mt-2 text-small text-white/85">
                Every patient receives clear clinical options and itemised fees before treatment.
              </p>
            </Tile>
          </div>
        </div>
      </Section>

      {/* Peer team members */}
      <Section theme="sand" space="default">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
              Meet the Team
            </span>
            <Heading as="h2" size="h3" accent="Bradford colleagues" tone="terracotta" inline className="mt-3">
              More of our
            </Heading>
          </div>
          <ButtonLink to="/team" variant="outline" size="sm">
            All Dentists &amp; Staff
          </ButtonLink>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {peerMembers.map((peer) => (
            <li key={peer.slug}>
              <Link
                to="/team/$slug"
                params={{ slug: peer.slug }}
                className="group flex h-full flex-col justify-between rounded-xl border border-border/60 bg-white p-4 t-lift"
              >
                <div>
                  <div className="aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                    <TeamPhoto
                      member={peer}
                      className="size-full object-cover object-top t-zoom"
                    />
                  </div>
                  <p className="mt-3 text-caption font-medium text-terracotta">{peer.role}</p>
                  <h3 className="mt-1 text-h4 text-fg">{peer.name}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-small font-medium text-fg">
                  <span>View profile</span>
                  <ArrowUpRight aria-hidden="true" className="size-4 text-subtle group-hover:text-fg" />
                </div>
              </Link>
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

