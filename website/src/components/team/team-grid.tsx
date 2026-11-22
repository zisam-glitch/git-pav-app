import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  Heading,
  Section,
  Tile,
} from "@/components/hims";
import { TEAM_MEMBERS } from "@/content/team-members";
import { cn } from "@/lib/utils";
import { TeamPhoto } from "./team-photo";

const GOVERNANCE_PILLARS = [
  {
    step: "01",
    title: "GDC-Registered Clinicians",
    body: "Clinical dentistry led by Principal Dentist & Registered Manager Dr Hassan Bhojani (GDC: 262970) and Implant Dentist Dr Cosimo Meucci (GDC: 280128).",
  },
  {
    step: "02",
    title: "Dedicated Compliance & Engineering",
    body: "Supported in-house by Compliance Manager Raheela Shafiq, Practice Manager Waleed Javed, and Director & Dental Engineer Aboo Bhojani.",
  },
  {
    step: "03",
    title: "24/7 Patient Support in Bradford",
    body: "Our nursing, clinical support, and patient care team operates from 786 Leeds Road, Bradford, BD3 9TY around the clock.",
  },
] as const;

/** The team page: one card per person, each linking to their own profile page. */
export function TeamGrid() {
  return (
    <>
      <Section theme="white" space="default">
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
              Bradford · Clinical &amp; Care Team
            </span>
            <Heading as="h1" size="hero" accent="& Staff" tone="terracotta" inline className="mt-4">
              Dentists
            </Heading>
            <p className="mt-4 text-lead text-muted">
              We have a dedicated team consisting of highly skilled dentists and staff who works
              relentlessly to preserve your happy smile.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM_MEMBERS.map((member, index) => {
            const isSage = Boolean(member.gdc) || index % 3 === 1;
            return (
              <li key={member.slug}>
                <Link
                  to="/team/$slug"
                  params={{ slug: member.slug }}
                  className={cn(
                    "group flex h-full flex-col justify-between rounded-xl border border-border/60 p-4 t-lift md:p-5",
                    isSage ? "bg-tile-sage" : "bg-tile-cream",
                  )}
                >
                  <div>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                      <TeamPhoto
                        member={member}
                        priority={index < 4}
                        className="size-full object-cover object-top t-zoom"
                      />
                      {member.gdc ? (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-terracotta shadow-soft">
                          <ShieldCheck aria-hidden="true" className="size-3.5" />
                          <span>GDC: {member.gdc}</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <span className="inline-block rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-muted">
                        {member.role}
                      </span>
                      <h2 className="mt-2.5 text-h4 text-fg group-hover:text-terracotta t-colors">
                        {member.name}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5 text-small font-medium text-fg">
                    <span>View full profile</span>
                    <span className="grid size-7 place-items-center rounded-pill bg-white text-fg t-colors group-hover:bg-black group-hover:text-white">
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Hims dark brown + gold clinical governance spotlight band (Mobbin e4eccce0) */}
      <Section theme="brown" space="lg" aria-labelledby="governance-heading">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-block rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-caption font-medium text-gold">
              Clinical Governance &amp; Standards
            </span>
            <Heading
              as="h2"
              size="h2-md"
              accent="regulated clinical standards"
              tone="gold"
              className="mt-4"
            >
              <span id="governance-heading">Every appointment backed by</span>
            </Heading>
            <p className="mt-4 text-lead text-white/80">
              From routine check-ups and emergency pain relief to dental implants and practice
              compliance, every member of our Bradford team works to strict UK regulatory standards.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink to="/practice-policy" variant="glass">
              View Practice Policies
            </ButtonLink>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {GOVERNANCE_PILLARS.map((item) => (
            <Tile key={item.step} tone="glass" className="border border-white/15 p-6 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-pill bg-gold/15 text-caption font-medium text-gold">
                  {item.step}
                </span>
                <CheckCircle2 aria-hidden="true" className="size-4 text-gold" />
              </div>
              <h3 className="mt-5 text-h4 text-gold">{item.title}</h3>
              <p className="mt-3 text-body text-white/80">{item.body}</p>
            </Tile>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/7 px-6 py-4 text-small text-white/85">
          <div className="flex items-center gap-2.5">
            <Clock aria-hidden="true" className="size-4 shrink-0 text-gold" />
            <span>786 Leeds Road, Bradford, BD3 9TY · Open 24 hours, 7 days a week</span>
          </div>
          <a
            href="https://olr.gdc-uk.org/SearchRegister"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold underline underline-offset-4 hover:text-white"
          >
            Verify on the GDC Register
          </a>
        </div>
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

