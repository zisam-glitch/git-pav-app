import { CheckCircle2, PhoneCall, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function MobileDentistryContact() {
  const enquiry = useEnquiry("Mobile dentistry");

  return (
    <section id="contact" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-16 sm:px-10 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Home &amp; care home visits
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Get In <span className="text-[#754B3D]">Touch</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-black/65">
                Have questions about our mobile dental services? Contact us today to discuss your
                needs or arrange a visit.
              </p>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-10">
              {enquiry.sent ? (
                <div role="status" className="flex flex-col items-center py-10 text-center">
                  <CheckCircle2 className="size-12 text-[#1B3745]" />
                  <h3 className="mt-4 font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Message received
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-black/65">
                    Thank you. Your message has reached the practice, and the team will get back to
                    you.
                  </p>
                  <Button type="button" onClick={enquiry.reset} className="mt-6">
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={enquiry.submit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="resize-none"
                      placeholder="Tell us about your dental care needs..."
                      required
                    />
                  </div>

                  {enquiry.error && (
                    <p role="alert" className="text-sm font-medium text-[#8A3A34]">
                      {enquiry.error}
                    </p>
                  )}

                  <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={enquiry.sending}
                      className="w-full sm:w-auto"
                    >
                      <Send className="size-4" />
                      {enquiry.sending ? "Sending…" : "Send Message"}
                    </Button>
                    <a
                      href={PRACTICE_PHONE_HREF}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#1B3745] hover:underline"
                    >
                      <PhoneCall className="size-4" />
                      {PRACTICE_PHONE}
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
