import { useState, type FormEvent } from "react";
import { BookButton, CallButton, Heading, Section } from "@/components/hims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { PRACTICE_EMAIL, PRACTICE_HOURS, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function EmergencyContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const subject = String(
      formData.get("subject") || "Emergency Dental Consultation Request",
    ).trim();
    const message = String(formData.get("message") || "").trim();

    try {
      await api.forms.submitContact({
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : undefined;
      setError(msg || "Could not submit your emergency request. Please call directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section id="contact-form" theme="white" width="max" space="sm" className="px-2 md:px-4">
      <div className="rounded-xl bg-sand">
        <div className="wrap grid items-start gap-8 py-10 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:py-16">
          <div className="max-w-[460px]">
            <p className="inline-flex rounded-pill bg-white px-3.5 py-1.5 text-caption font-medium text-terracotta">
              Urgent Enquiry
            </p>
            <Heading
              as="h2"
              size="h2-md"
              accent="a message"
              tone="terracotta"
              inline
              className="mt-4"
            >
              Send us
            </Heading>
            <p className="mt-4 text-lead text-muted">
              For urgent dental pain, call us directly or send a message and our team will respond
              as soon as possible.
            </p>

            <ul className="mt-8 space-y-3 text-body">
              <li className="text-fg">786 Leeds Road, Bradford, BD3 9TY</li>
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
                  href={`mailto:${PRACTICE_EMAIL}`}
                  className="inline-flex min-h-11 items-center text-fg underline underline-offset-4 t-colors hover:text-terracotta"
                >
                  {PRACTICE_EMAIL}
                </a>
              </li>
              <li className="text-small text-muted">{PRACTICE_HOURS}</li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <CallButton variant="default">Call us Now · {PRACTICE_PHONE}</CallButton>
              <BookButton variant="outline">Book Appointment</BookButton>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 md:p-[60px]">
            {submitted ? (
              <div className="max-w-[460px]">
                <Heading as="h3" size="h3-md">
                  Emergency Request Received
                </Heading>
                <p className="mt-3 text-body text-muted">
                  Thank you. Our team has received your message. If your pain or swelling is severe,
                  please call {PRACTICE_PHONE} straight away.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <CallButton variant="default">Call {PRACTICE_PHONE}</CallButton>
                  <Button type="button" variant="outline" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="em-name">Full Name</Label>
                    <Input
                      id="em-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="em-email">Email Address</Label>
                    <Input
                      id="em-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="em-subject">Subject</Label>
                    <Input id="em-subject" name="subject" placeholder="Subject" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="em-phone">Phone</Label>
                    <Input
                      id="em-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Phone"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="em-message">Your Message</Label>
                  <Textarea id="em-message" name="message" placeholder="Your Message" required />
                </div>

                {error ? (
                  <p role="alert" className="text-small font-medium text-danger">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" disabled={loading} className="h-12 w-full">
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
