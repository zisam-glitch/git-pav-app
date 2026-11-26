import { BookButton, Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function GrillzContact() {
  const enquiry = useEnquiry("Custom grillz");

  return (
    <Section id="contact" theme="white" aria-labelledby="grillz-contact-heading">
      <div className="grid items-start gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
        <div className="max-w-[460px]">
          <div id="grillz-contact-heading" className="mt-4">
            <Heading as="h2" size="h2-md" accent="Touch" tone="terracotta" inline>
              Get In
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">
            Ready to take control of your dental health? Contact us to book your appointment today!
          </p>

          <ul className="mt-8 divide-y divide-border border-y border-border text-body">
            <li className="py-3 text-fg">786 Leeds Road, Bradford, BD3 9TY</li>
            <li className="py-3">
              <a
                href={PRACTICE_PHONE_HREF}
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
              >
                {PRACTICE_PHONE}
              </a>
            </li>
            <li className="py-3">
              <a
                href="tel:+447311871456"
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
              >
                44 7311 871456
              </a>
            </li>
            <li className="py-3">
              <a
                href={`mailto:${PRACTICE_EMAIL}`}
                className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
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
                Thank you for contacting Pav Dental. A member of our team will review your design
                enquiry and get back to you promptly.
              </p>
              <Button className="mt-6" type="button" onClick={enquiry.reset}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="gz-name">Full Name</Label>
                  <Input
                    id="gz-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gz-email">Email Address</Label>
                  <Input
                    id="gz-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gz-subject">Subject</Label>
                  <Input id="gz-subject" name="subject" placeholder="Subject" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gz-phone">Phone</Label>
                  <Input
                    id="gz-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Phone"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gz-style">Grillz Option</Label>
                  <Select id="gz-style" name="interest" defaultValue="">
                    <option value="">Select an option…</option>
                    <option value="Gold Grillz">Gold Grillz</option>
                    <option value="Silver Grillz">Silver Grillz</option>
                    <option value="Diamond Grillz">Diamond Grillz</option>
                    <option value="Tooth Gems">Tooth Gems</option>
                    <option value="Custom Mix of Metals and Gems">
                      Custom Mix of Metals and Gems
                    </option>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gz-metal">Finish Preference</Label>
                  <Select id="gz-metal" name="interest2" defaultValue="">
                    <option value="">Select finish preference…</option>
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Diamond Accents / Iced-Out">Diamond Accents / Iced-Out</option>
                    <option value="Unsure / Discuss at Consultation">
                      Unsure / Discuss at Consultation
                    </option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gz-message">Your Message</Label>
                <Textarea id="gz-message" name="message" placeholder="Your Message" required />
              </div>

              {enquiry.error ? (
                <p role="alert" className="text-small font-medium text-danger">
                  {enquiry.error}
                </p>
              ) : null}

              <Button type="submit" disabled={enquiry.sending} className="h-12 w-full">
                {enquiry.sending ? "Sending…" : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
