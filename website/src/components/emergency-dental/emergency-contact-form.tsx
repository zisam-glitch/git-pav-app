import { useState } from "react";
import { CalendarDays, CheckCircle2, PhoneCall, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { BOOKING_URL, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

export function EmergencyContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const subject = String(formData.get("subject") || "Emergency Dental Consultation Request").trim();
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
    } catch (err: any) {
      setError(err?.message || "Could not submit your emergency request. Please call directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact-form" className="py-10 sm:py-16">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-[#8A3A34]">
                Urgent enquiry
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Send us a <span className="text-[#754B3D]">message</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-black/65">
                Need an urgent appointment or advice? Fill in the form or call our team directly on
                0800 1938 786.
              </p>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-10">
              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <CheckCircle2 className="size-12 text-[#1B3745]" />
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Emergency request received
                  </h3>
                  <p className="max-w-md text-sm text-black/65">
                    Our team has received your message and will contact you promptly. For immediate
                    assistance, call{" "}
                    <a href={PRACTICE_PHONE_HREF} className="font-medium text-[#1B3745] underline">
                      0800 1938 786
                    </a>
                    .
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="em-name">Full Name *</Label>
                      <Input id="em-name" name="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="em-email">Email Address *</Label>
                      <Input
                        id="em-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="em-subject">Subject</Label>
                      <Input
                        id="em-subject"
                        name="subject"
                        placeholder="e.g. Severe Toothache / Swelling"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="em-phone">Phone Number *</Label>
                      <Input id="em-phone" name="phone" type="tel" placeholder="+44" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="em-message">
                      Your Message (Describe pain, swelling or trauma) *
                    </Label>
                    <Textarea
                      id="em-message"
                      name="message"
                      placeholder="Please describe what happened, when the pain started, and any swelling or bleeding..."
                      required
                    />
                  </div>

                  {error && <p className="text-sm font-medium text-[#8A3A34]">{error}</p>}

                  <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                    <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
                      <Send className="size-4" />
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                    <a
                      href={PRACTICE_PHONE_HREF}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8A3A34] hover:underline"
                    >
                      <PhoneCall className="size-4" />
                      Prefer to speak now? Call 0800 1938 786
                    </a>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-10 text-center">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  <CalendarDays className="size-4" />
                  Book Appointment
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
