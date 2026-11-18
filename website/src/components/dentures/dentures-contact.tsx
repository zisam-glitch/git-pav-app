import { CallButton, Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEnquiry } from "@/lib/use-enquiry";

export function DenturesContact() {
  const enquiry = useEnquiry("Dentures");

  return (
    <Section id="contact" theme="cream">
      <div className="grid items-start gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
        <div className="max-w-[460px]">
          <Heading size="h2-md" accent="Touch" tone="terracotta" inline>
            Get In
          </Heading>
          <p className="mt-4 text-lead text-muted">
            Ready to take control of your dental health? Contact us to book your appointment today!
          </p>
          <div className="mt-6">
            <CallButton variant="outline" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 md:p-12">
          {enquiry.sent ? (
            <div role="status" className="max-w-[460px]">
              <Heading as="h3" size="h3-md">
                Message received
              </Heading>
              <p className="mt-3 text-body text-muted">
                Thank you. A member of our team will reply during clinic hours.
              </p>
              <Button className="mt-6" onClick={enquiry.reset}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="den-name">Full Name</Label>
                  <Input
                    id="den-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="den-email">Email Address</Label>
                  <Input
                    id="den-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="den-subject">Subject</Label>
                  <Input id="den-subject" name="subject" placeholder="Dentures enquiry" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="den-phone">Phone</Label>
                  <Input
                    id="den-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="0800 1938 786"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="den-service">Denture option</Label>
                <Select id="den-service" name="interest">
                  <option value="">Select an option</option>
                  <option>Full Dentures</option>
                  <option>Partial Dentures</option>
                  <option>Implant-Supported Dentures</option>
                  <option>Flexible Dentures</option>
                  <option>Acrylic Denture – £495</option>
                  <option>Flexible (Valplast) Denture – £795</option>
                  <option>Cobalt Chromium Denture – £1195</option>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="den-message">Your Message</Label>
                <Textarea
                  id="den-message"
                  name="message"
                  placeholder="Tell us how we can help..."
                  required
                />
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
