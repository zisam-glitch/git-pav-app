import { CheckCircle2, Clock, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRACTICE_HOURS } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function AestheticsSafety() {
  const enquiry = useEnquiry("Facial aesthetics");

  return (
    <section id="safety" className="py-10 sm:py-14">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto grid max-w-[87rem] items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Private assessment
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Enquire about aesthetics
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-black/65">
                Ready to explore your aesthetic options? Meet with our clinicians for a private
                facial assessment and personalized treatment plan.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Phone, label: "0800 1938 786", sub: "Aesthetics consultation line" },
                  { icon: MapPin, label: "786 Leeds Road, Bradford, BD3 9TY", sub: "Clinic location" },
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

              <div className="mt-8 flex items-start gap-3 border-t border-black/8 pt-6 text-xs text-black/60">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#1B3745]" />
                <p>
                  Care Quality Commission regulated clinic · Strictly 18+ · GDC-registered dental
                  clinicians.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
              {enquiry.sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <CheckCircle2 className="size-12 text-[#1B3745]" />
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Consultation request sent
                  </h3>
                  <p className="max-w-sm text-sm text-black/65">
                    Thank you for contacting Pav Dental Aesthetics. Our clinical coordinator will
                    respond shortly.
                  </p>
                  <Button variant="outline" size="sm" onClick={enquiry.reset}>
                    Send another request
                  </Button>
                </div>
              ) : (
                <form onSubmit={enquiry.submit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="aes-name">Full Name</Label>
                      <Input id="aes-name" name="name" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aes-email">Email Address</Label>
                      <Input
                        id="aes-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="aes-service">Treatment of Interest</Label>
                      <select
                        id="aes-service"
                        name="interest"
                        className="h-11 w-full rounded-[1rem] border border-black/12 bg-white px-3.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#1B3745]"
                      >
                        <option value="">Select a treatment…</option>
                        <option>Botox</option>
                        <option>Dermal Fillers</option>
                        <option>Lip Enhancement</option>
                        <option>Microneedling</option>
                        <option>Chemical Peels</option>
                        <option>Profhilo / Skin Booster</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aes-phone">Phone Number</Label>
                      <Input id="aes-phone" name="phone" type="tel" placeholder="+44" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aes-message">Your Aesthetic Goals &amp; Questions</Label>
                    <Textarea
                      id="aes-message"
                      name="message"
                      placeholder="Tell us what you would like to discuss..."
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
