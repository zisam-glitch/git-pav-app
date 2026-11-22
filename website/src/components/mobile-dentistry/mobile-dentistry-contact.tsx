import { BookButton, Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function MobileDentistryContact() {
  const enquiry = useEnquiry("Mobile dentistry");

  return (
    <Section id="contact" theme="cream" aria-labelledby="mobile-contact-heading">
      <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <div className="max-w-[460px]">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Enquire
          </span>
          <div id="mobile-contact-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="Touch" tone="terracotta" inline>
              Get In
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">
            Ready to take control of your dental health? Contact us to book your appointment
            today!
          </p>
          <ul className="mt-8 divide-y divide-border border-y border-border text-body">
            <li className="py-3 text-fg">786 Leeds Road, Bradford, BD3 9TY</li>
            <li className="py-3">
              <a
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                href={PRACTICE_PHONE_HREF}
              >
                {PRACTICE_PHONE}
              </a>
            </li>
            <li className="py-3">
              <a
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                href="tel:+447311871456"
              >
                44 7311 871456
              </a>
            </li>
            <li className="py-3">
              <a
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                href={`mailto:${PRACTICE_EMAIL}`}
              >
                {PRACTICE_EMAIL}
              </a>
            </li>
            <li className="py-3 text-small text-muted">{PRACTICE_HOURS}</li>
          </ul>

          <div className="mt-8">
            <BookButton variant="outline">Book Appointment</BookButton>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 md:p-10 lg:p-12">
          {enquiry.sent ? (
            <div role="status" className="max-w-[460px]">
              <Heading as="h3" size="h3-md">
                Message received
              </Heading>
              <p className="mt-3 text-body text-muted">
                Thank you. Your message has reached the practice, and the team will get back to
                you.
              </p>
              <Button className="mt-6" onClick={enquiry.reset}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="How can we help?" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us about your dental care needs..."
                  required
                />
              </div>

              {enquiry.error ? (
                <p role="alert" className="text-small font-medium text-rust">
                  {enquiry.error}
                </p>
              ) : null}

              <Button type="submit" disabled={enquiry.sending} className="w-full">
                {enquiry.sending ? "Sending…" : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
