import { BookButton, Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function WhiteningContact() {
  const enquiry = useEnquiry("Whitening");

  return (
    <Section id="contact" theme="white" width="max" space="sm" className="px-2 md:px-4">
      <div className="rounded-xl bg-cream">
        <div className="wrap grid items-start gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:py-16">
          <div className="max-w-[460px]">
            <Heading as="h2" size="h2-md" accent="Touch" tone="terracotta" inline>
              Get In
            </Heading>
            <p className="mt-4 text-lead text-muted">
              Ready to take control of your dental health? Contact us to book your appointment
              today!
            </p>

            <ul className="mt-8 text-body">
              <li className="py-2 text-fg">786 Leeds Road, Bradford, BD3 9TY</li>
              <li>
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="inline-flex min-h-11 items-center text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                >
                  {PRACTICE_PHONE}
                </a>
              </li>
              <li>
                <a
                  href="tel:+447311871456"
                  className="inline-flex min-h-11 items-center text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                >
                  44 7311 871456
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${PRACTICE_EMAIL}`}
                  className="inline-flex min-h-11 items-center text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                >
                  {PRACTICE_EMAIL}
                </a>
              </li>
              <li className="py-2 text-small text-muted">{PRACTICE_HOURS}</li>
            </ul>

            <div className="mt-8">
              <BookButton variant="outline">Book Appointment</BookButton>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 md:p-[60px]">
            {enquiry.sent ? (
              <div className="max-w-[460px]">
                <Heading as="h3" size="h3-md">
                  Message received
                </Heading>
                <p className="mt-3 text-body text-muted">
                  Thank you for contacting Pav Dental. A member of our team will review your message
                  and get back to you promptly.
                </p>
                <Button className="mt-6" type="button" onClick={enquiry.reset}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={enquiry.submit} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="wh-name">Full Name</Label>
                    <Input
                      id="wh-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wh-email">Email Address</Label>
                    <Input
                      id="wh-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wh-subject">Subject</Label>
                    <Input id="wh-subject" name="subject" placeholder="Subject" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wh-phone">Phone</Label>
                    <Input
                      id="wh-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Phone"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="wh-message">Your Message</Label>
                  <Textarea id="wh-message" name="message" placeholder="Your Message" required />
                </div>

                {enquiry.error ? (
                  <p role="alert" className="text-small font-medium text-danger">
                    {enquiry.error}
                  </p>
                ) : null}

                <Button type="submit" disabled={enquiry.sending} className="h-12 w-full">
                  {enquiry.sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
