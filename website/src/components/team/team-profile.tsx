import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Languages, Phone } from "lucide-react";
import { ContentBlocks } from "@/components/content/content-blocks";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { teamPersonJsonLd } from "@/lib/seo";
import type { TeamMember } from "@/content/team-members";
import { TeamPhoto } from "./team-photo";

const LINK_CLASS = "font-semibold text-[#925a27] underline underline-offset-2 hover:text-[#6f421b]";

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

function Fact({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm sm:text-base text-[#4a3b2f]">
      <Icon className="mt-0.5 size-5 shrink-0 text-[#925a27]" aria-hidden="true" />
      <span>
        <span className="sr-only">{label}: </span>
        {children}
      </span>
    </li>
  );
}

/** One person's page: photo, role, name, introduction and the sections of their profile. */
export function TeamProfile({ member }: { member: TeamMember }) {
  const hasFacts = Boolean(member.languages || member.availability || member.contact);
  const personData = teamPersonJsonLd(member.slug, { name: member.name, role: member.role, photo: member.photo.src });
  return (
    <div className="bg-[#fffdf9] pt-24 pb-20">
      <script
        type="application/ld+json"
        // "<" is escaped so no text in the data can end the script early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personData).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link to="/team" className="inline-flex items-center gap-2 text-sm font-semibold text-[#925a27] hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Team
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-[280px_1fr]">
          <TeamPhoto
            member={member}
            priority
            className="aspect-[4/5] w-full rounded-xl border border-[#e2d4c0] bg-[#faf6f0] object-cover object-top"
          />
          <div>
            <span className="inline-block rounded-full border border-[#e2d4c0] bg-white px-4 py-1.5 text-xs font-bold uppercase text-[#925a27]">
              {member.role}
            </span>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">{member.name}</h1>
            {member.gdc && <p className="mt-3 text-sm font-semibold text-[#6b5848]">GDC: {member.gdc}</p>}
            {member.summary.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-sm sm:text-base leading-relaxed text-[#4a3b2f]">
                {paragraph}
              </p>
            ))}
            {hasFacts && (
              <ul className="mt-6 space-y-3">
                {member.languages && (
                  <Fact icon={Languages} label="Languages">
                    {member.languages}
                  </Fact>
                )}
                {member.availability && (
                  <Fact icon={Clock} label="Availability">
                    {member.availability}
                  </Fact>
                )}
                {member.contact && (
                  <Fact icon={Phone} label="Contact">
                    {withContactLinks(member.contact)}
                  </Fact>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-[#e2d4c0] pt-2">
          <ContentBlocks blocks={member.blocks} />
        </div>
      </div>
    </div>
  );
}
