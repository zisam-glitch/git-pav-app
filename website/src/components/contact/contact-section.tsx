import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  Heading,
  Section,
  Tile,
} from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SOCIAL_LINKS } from "@/content/site-links";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

const WHATSAPP_URL = "https://wa.me/447311871456";
const MAPS_URL = "https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY";
const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.4024254848316!2d-1.728923322964094!3d53.79978714088019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c6fcb3dc04b%3A0x7d6f51a7e4b9bbd0!2s786%20Leeds%20Rd%2C%20Bradford%20BD3%209TY%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk";

const CONTACT_JUMPS = [
  { num: "01", label: "Send us Message", href: "#top" },
  { num: "02", label: "Clinic Details", href: "#details" },
  { num: "03", label: "Location & Map", href: "#location" },
] as const;

export function ContactSection() {
  return (
    <>
      <ContactLeadSection />
      <ContactDetailsSection />
      <ContactMapSection />
      <CtaBand
        theme="brown"
        title="Ready to book"
        accent="your visit?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
            <ButtonLink variant="glass" href={WHATSAPP_URL}>
              WhatsApp Us
            </ButtonLink>
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · {PRACTICE_HOURS} (00:00 – 24:00).
      </CtaBand>
    </>
  );
}

function ContactLeadSection() {
  const { sending, sent, error, submit, reset } = useEnquiry("Contact");

  return (
    <Section id="top" theme="white" space="default">
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-fg">
            Bradford · Open 24/7
          </span>
          <Heading as="h1" size="hero" accent="Us" tone="terracotta" inline className="mt-4">
            Contact
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Reach our Bradford practice by phone, email, WhatsApp, or complete the form below.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-tile-cream p-4 sm:col-span-2">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-pill bg-white text-terracotta">
                  <MapPin aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <dt className="text-caption font-medium text-muted">Our Address</dt>
                  <dd className="mt-0.5 text-body font-medium text-fg">
                    786 Leeds Road, Bradford, BD3 9TY
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-tile-cream p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-pill bg-white text-terracotta">
                  <Phone aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <dt className="text-caption font-medium text-muted">Phone</dt>
                  <dd className="mt-0.5 text-body font-medium">
                    <a
                      href={PRACTICE_PHONE_HREF}
                      className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                    >
                      {PRACTICE_PHONE}
                    </a>
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-tile-sage p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-pill bg-white text-fg">
                  <MessageCircle aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <dt className="text-caption font-medium text-muted">WhatsApp</dt>
                  <dd className="mt-0.5 text-body font-medium">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                    >
                      Whatsapp: +44 7311 871456
                    </a>
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-tile-cream p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-pill bg-white text-terracotta">
                  <Mail aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-caption font-medium text-muted">Practice Manager</dt>
                  <dd className="mt-0.5 truncate text-body font-medium">
                    <a
                      href={`mailto:${PRACTICE_EMAIL}`}
                      className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                    >
                      {PRACTICE_EMAIL}
                    </a>
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-tile-cream p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-pill bg-white text-terracotta">
                  <Clock aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <dt className="text-caption font-medium text-muted">Hours</dt>
                  <dd className="mt-0.5 text-body font-medium text-fg">
                    {PRACTICE_HOURS} (00:00 – 24:00)
                  </dd>
                </div>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-tile-cream p-3 md:p-4">
          <div className="rounded-xl border border-border bg-white p-6 md:p-10">
            {sent ? (
              <div className="max-w-md py-4">
                <div className="mb-4 flex size-12 items-center justify-center rounded-pill bg-sage text-fg">
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                </div>
                <Heading as="h2" size="h3-md">
                  Message sent
                </Heading>
                <p className="mt-3 text-body text-muted">
                  Thank you for reaching out. Our team will review your enquiry and get back to you
                  shortly, or you can call us on{" "}
                  <a
                    href={PRACTICE_PHONE_HREF}
                    className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  >
                    {PRACTICE_PHONE}
                  </a>
                  .
                </p>
                <Button type="button" className="mt-6" onClick={reset}>
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
                  <div>
                    <span className="inline-block rounded-pill border border-border bg-cream px-3 py-1 text-caption font-medium text-fg">
                      Patient Enquiry
                    </span>
                    <Heading as="h2" size="h3-md" className="mt-2.5">
                      Send us Message
                    </Heading>
                    <p className="mt-1.5 text-body text-muted">
                      Send an enquiry to our Bradford dental team.
                    </p>
                  </div>
                </div>

                <form onSubmit={(e) => submit(e)} className="mt-6 grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="contact-name">Full Name</Label>
                      <Input
                        id="contact-name"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-email">Email Address</Label>
                      <Input
                        id="contact-email"
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
                      <Label htmlFor="contact-subject">Subject</Label>
                      <Input
                        id="contact-subject"
                        name="subject"
                        placeholder="Appointment or treatment enquiry"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+44 7311 871456"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contact-message">Your Message</Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  {error ? (
                    <p role="alert" className="text-small text-danger">
                      {error}
                    </p>
                  ) : null}

                  <Button type="submit" disabled={sending} className="w-full">
                    <span>{sending ? "Sending…" : "Send Message"}</span>
                    <Send aria-hidden="true" className="size-4" />
                  </Button>

                  <p className="text-center text-caption text-subtle">
                    By contacting us, you agree to our{" "}
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
      </div>

      {/* Hims "On this page" numbered jump-link rail */}
      <nav
        aria-label="On this page"
        className="mt-10 flex flex-wrap items-center gap-2.5 border-t border-border pt-6"
      >
        <span className="mr-2 text-caption font-medium text-subtle">On this page</span>
        {CONTACT_JUMPS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="group inline-flex items-center gap-2.5 rounded-pill border border-border bg-cream py-1.5 pr-4 pl-2 text-small font-medium text-fg t-colors hover:border-black hover:bg-white"
          >
            <span className="inline-flex size-6 items-center justify-center rounded-pill bg-white text-caption font-medium text-terracotta t-colors group-hover:bg-black group-hover:text-white">
              {item.num}
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </Section>
  );
}

function ContactDetailsSection() {
  return (
    <Section id="details" theme="cream" aria-labelledby="details-heading">
      <div className="max-w-2xl">
        <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
          Clinic Information
        </span>
        <Heading
          as="h2"
          size="h2-md"
          accent="Bradford Clinic"
          tone="terracotta"
          inline
          className="mt-4"
        >
          <span id="details-heading">Visit Our</span>
        </Heading>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Tile tone="white" lift className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-pill bg-black text-caption font-medium text-white">
                01
              </span>
              <span className="rounded-pill border border-border bg-cream px-3 py-1 text-caption font-medium text-fg">
                Our Address
              </span>
            </div>
            <h3 className="mt-5 text-h4 text-fg">786 Leeds Road, Bradford, BD3 9TY</h3>
            <p className="mt-2 text-small text-muted">
              Direct main-road access on Leeds Road with nearby parking.
            </p>
          </div>
          <ButtonLink href={MAPS_URL} variant="outline" size="sm" className="w-fit">
            Open in Google Maps
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </ButtonLink>
        </Tile>

        <Tile tone="sage" lift className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-pill bg-black text-caption font-medium text-white">
                02
              </span>
              <span className="rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-fg">
                Working Hours
              </span>
            </div>
            <h3 className="mt-5 text-h4 text-fg">00:00 – 24:00</h3>
            <p className="mt-2 text-body text-muted">{PRACTICE_HOURS}</p>
          </div>
          <CallButton variant="outline" size="sm" className="w-fit bg-white" />
        </Tile>

        <Tile tone="white" lift className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-pill bg-black text-caption font-medium text-white">
                03
              </span>
              <span className="rounded-pill border border-border bg-cream px-3 py-1 text-caption font-medium text-fg">
                Our Social
              </span>
            </div>
            <h3 className="mt-5 text-h4 text-fg">Practice Manager</h3>
            <p className="mt-2 text-body">
              <a
                href={`mailto:${PRACTICE_EMAIL}`}
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
              >
                {PRACTICE_EMAIL}
              </a>
            </p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[34px] items-center rounded-pill border border-border-strong bg-cream px-3 text-small font-medium text-fg t-colors hover:border-black hover:bg-white"
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </Section>
  );
}

function ContactMapSection() {
  return (
    <Section id="location" theme="sand" aria-labelledby="location-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-block rounded-pill border border-border bg-white px-4 py-1.5 text-caption font-medium text-fg">
            Directions &amp; Map
          </span>
          <Heading
            as="h2"
            size="h2-md"
            accent="Bradford"
            tone="terracotta"
            inline
            className="mt-4"
          >
            <span id="location-heading">Find Us in</span>
          </Heading>
          <p className="mt-3 text-lead text-muted">786 Leeds Road, Bradford, BD3 9TY</p>
        </div>
        <ButtonLink href={MAPS_URL} variant="outline" className="bg-white">
          Open in Google Maps
          <ExternalLink aria-hidden="true" className="size-4" />
        </ButtonLink>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white shadow-soft">
        <div className="h-72 w-full bg-sand sm:h-[420px]">
          <iframe
            title="Pav Dental Bradford Location Map"
            src={MAPS_EMBED_URL}
            className="size-full border-0"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-cream text-terracotta">
              <MapPin aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-label text-fg">Pav Dental</p>
              <p className="text-small text-muted">786 Leeds Road, Bradford, BD3 9TY</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <CallButton variant="outline" size="sm" />
            <BookButton size="sm">Book Now</BookButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

