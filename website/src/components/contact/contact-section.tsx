import { Link } from "@tanstack/react-router";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone, Send, Timer } from "lucide-react";
import { useState } from "react";
import { BookButton, ButtonLink } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SOCIAL_LINKS } from "@/content/site-links";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import { useEnquiry } from "@/lib/use-enquiry";

const WHATSAPP_URL = "https://wa.me/447311871456";
const MAPS_URL = "https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY";
const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.4024254848316!2d-1.728923322964094!3d53.79978714088019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c6fcb3dc04b%3A0x7d6f51a7e4b9bbd0!2s786%20Leeds%20Rd%2C%20Bradford%20BD3%209TY%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk";

/**
 * The contact page follows Hims' support screens on Mobbin ("Contacting patient support",
 * the Messages page): one narrow centred column on a light grey page, quiet headings with a
 * grey description, white pill buttons for the topics, a cream card for the form, and a
 * "We're on it" confirmation with a line icon. It is deliberately not the tiled layout used
 * on the home, About and pricing pages.
 */
const COLUMN = "mx-auto w-full max-w-[768px] px-4";
const H2 = "text-[clamp(22px,2.2vw,28px)] leading-[1.15] font-normal tracking-[-0.01em] text-[#1b1b1b]";
const DESC = "mt-1.5 text-[15px] leading-[1.4] text-[#6d6e72]";
const WHITE_PILL =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] text-[#1b1b1b] shadow-[0_6px_22px_rgba(20,20,40,0.07)] t-colors hover:bg-[#faf9f6]";
const FIELD =
  "h-12 rounded-xl border border-[#e4ded2] bg-white px-4 text-[16px] text-[#1b1b1b] placeholder:text-[#9a9a9e]";

const TOPICS = [
  "Appointment",
  "Emergency dental",
  "Treatment or pricing",
  "Membership plans",
  "Something else",
] as const;

export function ContactSection() {
  return (
    <div className="bg-[#f7f7f5] pt-10 pb-20 md:pt-16 md:pb-28">
      <div className={COLUMN}>
        <h1 className="text-[clamp(34px,3.6vw,48px)] leading-[1.05] font-normal tracking-[-0.02em] text-[#1b1b1b]">
          Contact Us
        </h1>
        <p className="mt-3 text-[17px] leading-[1.4] text-[#6d6e72]">
          Reach our Bradford practice by phone, email, WhatsApp, or complete the form below.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <BookButton>Book Now</BookButton>
        </div>

        <ReachUs />
        <MessageForm />
        <Visit />
      </div>
    </div>
  );
}

/** Direct lines, as the white pill buttons of "Contact patient support". */
function ReachUs() {
  return (
    <section id="top" className="mt-14 scroll-mt-20">
      <h2 className={cn(H2, "flex items-center gap-2.5")}>
        Reach us directly
        <span className="rounded-md bg-[#f3f0a8] px-2 py-0.5 text-[11px] leading-none text-[#5c5a10]">
          Open 24/7
        </span>
      </h2>
      <p className={DESC}>{PRACTICE_HOURS} (00:00 – 24:00)</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={PRACTICE_PHONE_HREF} className={WHITE_PILL}>
          <Phone aria-hidden className="size-4" />
          {PRACTICE_PHONE}
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={WHITE_PILL}>
          <MessageCircle aria-hidden className="size-4" />
          Whatsapp: +44 7311 871456
        </a>
        <a href={`mailto:${PRACTICE_EMAIL}`} className={WHITE_PILL}>
          <Mail aria-hidden className="size-4" />
          {PRACTICE_EMAIL}
        </a>
      </div>
    </section>
  );
}

/** Topic pills choose the subject; the form sits in the cream card of Hims' support dialog. */
function MessageForm() {
  const { sending, sent, error, submit, reset } = useEnquiry("Contact");
  const [subject, setSubject] = useState("");

  return (
    <section className="mt-14">
      <h2 className={H2}>Send us Message</h2>
      <p className={DESC}>Send an enquiry to our Bradford dental team.</p>

      <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label="What is your enquiry about?">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            aria-pressed={subject === topic}
            onClick={() => setSubject(topic)}
            className={cn(
              WHITE_PILL,
              subject === topic && "bg-[#1b1b1b] text-white hover:bg-[#1b1b1b]",
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] bg-[#f4efe4] p-6 shadow-[0_18px_50px_rgba(60,40,10,0.08)] md:p-9">
        {sent ? (
          <div className="py-2">
            <Timer aria-hidden strokeWidth={1.2} className="size-14 text-[#1b1b1b]" />
            <h3 className="mt-3 text-[clamp(28px,3vw,40px)] leading-[1.05] font-normal tracking-[-0.02em] text-[#1b1b1b]">
              We&apos;re on it
            </h3>
            <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.45] text-[#4d4d50]">
              Thank you for reaching out. Our team will review your enquiry and get back to you
              shortly, or you can call us on{" "}
              <a href={PRACTICE_PHONE_HREF} className="text-[#1b1b1b] underline underline-offset-4">
                {PRACTICE_PHONE}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => {
                reset();
                setSubject("");
              }}
              className="mt-7 h-12 rounded-full bg-[#b08968] px-10 text-[16px] text-white t-colors hover:bg-[#9f7a5b]"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => submit(e)} className="grid gap-5">
            <p className="text-[clamp(24px,2.6vw,34px)] leading-[1.15] font-normal tracking-[-0.015em] text-[#1b1b1b]">
              Share a few details about{" "}
              <span className="text-[#b08968]">{subject ? subject.toLowerCase() : "your visit"}</span>
            </p>

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
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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
                className="rounded-xl border border-[#e4ded2] bg-white px-4 py-3 text-[16px] placeholder:text-[#9a9a9e]"
              />
            </div>

            {error ? (
              <p role="alert" className="text-small text-danger">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={sending} className="h-12 w-full rounded-full bg-black text-[16px] text-white">
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
    </section>
  );
}

/** Address, practice manager, social links and the map, in the same quiet rows. */
function Visit() {
  return (
    <section id="details" className="mt-14 scroll-mt-20">
      <h2 className={H2} id="location">
        Find Us in Bradford
      </h2>
      <p className={DESC}>Direct main-road access on Leeds Road with nearby parking.</p>

      <dl className="mt-5 grid gap-3">
        <div className="rounded-2xl bg-white p-5 shadow-[0_6px_22px_rgba(20,20,40,0.06)]">
          <dt className="text-small text-[#8b8d92]">Our Address</dt>
          <dd className="mt-1 flex flex-wrap items-center justify-between gap-3 text-[18px] text-[#1b1b1b]">
            <span>786 Leeds Road, Bradford, BD3 9TY</span>
            <ButtonLink href={MAPS_URL} variant="outline" size="sm">
              Open in Google Maps
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </ButtonLink>
          </dd>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_6px_22px_rgba(20,20,40,0.06)]">
          <dt className="text-small text-[#8b8d92]">Practice Manager</dt>
          <dd className="mt-1 text-[18px] text-[#1b1b1b]">
            <a href={`mailto:${PRACTICE_EMAIL}`} className="underline underline-offset-4">
              {PRACTICE_EMAIL}
            </a>
          </dd>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_6px_22px_rgba(20,20,40,0.06)]">
          <dt className="text-small text-[#8b8d92]">Our Social</dt>
          <dd className="mt-3">
            <ul className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-full bg-[#f4efe4] px-4 text-small text-[#1b1b1b] t-colors hover:bg-[#ebe4d4]"
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="mt-4 overflow-hidden rounded-[24px] bg-white shadow-[0_6px_22px_rgba(20,20,40,0.06)]">
        <div className="h-64 w-full bg-[#efece6] sm:h-[360px]">
          <iframe
            title="Pav Dental Bradford Location Map"
            src={MAPS_EMBED_URL}
            className="size-full border-0"
            loading="lazy"
          />
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <MapPin aria-hidden="true" className="size-5 shrink-0 text-[#b08968]" />
          <p className="text-[15px] text-[#1b1b1b]">Pav Dental · 786 Leeds Road, Bradford, BD3 9TY</p>
        </div>
      </div>
    </section>
  );
}
