import { CheckCircle2, Clock, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_HOURS } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function CosmeticContact() {
  const enquiry = useEnquiry("Cosmetic dentistry");

  return (
    <section id="contact" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto grid max-w-[87rem] items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">Visit</p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Get in touch
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
                Ready to take control of your dental health? Contact us to discuss your cosmetic
                dentistry options in Bradford.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Phone, label: "0800 1938 786", sub: "Clinic consultation line" },
                  { icon: MapPin, label: "786 Leeds Road, Bradford, BD3 9TY", sub: "Practice address" },
                  { icon: Clock, label: PRACTICE_HOURS, sub: "Opening hours" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-black/6 bg-white text-[#1B3745]">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs text-black/55">{sub}</p>
                      <p className="mt-0.5 text-sm font-medium text-black">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
              {enquiry.sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <CheckCircle2 className="size-12 text-[#1B3745]" />
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Enquiry received
                  </h3>
                  <p className="max-w-sm text-sm text-black/65">
                    Thank you for contacting Pav Dental. A member of our team will respond during
                    clinic hours.
                  </p>
                  <Button variant="outline" size="sm" onClick={enquiry.reset}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={enquiry.submit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cos-name">Full Name</Label>
                      <Input id="cos-name" name="name" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cos-email">Email Address</Label>
                      <Input
                        id="cos-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cos-service">Procedure of Interest</Label>
                      <select
                        id="cos-service"
                        name="interest"
                        className="h-11 w-full rounded-[1rem] border border-black/12 bg-white px-3.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#1B3745]"
                      >
                        <option value="">Select a procedure…</option>
                        <option>Porcelain Veneers</option>
                        <option>Dental Bonding</option>
                        <option>Dental Implants</option>
                        <option>Teeth Whitening</option>
                        <option>Tooth Contouring</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cos-phone">Phone Number</Label>
                      <Input id="cos-phone" name="phone" type="tel" placeholder="+44" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cos-message">Your Message</Label>
                    <Textarea
                      id="cos-message"
                      name="message"
                      placeholder="How can we help with your smile?"
                      required
                    />
                  </div>

                  {enquiry.error && (
                    <p role="alert" className="text-sm text-[#8A3A34]">
                      {enquiry.error}
                    </p>
                  )}
                  <Button type="submit" disabled={enquiry.sending} size="lg">
                    <Send className="size-4" />
                    {enquiry.sending ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
