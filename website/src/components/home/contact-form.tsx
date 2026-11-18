import { useState, type FormEvent } from "react";
import { Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { PRACTICE_EMAIL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    try {
      await api.forms.submitContact({
        name,
        email,
        phone: phone || undefined,
        subject: subject || "Website Enquiry",
        message,
      });
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : undefined;
      setError(
        msg || "Could not submit your message. Please try again or call our clinic directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section id="contact" theme="white" width="max" space="sm" className="px-2 md:px-4">
      <div className="rounded-xl bg-cream">
        <div className="wrap grid items-start gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:py-16">
          <div className="max-w-[460px]">
            <p className="text-small font-medium text-muted">Visit</p>
            <Heading as="h2" size="h2-md" accent="Touch" tone="terracotta" inline className="mt-2">
              Get In
            </Heading>
            <p className="mt-4 text-lead text-muted">
              Ready to take control of your dental health? Contact us to book your appointment
              today!
            </p>
            <ul className="mt-8 space-y-3 text-body">
              <li className="text-fg">786 Leeds Road, Bradford, BD3 9TY</li>
              <li>
                <a
                  className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  href={PRACTICE_PHONE_HREF}
                >
                  {PRACTICE_PHONE}
                </a>
              </li>
              <li>
                <a
                  className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  href="tel:+447311871456"
                >
                  +44 7311 871456
                </a>
              </li>
              <li>
                <a
                  className="text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                  href={`mailto:${PRACTICE_EMAIL}`}
                >
                  {PRACTICE_EMAIL}
                </a>
              </li>
            </ul>
            <p className="mt-8 text-small text-muted">
              Founder &amp; principal dentist — Dr Hassan Bhojani. Registered with the General
              Dental Council. Regulated by the Care Quality Commission.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 md:p-[60px]">
            {sent ? (
              <div className="max-w-[460px]">
                <Heading as="h3" size="h3-md">
                  Message received
                </Heading>
                <p className="mt-3 text-body text-muted">
                  Thank you. A member of the team will reply during clinic hours. For pain now, call
                  the emergency line.
                </p>
                <Button className="mt-6" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+44"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="Check-up / emergency" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea id="message" name="message" required placeholder="How can we help?" />
                </div>
                {error ? (
                  <p role="alert" className="text-small font-medium text-danger">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" className="h-12 w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
