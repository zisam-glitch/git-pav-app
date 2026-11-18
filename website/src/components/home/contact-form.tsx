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
    <section id="contact" className="py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="text-xs font-medium text-primary">Visit</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Get in touch</h2>
          <p className="mt-4 text-muted">
            786 Leeds Road, Bradford, BD3 9TY. Open 00:00–24:00, seven days.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            <li>
              <a className="text-fg hover:text-primary" href="tel:08001938786">
                0800 1938 786
              </a>
            </li>
            <li>
              <a className="text-fg hover:text-primary" href="tel:+447311871456">
                +44 7311 871456
              </a>
            </li>
            <li>
              <a className="text-fg hover:text-primary" href="mailto:hello@pavdental.com">
                hello@pavdental.com
              </a>
            </li>
          </ul>
          <p className="mt-8 text-sm text-muted">
            Founder & principal dentist — Dr Hassan Bhojani. Registered with the General Dental
            Council. Regulated by the Care Quality Commission.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {sent ? (
            <div className="rounded-xl   bg-white p-8 shadow-soft">
              <h3 className="font-display text-2xl">Message received</h3>
              <p className="mt-3 text-muted">
                Thank you. A member of the team will reply during clinic hours. For pain now, call
                the emergency line.
              </p>
              <Button className="mt-6" onClick={() => setSent(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5 rounded-xl   bg-white p-6 shadow-soft sm:p-8">
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
    </section>
  );
}
