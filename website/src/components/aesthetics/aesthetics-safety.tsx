import { BookButton, Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function AestheticsSafety() {
  const enquiry = useEnquiry("Facial aesthetics");

  return (
    <Section id="enquire" theme="cream" aria-labelledby="aesthetics-enquire-heading">
      <div className="grid items-start gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
        <div className="max-w-[460px]">
          <span className="inline-flex items-center rounded-pill border border-border bg-white px-3.5 py-1 text-caption font-medium text-copper">
            Clinic Consultation
          </span>
          <div id="aesthetics-enquire-heading" className="mt-4">
            <Heading size="h2-md" accent="Appointment" tone="terracotta" inline>
              Book
            </Heading>
          </div>
          <p className="mt-4 text-lead text-muted">
            Offers and packages now availabe. Please enquire with our team today on{" "}
            <a
              href="tel:08000996375"
              className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
            >
              0800 099 6375
            </a>{" "}
            to find out more
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
            <BookButton variant="outline">Book Now</BookButton>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 md:p-10 lg:p-12">
          {enquiry.sent ? (
            <div role="status" className="max-w-[460px]">
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
                  <Label htmlFor="aes-name">Full Name</Label>
                  <Input
                    id="aes-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aes-email">Email Address</Label>
                  <Input
                    id="aes-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aes-service">Treatment of Interest</Label>
                  <Select id="aes-service" name="interest">
                    <option value="">Select a treatment</option>
                    <option>Microneedling</option>
                    <option>Botox</option>
                    <option>Dermal fillers</option>
                    <option>Chemical peels</option>
                    <option>Lip enhancement</option>
                    <option>Skin Rejuvenation</option>
                    <option>Profhilo First Dose</option>
                    <option>Sosum Booster</option>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aes-phone">Phone</Label>
                  <Input
                    id="aes-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Phone"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="aes-message">Your Message</Label>
                <Textarea id="aes-message" name="message" placeholder="Your Message" required />
              </div>

              {enquiry.error ? (
                <p role="alert" className="text-small font-medium text-danger">
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
