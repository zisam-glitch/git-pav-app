import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "./reveal";
import { api } from "@/lib/api";

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
    } catch (err: any) {
      setError(err?.message || "Could not submit your message. Please try again or call our clinic directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-16 sm:px-10 sm:py-24">
          <div className="mx-auto grid max-w-[87rem] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">Visit</p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Get in touch
              </h2>
              <p className="mt-4 text-base text-black/65">
                786 Leeds Road, Bradford, BD3 9TY. Open 00:00–24:00, seven days.
              </p>
              <ul className="mt-8 space-y-3 text-sm font-medium">
                <li>
                  <a className="text-black hover:text-[#1B3745]" href="tel:08001938786">
                    0800 1938 786
                  </a>
                </li>
                <li>
                  <a className="text-black hover:text-[#1B3745]" href="tel:+447311871456">
                    +44 7311 871456
                  </a>
                </li>
                <li>
                  <a className="text-black hover:text-[#1B3745]" href="mailto:hello@pavdental.com">
                    hello@pavdental.com
                  </a>
                </li>
              </ul>
              <p className="mt-8 text-sm leading-relaxed text-black/55">
                Founder & principal dentist — Dr Hassan Bhojani. Registered with the General Dental
                Council. Regulated by the Care Quality Commission.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              {sent ? (
                <div className="rounded-[1.5rem] bg-white p-8 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Message received
                  </h3>
                  <p className="mt-3 text-black/65">
                    Thank you. A member of the team will reply during clinic hours. For pain now, call
                    the emergency line.
                  </p>
                  <Button className="mt-6" onClick={() => setSent(false)}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="grid gap-5 rounded-[1.5rem] bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" name="name" autoComplete="name" required placeholder="Jane Doe" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
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
                      <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+44" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" placeholder="Check-up / emergency" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" required placeholder="How can we help?" />
                  </div>
                  {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                    {loading ? "Sending..." : "Send message"}
                  </Button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
