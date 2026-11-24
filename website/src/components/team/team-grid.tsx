import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, ShieldCheck, Wrench } from "lucide-react";
import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { CONTAINER, LEAD } from "@/components/pricing/tokens";
import { TEAM_MEMBERS } from "@/content/team-members";
import { restyledPhoto } from "@/content/team-restyled";

const GOVERNANCE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "GDC-Registered Clinicians",
    body: "Clinical dentistry led by Principal Dentist & Registered Manager Dr Hassan Bhojani (GDC: 262970) and Implant Dentist Dr Cosimo Meucci (GDC: 280128).",
  },
  {
    icon: Wrench,
    title: "Dedicated Compliance & Engineering",
    body: "Supported in-house by Compliance Manager Raheela Shafiq, Practice Manager Waleed Javed, and Director & Dental Engineer Aboo Bhojani.",
  },
  {
    icon: Clock,
    title: "24/7 Patient Support in Bradford",
    body: "Our nursing, clinical support, and patient care team operates from 786 Leeds Road, Bradford, BD3 9TY around the clock.",
  },
] as const;

/**
 * The team page, after Hims' "Meet our blog, Savoir Faire" provider cards (title and copy
 * side by side, a black pill, small grey cards with an avatar, credentials and an arrow), the
 * "by the numbers" card pair for the standards, and the centred "Through Hims…" statement.
 */
export function TeamGrid() {
  return (
    <>
      <section className="bg-white pt-12 pb-10 md:pt-20 md:pb-14">
        <div className={CONTAINER}>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <h1 className="text-[clamp(38px,4.4vw,64px)] leading-[1.03] font-normal tracking-[-0.025em] text-[#1b1b1b]">
                Dentists <span className="text-[#8b8d92]">&amp; Staff</span>
              </h1>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <BookButton>Book Now</BookButton>
                <CallButton variant="outline" />
              </div>
            </div>
            <p className={`${LEAD} lg:pt-3`}>
              We have a dedicated team consisting of highly skilled dentists and staff who works
              relentlessly to preserve your happy smile.
            </p>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {TEAM_MEMBERS.map((member, index) => (
              <li key={member.slug}>
                <Link
                  to="/team/$slug"
                  params={{ slug: member.slug }}
                  className="group flex h-full min-h-[270px] flex-col justify-between rounded-[20px] bg-[#f6f6f4] p-5 t-colors hover:bg-[#efefec]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="size-11 shrink-0 overflow-hidden rounded-full bg-[#e4e1da]">
                        <img
                          src={restyledPhoto(member.slug)}
                          alt={member.photo.alt}
                          width={88}
                          height={88}
                          loading={index < 4 ? "eager" : "lazy"}
                          className="size-full object-cover object-top"
                        />
                      </span>
                      <div className="min-w-0">
                        <h2 className="flex flex-wrap items-baseline gap-x-2 text-[17px] leading-tight text-[#1b1b1b]">
                          <span>{member.name}</span>
                          {member.gdc ? (
                            <span className="text-[12px] text-[#5b3fc4]">GDC: {member.gdc}</span>
                          ) : null}
                        </h2>
                        <p className="mt-0.5 text-[12px] leading-snug text-[#6d6e72]">{member.role}</p>
                      </div>
                    </div>
                    <p className="mt-5 line-clamp-4 text-[14px] leading-[1.5] text-[#55565a]">
                      {member.summary[0]}
                    </p>
                  </div>
                  <span className="mt-6 grid size-8 place-items-center rounded-full bg-white text-[#1b1b1b] t-colors group-hover:bg-black group-hover:text-white">
                    <ArrowRight aria-hidden className="size-4" />
                    <span className="sr-only">View full profile</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Standards: the "by the numbers" card pair */}
      <section aria-labelledby="governance-heading" className="bg-[#f7f5f2] py-14 md:py-24">
        <div className={CONTAINER}>
          <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr] lg:gap-4">
            <div className="flex flex-col justify-between gap-10 rounded-[22px] bg-white p-7 shadow-[0_10px_36px_rgba(20,20,40,0.07)] md:p-10">
              <div>
                <p className="text-small text-[#55565a]">Clinical Governance &amp; Standards</p>
                <h2
                  id="governance-heading"
                  className="mt-3 text-[clamp(28px,3vw,44px)] leading-[1.06] font-normal tracking-[-0.02em] text-[#1b1b1b]"
                >
                  Every appointment backed by{" "}
                  <span className="text-[#8a4242]">regulated clinical standards</span>
                </h2>
                <p className="mt-5 text-[17px] leading-[1.45] text-[#55565a]">
                  From routine check-ups and emergency pain relief to dental implants and practice
                  compliance, every member of our Bradford team works to strict UK regulatory
                  standards.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <ButtonLink to="/practice-policy" variant="outline">
                  View Practice Policies
                </ButtonLink>
                <a
                  href="https://olr.gdc-uk.org/SearchRegister"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-small text-[#1b1b1b] underline underline-offset-4"
                >
                  Verify on the GDC Register
                </a>
              </div>
            </div>

            <ul className="rounded-[22px] bg-white p-7 shadow-[0_10px_36px_rgba(20,20,40,0.07)] md:p-10">
              {GOVERNANCE_PILLARS.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex gap-5 border-b border-[#1b1b1b]/10 py-7 first:pt-0 last:border-0 last:pb-0"
                >
                  <Icon aria-hidden strokeWidth={1.3} className="mt-1 size-9 shrink-0 text-[#1b1b1b]" />
                  <div>
                    <h3 className="text-[clamp(20px,1.7vw,24px)] leading-[1.15] text-[#1b1b1b]">
                      {title.split(" ").slice(0, -1).join(" ")}{" "}
                      <span className="text-[#8b8d92]">{title.split(" ").slice(-1)}</span>
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.5] text-[#55565a]">{body}</p>
                  </div>
                </li>
              ))}
              <li className="flex items-center gap-3 pt-7 text-small text-[#55565a]">
                <Clock aria-hidden className="size-4 shrink-0" />
                786 Leeds Road, Bradford, BD3 9TY · Open 24 hours, 7 days a week
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Closing: the centred statement with a dotted line down to the action */}
      <section className="bg-white pt-16 pb-20 text-center md:pt-28 md:pb-28">
        <div className={CONTAINER}>
          <h2 className="mx-auto max-w-[16ch] text-[clamp(38px,5.4vw,80px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#1b1b1b]">
            Ready to book <span className="text-[#8a4242]">with our team?</span>
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
