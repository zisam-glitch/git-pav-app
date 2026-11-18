import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock, Languages, Phone } from "lucide-react";
import { ContentBlocks } from "@/components/content/content-blocks";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { teamPersonJsonLd } from "@/lib/seo";
import type { TeamMember } from "@/content/team-members";
import { TeamPhoto } from "./team-photo";

const LINK_CLASS =
  "font-medium text-[#754B3D] underline decoration-black/25 underline-offset-4 hover:text-[#1B3745]";

/** Turns the practice's phone number and email inside a line of text into links, and leaves the rest as written. */
function withContactLinks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = text;
  while (rest) {
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
    <li className="flex items-start gap-3 text-sm text-black/75 sm:text-base">
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F2EDE5] text-[#1B3745]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="pt-1">
        <span className="sr-only">{label}: </span>
        {children}
      </span>
    </li>
  );
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
    <div className="bg-[#FBF8F5] pt-24 pb-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personData).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <Link
          to="/team"
          className="inline-flex items-center gap-2 text-sm font-medium text-black/65 transition-colors hover:text-[#1B3745]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Team
        </Link>

        <div className="mt-8 grid items-start gap-10 md:grid-cols-[320px_1fr] lg:gap-14">
          <div className="overflow-hidden rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] shadow-[0_8px_28px_rgba(0,0,0,0.04)]">
            <TeamPhoto
              member={member}
              priority
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </div>

          <div>
            <span className="inline-block rounded-full bg-[#F2EDE5] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#1B3745]">
              {member.role}
            </span>
            <h1 className="mt-4 font-display text-4xl font-normal tracking-[-0.04em] leading-[1.06] text-black sm:text-5xl">
              {member.name}
            </h1>
            {member.gdc && (
              <p className="mt-3 text-sm font-medium text-[#754B3D]">GDC: {member.gdc}</p>
            )}
            <div className="mt-5 max-w-2xl space-y-4">
              {member.summary.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-black/70 sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            {hasFacts && (
              <ul className="mt-7 space-y-3 border-t border-black/10 pt-6">
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

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href={BOOKING_URL}>
                  Book Appointment
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={PRACTICE_PHONE_HREF}>{PRACTICE_PHONE}</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-3xl border-t border-black/10 pt-8">
          <ContentBlocks blocks={member.blocks} />
        </div>
      </div>
    </div>
  );
}
