import { CheckCircle2, PhoneCall, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function DenturesContact() {
  const enquiry = useEnquiry("Dentures");

  return (
    <section id="contact" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-16 sm:px-10 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Prosthetics enquiry
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Contact <span className="text-[#754B3D]">Us</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Have questions about our dentures or need a consultation? Contact our team below.
              </p>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-10">
              {enquiry.sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <CheckCircle2 className="size-12 text-[#1B3745]" />
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Denture Consultation Requested
                  </h3>
                  <p className="max-w-md text-sm text-black/65">
                    Thank you for contacting Pav Dental. Our coordinator will call you to arrange
                    your consultation or repair service.
                  </p>
                  <Button type="button" onClick={enquiry.reset} className="mt-2">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={enquiry.submit} className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="den-name">Full Name *</Label>
                      <Input id="den-name" name="name" placeholder="e.g. William Bennett" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="den-email">Email Address *</Label>
                      <Input
                        id="den-email"
                        name="email"
                        type="email"
                        placeholder="william@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="den-service">Denture Service Needed</Label>
                      <select
                        id="den-service"
                        name="interest"
                        className="h-11 w-full rounded-xl border border-black/12 bg-white px-3.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#1B3745]"
                      >
                        <option value="">Select a denture service…</option>
                        <option>Full Dentures (Upper / Lower)</option>
                        <option>Partial Dentures (Acrylic / Valplast)</option>
                        <option>Cobalt Chromium Dentures</option>
                        <option>Implant-Supported Dentures</option>
                        <option>Denture Repair / Reline</option>
                        <option>Home / Mobile Visit Inquiry</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="den-phone">Phone Number *</Label>
                      <Input
                        id="den-phone"
                        name="phone"
                        type="tel"
                        placeholder="+44 7700 900567"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="den-message">Your Message</Label>
                    <Textarea
                      id="den-message"
                      name="message"
                      placeholder="Tell us about your current dentures, fit, or what you are looking for..."
                      className="min-h-32 resize-none"
                      required
                    />
                  </div>

                  {enquiry.error && (
                    <p role="alert" className="text-sm font-medium text-[#8A3A34]">
                      {enquiry.error}
                    </p>
                  )}

                  <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                    <Button type="submit" size="lg" disabled={enquiry.sending} className="w-full sm:w-auto">
                      <Send className="size-4" />
                      {enquiry.sending ? "Sending…" : "Send Message"}
                    </Button>
                    <a
                      href={PRACTICE_PHONE_HREF}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#1B3745] hover:underline"
                    >
                      <PhoneCall className="size-4" />
                      Call Freephone: {PRACTICE_PHONE}
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
