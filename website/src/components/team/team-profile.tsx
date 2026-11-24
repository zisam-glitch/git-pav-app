import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import type { ContentBlock } from "@/components/content/content-blocks";
import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { CONTAINER, LEAD } from "@/components/pricing/tokens";
import { TEAM_MEMBERS, type TeamMember } from "@/content/team-members";
import { restyledPhoto } from "@/content/team-restyled";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { teamPersonJsonLd } from "@/lib/seo";

const LINK_CLASS = "text-[#1b1b1b] underline underline-offset-4";
const SOFT = "rounded-[22px] bg-white shadow-[0_10px_36px_rgba(20,20,40,0.07)]";

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

/** A tick in the amber circle Hims uses for its provider bullets. */
function Tick() {
  return (
    <span
      aria-hidden
      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#f3b968] text-[#1b1b1b]"
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}

function ProfileBlock({ block }: { block: ContentBlock }): ReactNode {
  switch (block.kind) {
    case "heading":
      return block.level === 3 ? (
        <h3 className="mt-8 text-[clamp(20px,1.8vw,24px)] leading-[1.2] font-normal text-[#1b1b1b]">
          {block.text}
        </h3>
      ) : (
        <h2 className="mt-12 border-t border-[#1b1b1b]/10 pt-10 text-[clamp(26px,2.6vw,36px)] leading-[1.1] font-normal tracking-[-0.02em] text-[#1b1b1b] first:mt-0 first:border-t-0 first:pt-0">
          {block.text}
        </h2>
      );
    case "paragraph":
      return <p className="mt-4 text-[17px] leading-[1.55] text-[#55565a]">{block.text}</p>;
    case "list":
      return (
        <ul className="mt-5 space-y-3">
          {block.items.map((item) => {
            const text = typeof item === "string" ? item : item.text;
            return (
              <li key={text} className="flex items-start gap-3 text-[17px] leading-[1.45] text-[#1b1b1b]">
                <Tick />
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      );
    case "quote":
      return (
        <aside className="mt-12 rounded-[24px] bg-[#1b1b1b] p-8 md:p-10">
          <blockquote className="text-[clamp(22px,2.4vw,32px)] leading-[1.25] tracking-[-0.01em] text-white">
            {block.text}
          </blockquote>
        </aside>
      );
    default:
      return null;
  }
}

/**
 * One person's page, after the Hims provider block "Adjust medication anytime with a provider":
 * name, summary and tick bullets with a black pill on the left; a large rounded portrait with a
 * floating name tag on the right. Below it, the profile text in one quiet column.
 */
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

      <section className="bg-white pt-8 pb-14 md:pt-12 md:pb-24">
        <div className={CONTAINER}>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-small text-[#55565a] t-colors hover:text-[#1b1b1b]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Team
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <p className="flex flex-wrap items-center gap-2.5 text-[15px] text-[#55565a]">
                <span>{member.role}</span>
                {member.gdc ? (
                  <span className="rounded-md bg-[#f3f0a8] px-2 py-0.5 text-[12px] leading-none text-[#5c5a10]">
                    GDC: {member.gdc}
                  </span>
                ) : null}
              </p>
              <h1 className="mt-3 text-[clamp(38px,4.4vw,64px)] leading-[1.03] font-normal tracking-[-0.025em] text-[#1b1b1b]">
                {member.name}
              </h1>

              {member.summary.map((paragraph) => (
                <p key={paragraph} className={`mt-5 ${LEAD}`}>
                  {paragraph}
                </p>
              ))}

              {hasFacts ? (
                <ul className="mt-6 space-y-3 text-[16px] leading-[1.45] text-[#1b1b1b]">
                  {member.languages ? (
                    <li className="flex items-start gap-3">
                      <Tick />
                      <span>
                        <span className="text-[#8b8d92]">Languages: </span>
                        {member.languages}
                      </span>
                    </li>
                  ) : null}
                  {member.availability ? (
                    <li className="flex items-start gap-3">
                      <Tick />
                      <span>
                        <span className="text-[#8b8d92]">Availability: </span>
                        {member.availability}
                      </span>
                    </li>
                  ) : null}
                  {member.contact ? (
                    <li className="flex items-start gap-3">
                      <Tick />
                      <span>
                        <span className="text-[#8b8d92]">Contact: </span>
                        {withContactLinks(member.contact)}
                      </span>
                    </li>
                  ) : null}
                </ul>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <BookButton>Book Now</BookButton>
                <CallButton variant="outline" />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] bg-[#efe6d6]">
              <img
                src={restyledPhoto(member.slug)}
                alt={member.photo.alt}
                width={900}
                height={900}
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover object-top"
              />
              <div className="absolute bottom-4 left-4 rounded-xl bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(20,20,40,0.12)]">
                <p className="text-[14px] leading-tight text-[#1b1b1b]">{member.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-[#6d6e72]">{member.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f5f2] py-14 md:py-24">
        <div className="mx-auto w-full max-w-[768px] px-4">
          {member.blocks.map((block, index) => (
            <ProfileBlock key={index} block={block} />
          ))}
        </div>
      </section>

      {/* Standards: two soft cards */}
      <section className="bg-white py-14 md:py-24">
        <div className={CONTAINER}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="text-small text-[#55565a]">Pav Dental Clinical Governance</p>
              <h2 className="mt-3 text-[clamp(28px,3.2vw,48px)] leading-[1.05] font-normal tracking-[-0.02em] text-[#1b1b1b]">
                Regulated Bradford care{" "}
                <span className="text-[#8b8d92]">across every appointment</span>
              </h2>
              <p className="mt-5 text-[17px] leading-[1.45] text-[#55565a]">
                Our clinicians and practice support staff operate from 786 Leeds Road, Bradford, BD3
                9TY under CQC-aligned governance, cross-infection protocols, and transparent written
                treatment planning.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className={`${SOFT} p-6`}>
                <Clock aria-hidden strokeWidth={1.3} className="size-8" />
                <p className="mt-5 text-[19px] text-[#1b1b1b]">24/7 Practice Access</p>
                <p className="mt-2 text-[14px] leading-[1.5] text-[#55565a]">
                  Emergency and routine care available 00:00 – 24:00, seven days a week.
                </p>
              </div>
              <div className={`${SOFT} p-6`}>
                <Check aria-hidden strokeWidth={1.3} className="size-8" />
                <p className="mt-5 text-[19px] text-[#1b1b1b]">Written Treatment Plans</p>
                <p className="mt-2 text-[14px] leading-[1.5] text-[#55565a]">
                  Every patient receives clear clinical options and itemised fees before treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colleagues, as the grey provider cards */}
      <section className="bg-[#f7f5f2] py-14 md:py-24">
        <div className={CONTAINER}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-[clamp(28px,3.2vw,44px)] leading-[1.05] font-normal tracking-[-0.02em] text-[#1b1b1b]">
              More of our <span className="text-[#8b8d92]">Bradford colleagues</span>
            </h2>
            <ButtonLink to="/team" variant="outline" size="sm">
              All Dentists &amp; Staff
            </ButtonLink>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {peerMembers.map((peer) => (
              <li key={peer.slug}>
                <Link
                  to="/team/$slug"
                  params={{ slug: peer.slug }}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[20px] bg-white p-5 shadow-[0_10px_36px_rgba(20,20,40,0.06)] t-colors hover:bg-[#faf9f6]"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-11 shrink-0 overflow-hidden rounded-full bg-[#e4e1da]">
                      <img
                        src={restyledPhoto(peer.slug)}
                        alt={peer.photo.alt}
                        width={88}
                        height={88}
                        loading="lazy"
                        className="size-full object-cover object-top"
                      />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[17px] leading-tight text-[#1b1b1b]">{peer.name}</h3>
                      <p className="mt-0.5 text-[12px] leading-snug text-[#6d6e72]">{peer.role}</p>
                    </div>
                  </div>
                  <span className="grid size-8 place-items-center rounded-full bg-[#f4f1ea] text-[#1b1b1b] t-colors group-hover:bg-black group-hover:text-white">
                    <ArrowRight aria-hidden className="size-4" />
                    <span className="sr-only">View profile</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing statement */}
      <section className="bg-white pt-16 pb-20 text-center md:pt-28 md:pb-28">
        <div className={CONTAINER}>
          <h2 className="mx-auto max-w-[16ch] text-[clamp(38px,5.4vw,80px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#1b1b1b]">
            Care led by <span className="text-[#8a4242]">our Bradford team</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[34rem] text-[17px] leading-[1.45] text-[#55565a]">
            786 Leeds Road, Bradford, BD3 9TY · Open 24 hours, 7 days a week.
          </p>
          <div aria-hidden className="mx-auto mt-10 h-24 w-px border-l border-dotted border-[#8a4242]/60" />
          <div className="-mt-1 flex flex-wrap items-center justify-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </section>
    </>
  );
}
