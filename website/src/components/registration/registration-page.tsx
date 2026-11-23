import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Lock,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  FaqList,
  Heading,
  Media,
  Section,
  SplitFeature,
  Tile,
} from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";
import { RegistrationFlow } from "./registration-flow";
import {
  CONTACT_TIME_OPTIONS,
  REGISTRATION_BENEFITS,
  REGISTRATION_FAQS,
  REGISTRATION_STEPS,
} from "./registration-data";

const STEP_ICONS = [CalendarCheck, ShieldCheck, ClipboardList] as const;

export function RegistrationPage() {
  const [flowOpen, setFlowOpen] = useState(false);
  const start = () => setFlowOpen(true);

  return (
    <>
      <RegistrationHero onStart={start} />
      <RegistrationSteps />
      <RegistrationStartSection onStart={start} />
      <RegistrationEnquirySection />
      <RegistrationBenefitsStrip />
      <RegistrationFaqSection />
      <CtaBand
        theme="navy"
        title="Ready to become a"
        accent="Pav Dental patient?"
        tone="butter"
        actions={
          <>
            <BookButton variant="butter">Book Your First Visit</BookButton>
            <CallButton variant="glass">Call {PRACTICE_PHONE}</CallButton>
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · {PRACTICE_HOURS}.
      </CtaBand>

      <RegistrationFlow open={flowOpen} onClose={() => setFlowOpen(false)} />
    </>
  );
}

/** Hims onboarding hero (Mobbin 24789ec8): calm cream surface, clear value prop and direct actions. */
function RegistrationHero({ onStart }: { onStart: () => void }) {
  return (
    <Section id="top" theme="cream" aria-label="New patient registration at Pav Dental">
      <SplitFeature
        reverse
        media={
          <Media
            src="/images/generated/about-hero.jpg"
            alt="Warm sunlit Pav Dental treatment room welcoming new patients in Bradford"
            ratio="4 / 3"
            tone="sand"
            priority
          />
        }
      >
        <div>
          <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
            New Patients Welcome · Bradford BD3
          </span>

          <Heading as="h1" size="hero" accent="Pav Dental" tone="terracotta" className="mt-4">
            Register with
          </Heading>

          <p className="mt-5 max-w-xl text-lead text-muted">
            Becoming a Pav Dental patient takes minutes. Register online in about 8 minutes, book
            24/7 with no waiting lists, and receive clear written treatment plans from your very
            first visit.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={onStart}>
              Register online
            </Button>
            <BookButton variant="outline">Book Your First Visit</BookButton>
            <CallButton variant="outline">Call {PRACTICE_PHONE}</CallButton>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-small text-muted">
            <li className="flex items-center gap-2">
              <Clock aria-hidden="true" className="size-4 text-terracotta" />
              <span>24/7 online availability</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 aria-hidden="true" className="size-4 text-terracotta" />
              <span>No waiting lists</span>
            </li>
            <li className="flex items-center gap-2">
              <Lock aria-hidden="true" className="size-4 text-terracotta" />
              <span>Secure online registration</span>
            </li>
          </ul>
        </div>
      </SplitFeature>
    </Section>
  );
}

/** Hims 3-step guided journey cards (Mobbin 00dd70e5): clean numbered pills 01, 02, 03. */
function RegistrationSteps() {
  return (
    <Section id="how-it-works" theme="white" aria-labelledby="registration-steps-heading">
      <div className="max-w-2xl">
        <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
          Simple Onboarding
        </span>
        <Heading
          as="h2"
          size="h2-md"
          accent="your first visit"
          tone="terracotta"
          className="mt-4"
        >
          <span id="registration-steps-heading">Three simple steps to</span>
        </Heading>
        <p className="mt-4 text-lead text-muted">
          No paper packets to fill in at the desk: register online in a few minutes, then book 24/7
          for calm, clinician-led dental care in Bradford.
        </p>
      </div>

      <ol className="mt-10 grid list-none gap-6 md:grid-cols-3">
        {REGISTRATION_STEPS.map((item, idx) => {
          const Icon = STEP_ICONS[idx] ?? CalendarCheck;
          return (
            <li key={item.step}>
              <Tile
                tone={idx === 1 ? "sage" : "cream"}
                lift
                className="flex h-full flex-col justify-between gap-6 p-6 md:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-pill bg-black text-small font-medium text-white">
                      {item.step}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-fg">
                      <Icon aria-hidden="true" className="size-3.5 text-terracotta" />
                      <span>{item.badge}</span>
                    </span>
                  </div>

                  <h3 className="mt-6 text-h4 text-fg">{item.title}</h3>
                  <p className="mt-3 text-body text-muted">{item.description}</p>
                </div>
              </Tile>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

const REGISTRATION_HAVE_TO_HAND = [
  "Your mobile number, email and an emergency contact",
  "Your NHS number and GP surgery, if you have them (both optional)",
  "A list of the medications you take",
  "About 8 minutes. Stop at any time: nothing is saved until you send it",
] as const;

/** The online registration: what to have ready, how the answers are looked after, and the start button. */
function RegistrationStartSection({ onStart }: { onStart: () => void }) {
  return (
    <Section id="register-online" theme="sand" aria-labelledby="register-online-heading">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
        <div className="max-w-xl">
          <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
            New patient registration
          </span>
          <Heading as="h2" size="h2-md" accent="in about 8 minutes" tone="terracotta" className="mt-4">
            <span id="register-online-heading">Register online</span>
          </Heading>
          <p className="mt-4 text-lead text-muted">
            One short question group at a time: about you, your health and your teeth. Your dentist
            reads it before you arrive, so your first visit starts with your care, not paperwork.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button" onClick={onStart}>
              Start registration
            </Button>
            <CallButton variant="outline">Call {PRACTICE_PHONE}</CallButton>
          </div>
        </div>

        <div className="grid gap-4">
          <Tile tone="white" className="p-6 md:p-8">
            <h3 className="text-h4 text-fg">Have these to hand</h3>
            <ul className="mt-4 grid gap-3 text-body text-muted">
              {REGISTRATION_HAVE_TO_HAND.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-terracotta" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Tile>
          <Tile tone="sage" className="p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-white text-fg">
                <Lock aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h3 className="text-label text-fg">How your answers are looked after</h3>
                <p className="mt-1.5 text-small text-muted">
                  Your registration goes to our secure dashboard for the Bradford team. Health
                  details are never sent by email. Read our{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </Section>
  );
}

/**
 * Registration callback request (Mobbin fceeec4f spec-card + clean intake layout).
 * Contact details only: health information goes through the online registration above.
 */
function RegistrationEnquirySection() {
  const { sending, sent, error, submit, reset } = useEnquiry("New Patient Registration");

  return (
    <Section id="register-enquiry" theme="sand" aria-labelledby="register-form-heading">
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="max-w-lg">
          <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
            General Registration Enquiry
          </span>
          <Heading
            as="h2"
            size="h2-md"
            accent="from our reception team"
            tone="copper"
            className="mt-4"
          >
            <span id="register-form-heading">Request a callback</span>
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Prefer to speak with reception before booking? Leave your contact details and preferred
            time below and our Bradford team will call you back to help get you set up.
          </p>

          <Tile tone="white" className="mt-8 p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-sage text-fg">
                <Lock aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h3 className="text-label text-fg">Keep health details for the registration</h3>
                <p className="mt-1.5 text-small text-muted">
                  Please do not enter your NHS number, medical history, or clinical details in this
                  callback form. The online registration above is built for them.
                </p>
              </div>
            </div>
          </Tile>

          <dl className="mt-8 space-y-4 border-t border-border pt-6 text-body">
            <div className="flex items-start gap-3">
              <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-copper" />
              <div>
                <dt className="text-small font-medium text-muted">Bradford Clinic</dt>
                <dd className="text-fg">786 Leeds Road, Bradford, BD3 9TY</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone aria-hidden="true" className="mt-1 size-4 shrink-0 text-copper" />
              <div>
                <dt className="text-small font-medium text-muted">Direct Line</dt>
                <dd>
                  <a
                    href={PRACTICE_PHONE_HREF}
                    className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  >
                    {PRACTICE_PHONE}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock aria-hidden="true" className="mt-1 size-4 shrink-0 text-copper" />
              <div>
                <dt className="text-small font-medium text-muted">Opening Hours</dt>
                <dd className="text-fg">{PRACTICE_HOURS}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 md:p-10">
          {sent ? (
            <div className="max-w-md" role="status">
              <div className="mb-4 flex size-12 items-center justify-center rounded-pill bg-sage text-fg">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <Heading as="h3" size="h3-md">
                Registration enquiry received
              </Heading>
              <p className="mt-3 text-body text-muted">
                Thank you for getting in touch with Pav Dental. Our Bradford reception team will
                contact you during your preferred time window. Need to be seen sooner? You can book
                directly online or call{" "}
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="font-medium text-terracotta underline underline-offset-4"
                >
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <BookButton>Book Your First Visit</BookButton>
                <Button type="button" variant="outline" onClick={reset}>
                  Send another enquiry
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Heading as="h3" size="h3-md">
                New Patient Enquiry
              </Heading>
              <p className="mt-2 text-body text-muted">
                Basic contact details only — quick, simple, and privacy-safe.
              </p>

              <form onSubmit={(e) => submit(e)} className="mt-6 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-email">Email Address</Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="reg-phone">Phone Number</Label>
                    <Input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="07123 456789"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reg-contact-time">Preferred Contact Time</Label>
                    <div className="relative">
                      <select
                        id="reg-contact-time"
                        name="interest"
                        defaultValue={CONTACT_TIME_OPTIONS[0]}
                        className="appearance-none flex h-12 w-full rounded-sm border border-border-strong bg-white px-4 pr-10 text-body text-fg t-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {CONTACT_TIME_OPTIONS.map((option) => (
                          <option key={option} value={`Preferred contact time: ${option}`}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reg-message">General Enquiry Note</Label>
                  <Textarea
                    id="reg-message"
                    name="message"
                    rows={4}
                    placeholder="Let us know what kind of care you are interested in (no medical details required)..."
                  />
                </div>

                {error ? (
                  <p role="alert" className="text-small text-danger">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" disabled={sending} className="w-full">
                  <span>{sending ? "Sending…" : "Send Registration Enquiry"}</span>
                  <Send aria-hidden="true" />
                </Button>

                <p className="text-center text-caption text-subtle">
                  By submitting, you agree to our{" "}
                  <Link
                    to="/terms-and-condition"
                    className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}

/** Dark brown + gold membership & patient benefits highlight strip (Hims Mobbin e4eccce0). */
function RegistrationBenefitsStrip() {
  return (
    <Section
      id="benefits"
      theme="brown"
      width="bento"
      space="lg"
      aria-labelledby="benefits-heading"
    >
      <div className="max-w-3xl">
        <span className="inline-block rounded-pill border border-white/15 bg-white/10 px-4 py-1.5 text-caption font-medium text-gold">
          Patient Benefits
        </span>
        <Heading as="h2" size="h2" accent="from day one" tone="gold" className="mt-4">
          <span id="benefits-heading">More care and clarity</span>
        </Heading>
        <p className="mt-5 text-lead text-white/80">
          Every registered patient at Pav Dental gets 24/7 access to our Bradford clinic, transparent
          fee schedules, and the option to join our Bronze, Silver, or Gold membership plans.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {REGISTRATION_BENEFITS.map((benefit) => (
          <Tile key={benefit.step} tone="glass" className="border border-white/12 p-6 md:p-8">
            <span className="inline-flex size-8 items-center justify-center rounded-pill bg-gold/15 text-caption font-medium text-gold">
              {benefit.step}
            </span>
            <h3 className="mt-4 text-h4 text-gold">{benefit.title}</h3>
            <p className="mt-3 text-body text-white/80">{benefit.description}</p>
          </Tile>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <BookButton variant="gold">Book Your First Visit</BookButton>
        <ButtonLink href="/pricing#plans" variant="glass">
          Explore Membership Plans
        </ButtonLink>
        <ButtonLink href="/services/finance" variant="glass">
          Payment Options
        </ButtonLink>
      </div>
    </Section>
  );
}

/** Clean white FAQ accordion (Hims Mobbin 54b349fb). */
function RegistrationFaqSection() {
  return (
    <Section id="faq" theme="white" width="wide" aria-labelledby="registration-faq-heading">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
        <div className="lg:sticky lg:top-24">
          <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
            Registration FAQs
          </span>
          <Heading
            as="h2"
            size="h2-md"
            accent="answered clearly"
            tone="terracotta"
            className="mt-4"
          >
            <span id="registration-faq-heading">New patient questions,</span>
          </Heading>
          <p className="mt-4 text-body text-muted">
            Everything you need to know before your first visit to 786 Leeds Road, Bradford.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <BookButton>Book Your First Visit</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>

        <FaqList items={REGISTRATION_FAQS} tone="light" defaultOpen={0} />
      </div>
    </Section>
  );
}
