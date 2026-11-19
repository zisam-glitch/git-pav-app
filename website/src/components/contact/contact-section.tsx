import { Link } from "@tanstack/react-router";
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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
    <Section id="top" theme="white" width="max" space="sm" className="px-2 md:px-4">
      <div className="rounded-xl bg-cream">
        <div className="wrap grid items-start gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-16">
          <div className="max-w-lg">
            <Heading as="h1" size="hero" accent="Us" tone="terracotta" inline>
              Contact
            </Heading>
            <p className="mt-4 text-lead text-muted">
              Reach our Bradford practice by phone, email, WhatsApp, or complete the form below.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton>Book Now</BookButton>
              <CallButton variant="outline" />
            </div>

            <dl className="mt-10 space-y-4 border-t border-border pt-8 text-body">
              <div className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="text-small font-medium text-muted">Our Address</dt>
                  <dd className="text-fg">786 Leeds Road, Bradford, BD3 9TY</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="text-small font-medium text-muted">Practice Manager</dt>
                  <dd>
                    <a
                      href={`mailto:${PRACTICE_EMAIL}`}
                      className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                    >
                      {PRACTICE_EMAIL}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="text-small font-medium text-muted">Phone</dt>
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
                <MessageCircle aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="text-small font-medium text-muted">WhatsApp</dt>
                  <dd>
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

              <div className="flex items-start gap-3">
                <Clock aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted" />
                <div>
                  <dt className="text-small font-medium text-muted">Hours</dt>
                  <dd className="text-fg">{PRACTICE_HOURS} (00:00 – 24:00)</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 md:p-10 lg:p-12">
            {sent ? (
              <div className="max-w-md">
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
                <Heading as="h2" size="h3-md">
                  Send us Message
                </Heading>
                <p className="mt-2 text-body text-muted">
                  Send an enquiry to our Bradford dental team.
                </p>

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
                    {sending ? "Sending…" : "Send Message"}
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
    </Section>
  );
}

function ContactDetailsSection() {
  return (
    <Section id="details" theme="white" aria-labelledby="details-heading">
      <div className="max-w-2xl">
        <Heading as="h2" size="h2-md" accent="Bradford Clinic" tone="terracotta" inline>
          <span id="details-heading">Visit Our</span>
        </Heading>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Tile tone="cream" className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <p className="text-small font-medium text-muted">Our Address</p>
            <h3 className="mt-2 text-h4 text-fg">786 Leeds Road, Bradford, BD3 9TY</h3>
          </div>
          <ButtonLink href={MAPS_URL} variant="outline" size="sm" className="w-fit">
            Open in Google Maps
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </ButtonLink>
        </Tile>

        <Tile tone="cream" className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <p className="text-small font-medium text-muted">Working Hours</p>
            <h3 className="mt-2 text-h4 text-fg">00:00 – 24:00</h3>
            <p className="mt-2 text-body text-muted">{PRACTICE_HOURS}</p>
          </div>
          <CallButton variant="outline" size="sm" className="w-fit" />
        </Tile>

        <Tile tone="cream" className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <p className="text-small font-medium text-muted">Our Social</p>
            <h3 className="mt-2 text-h4 text-fg">Practice Manager</h3>
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
                  className="inline-flex h-[34px] items-center rounded-pill border border-border-strong bg-white px-3 text-small font-medium text-fg t-colors hover:border-black"
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
    <Section id="location" theme="cream" aria-labelledby="location-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Heading as="h2" size="h2-md" accent="Bradford" tone="terracotta" inline>
            <span id="location-heading">Find Us in</span>
          </Heading>
          <p className="mt-3 text-lead text-muted">786 Leeds Road, Bradford, BD3 9TY</p>
        </div>
        <ButtonLink href={MAPS_URL} variant="outline">
          Open in Google Maps
          <ExternalLink aria-hidden="true" className="size-4" />
        </ButtonLink>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white">
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
            <MapPin aria-hidden="true" className="size-5 shrink-0 text-muted" />
            <div>
              <p className="text-label text-fg">Pav Dental</p>
              <p className="text-small text-muted">786 Leeds Road, Bradford, BD3 9TY</p>
            </div>
          </div>
          <BookButton size="sm">Book Now</BookButton>
        </div>
      </div>
    </Section>
  );
}
