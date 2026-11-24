import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { CONTAINER, LEAD, MUTED_TITLE, SOFT_CARD, TITLE } from "@/components/pricing/tokens";
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

const FIELD =
  "h-14 rounded-2xl border-0 bg-[#f4f1ea] px-5 text-[16px] text-[#1b1b1b] placeholder:text-[#8b8d92]";

/** Hero tiles, after the structure measured on hims.com (see the pricing hero). */
const FEATURED = [
  {
    href: MAPS_URL,
    external: true,
    lead: "Visit our",
    accent: "Bradford clinic",
    label: "Open in Google Maps",
    image: "/images/home/care-visit.jpg",
  },
  {
    href: WHATSAPP_URL,
    external: true,
    lead: "Message us on",
    accent: "WhatsApp",
    label: "+44 7311 871456",
    image: "/images/home/smile-sunny.jpg",
  },
] as const;

const PILLS = [
  { href: PRACTICE_PHONE_HREF, before: "Call", accent: PRACTICE_PHONE, image: "/images/home/tile-case.webp" },
  { href: `mailto:${PRACTICE_EMAIL}`, before: "Email the", accent: "practice", image: "/images/home/tile-vial.webp" },
  { href: "#details", before: "Open", accent: "24/7", image: "/images/home/tile-tooth.webp" },
  { href: "#location", before: "Find us in", accent: "Bradford", image: "/images/home/tile-van.webp" },
] as const;

export function ContactSection() {
  return (
    <>
      <ContactHero />
      <ContactFormSection />
      <ContactDetailsSection />
      <ContactMapSection />
      <ContactClosing />
    </>
  );
}

function ContactHero() {
  return (
    <section id="top" className="scroll-mt-20 bg-white pt-8 pb-12 md:pt-12 md:pb-20">
      <div className={CONTAINER}>
        <h1 className="text-[clamp(38px,4vw,57px)] leading-none font-[410] tracking-[-0.01em] text-[rgba(0,0,0,0.88)]">
          Contact <span className="text-[#8a4242]">Us</span>
        </h1>
        <p className="mt-5 max-w-[40rem] text-[clamp(17px,1.4vw,20px)] leading-[1.35] text-[#55565a]">
          Reach our Bradford practice by phone, email, WhatsApp, or complete the form below.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" />
        </div>

        <div className="mt-10">
          <div className="grid gap-1 md:grid-cols-2">
            {FEATURED.map((tile) => (
              <a
                key={tile.href}
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex min-h-[199px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#e7ddd2] p-5 text-white"
              >
                <img
                  src={tile.image}
                  alt=""
                  aria-hidden
                  width={1800}
                  height={627}
                  className="absolute inset-0 size-full object-cover object-right transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
                <h3 className="relative text-[20px] leading-[1.2] font-normal">
                  {tile.lead}
                  <br />
                  <span className="text-[#ffc671]">{tile.accent}</span>
                </h3>
                <span className="relative flex items-center gap-2 text-[16px]">
                  {tile.label}
                  <ChevronRight aria-hidden className="size-4" />
                </span>
              </a>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
            {PILLS.map((pill) => (
              <a
                key={pill.href}
                href={pill.href}
                className="group flex h-[100px] items-center justify-between rounded-[24px] bg-[#f4f0e8] pr-2 pl-4 t-colors hover:bg-[#ece6da]"
              >
                <span className="text-[19px] leading-[1.2] text-[#37556e]">
                  {pill.before} <span className="text-[#8a4242]">{pill.accent}</span>
                </span>
                <span className="flex items-center gap-1">
                  <img
                    src={pill.image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    width={160}
                    height={160}
                    className="size-20 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <ChevronRight aria-hidden className="size-4 text-[#1b1b1b]" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactFormSection() {
  const { sending, sent, error, submit, reset } = useEnquiry("Contact");

  return (
    <section className="bg-[#f7f5f2] py-14 md:py-24">
      <div className={`${CONTAINER} grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
        <div>
          <h2 className={TITLE}>
            Send us <span className={MUTED_TITLE}>Message</span>
          </h2>
          <p className={`mt-5 max-w-[30rem] ${LEAD}`}>Send an enquiry to our Bradford dental team.</p>

          <dl className="mt-10 divide-y divide-[#1b1b1b]/10 border-y border-[#1b1b1b]/10">
            {[
              {
                icon: MapPin,
                term: "Our Address",
                value: <span>786 Leeds Road, Bradford, BD3 9TY</span>,
              },
              {
                icon: Phone,
                term: "Phone",
                value: (
                  <a href={PRACTICE_PHONE_HREF} className="underline underline-offset-4">
                    {PRACTICE_PHONE}
                  </a>
                ),
              },
              {
                icon: MessageCircle,
                term: "WhatsApp",
                value: (
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    Whatsapp: +44 7311 871456
                  </a>
                ),
              },
              {
                icon: Mail,
                term: "Practice Manager",
                value: (
                  <a href={`mailto:${PRACTICE_EMAIL}`} className="underline underline-offset-4">
                    {PRACTICE_EMAIL}
                  </a>
                ),
              },
              {
                icon: Clock,
                term: "Hours",
                value: <span>{PRACTICE_HOURS} (00:00 – 24:00)</span>,
              },
            ].map(({ icon: Icon, term, value }) => (
              <div key={term} className="flex items-center gap-4 py-4">
                <Icon aria-hidden strokeWidth={1.4} className="size-8 shrink-0 text-[#1b1b1b]" />
                <div className="min-w-0">
                  <dt className="text-small text-[#8b8d92]">{term}</dt>
                  <dd className="mt-0.5 text-[18px] break-words text-[#1b1b1b]">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className={`${SOFT_CARD} p-6 md:p-10`}>
          {sent ? (
            <div className="max-w-md py-4">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#5b3fc4] text-white">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <h2 className="text-[clamp(26px,2.6vw,36px)] leading-[1.1] font-normal tracking-[-0.02em] text-[#1b1b1b]">
                Message sent
              </h2>
              <p className="mt-3 text-[16px] leading-[1.45] text-[#55565a]">
                Thank you for reaching out. Our team will review your enquiry and get back to you
                shortly, or you can call us on{" "}
                <a href={PRACTICE_PHONE_HREF} className="text-[#1b1b1b] underline underline-offset-4">
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
              <Button type="button" className="mt-6" onClick={reset}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => submit(e)} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contact-name">Full Name</Label>
                  <Input id="contact-name" name="name" autoComplete="name" required placeholder="Jane Doe" className={FIELD} />
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
                    className={FIELD}
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
                    className={FIELD}
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
                    className={FIELD}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact-message">Your Message</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="rounded-2xl border-0 bg-[#f4f1ea] px-5 py-4 text-[16px] placeholder:text-[#8b8d92]"
                />
              </div>

              {error ? (
                <p role="alert" className="text-small text-danger">
                  {error}
                </p>
              ) : null}

              <Button type="submit" disabled={sending} className="h-14 w-full rounded-full text-[16px]">
                <span>{sending ? "Sending…" : "Send Message"}</span>
                <Send aria-hidden="true" className="size-4" />
              </Button>

              <p className="text-center text-caption text-[#8b8d92]">
                By contacting us, you agree to our{" "}
                <Link to="/terms-and-condition" className="text-[#1b1b1b] underline underline-offset-4">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-[#1b1b1b] underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function ContactDetailsSection() {
  return (
    <section id="details" aria-labelledby="details-heading" className="scroll-mt-20 bg-white py-14 md:py-24">
      <div className={CONTAINER}>
        <h2 className={TITLE} id="details-heading">
          Visit Our <span className={MUTED_TITLE}>Bradford Clinic</span>
        </h2>

        <div className="mt-12 grid gap-3 md:grid-cols-3 md:gap-4">
          <div className={`${SOFT_CARD} flex flex-col justify-between gap-8 p-7 md:p-8`}>
            <div>
              <span className="inline-flex rounded-full bg-[#5b3fc4] px-2.5 py-[3px] text-[11px] leading-none text-white">
                Our Address
              </span>
              <h3 className="mt-5 text-[clamp(22px,1.9vw,28px)] leading-[1.12] font-normal tracking-[-0.015em] text-[#1b1b1b]">
                786 Leeds Road, Bradford, BD3 9TY
              </h3>
              <p className="mt-3 text-[16px] leading-[1.45] text-[#55565a]">
                Direct main-road access on Leeds Road with nearby parking.
              </p>
            </div>
            <ButtonLink href={MAPS_URL} variant="outline" size="sm" className="w-fit">
              Open in Google Maps
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </ButtonLink>
          </div>

          <div className="flex flex-col justify-between gap-8 rounded-[22px] bg-[#1b1b1b] p-7 text-white md:p-8">
            <div>
              <span className="inline-flex rounded-full bg-white px-2.5 py-[3px] text-[11px] leading-none text-[#1b1b1b]">
                Working Hours
              </span>
              <h3 className="mt-5 text-[clamp(30px,2.6vw,40px)] leading-[1.08] font-normal tracking-[-0.02em]">
                00:00 – 24:00
              </h3>
              <p className="mt-3 text-[16px] leading-[1.45] text-white/75">{PRACTICE_HOURS}</p>
            </div>
            <CallButton variant="glass" size="sm" className="w-fit" />
          </div>

          <div className={`${SOFT_CARD} flex flex-col justify-between gap-8 p-7 md:p-8`}>
            <div>
              <span className="inline-flex rounded-full bg-[#5b3fc4] px-2.5 py-[3px] text-[11px] leading-none text-white">
                Our Social
              </span>
              <h3 className="mt-5 text-[clamp(22px,1.9vw,28px)] leading-[1.12] font-normal tracking-[-0.015em] text-[#1b1b1b]">
                Practice Manager
              </h3>
              <p className="mt-3 text-[16px]">
                <a href={`mailto:${PRACTICE_EMAIL}`} className="text-[#1b1b1b] underline underline-offset-4">
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
                    className="inline-flex h-9 items-center rounded-full bg-[#f4f1ea] px-4 text-small text-[#1b1b1b] t-colors hover:bg-[#ebe6dc]"
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactMapSection() {
  return (
    <section id="location" aria-labelledby="location-heading" className="scroll-mt-20 bg-[#f7f5f2] py-14 md:py-24">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className={TITLE} id="location-heading">
              Find Us in <span className={MUTED_TITLE}>Bradford</span>
            </h2>
            <p className={`mt-4 ${LEAD}`}>786 Leeds Road, Bradford, BD3 9TY</p>
          </div>
          <ButtonLink href={MAPS_URL} variant="outline">
            Open in Google Maps
            <ExternalLink aria-hidden="true" className="size-4" />
          </ButtonLink>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_36px_rgba(20,20,40,0.07)]">
          <div className="h-72 w-full bg-[#efece6] sm:h-[440px]">
            <iframe
              title="Pav Dental Bradford Location Map"
              src={MAPS_EMBED_URL}
              className="size-full border-0"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col items-start justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center md:px-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f4f1ea] text-[#5b3fc4]">
                <MapPin aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-[17px] text-[#1b1b1b]">Pav Dental</p>
                <p className="text-small text-[#55565a]">786 Leeds Road, Bradford, BD3 9TY</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <CallButton variant="outline" size="sm" />
              <BookButton size="sm">Book Now</BookButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactClosing() {
  return (
    <section className="bg-white py-14 md:py-24">
      <div className={CONTAINER}>
        <div className="rounded-[28px] bg-gradient-to-br from-[#d9cdf6] via-[#ece6fa] to-[#f7f3fd] px-6 py-14 text-center md:px-10 md:py-20">
          <h2 className={TITLE}>
            Ready to book <span className="text-[#8a4242]">your visit?</span>
          </h2>
          <p className={`mx-auto mt-5 max-w-[34rem] ${LEAD}`}>
            786 Leeds Road, Bradford, BD3 9TY · {PRACTICE_HOURS} (00:00 – 24:00).
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
            <ButtonLink variant="outline" href={WHATSAPP_URL}>
              WhatsApp Us
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
