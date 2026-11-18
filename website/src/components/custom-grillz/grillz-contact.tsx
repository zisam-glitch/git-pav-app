import { CheckCircle2, PhoneCall, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEnquiry } from "@/lib/use-enquiry";

export function GrillzContact() {
  const enquiry = useEnquiry("Custom grillz");

  return (
    <section id="contact" className="py-14 sm:py-20">
      <div className="mx-auto max-w-[108rem] px-2 sm:px-4">
        <div className="rounded-[1.5rem] bg-[#F2EDE5] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                Design enquiry
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
                Get in touch
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-black/65">
                Ready to create your signature grillz? Send your design ideas and our team will
                help you plan your consultation.
              </p>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-10">
              {enquiry.sent ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <CheckCircle2 className="size-12 text-[#1B3745]" />
                  <h3 className="font-display text-2xl font-normal tracking-[-0.03em] text-black">
                    Grillz request received
                  </h3>
                  <p className="max-w-md text-sm text-black/65">
                    Thank you for your design inquiry. Our specialist will review your
                    specifications and contact you to arrange your impression appointment.
                  </p>
                  <Button variant="outline" size="sm" onClick={enquiry.reset}>
                    Send another inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={enquiry.submit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="gz-name">Full Name *</Label>
                      <Input id="gz-name" name="name" placeholder="Marcus Vance" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gz-email">Email Address *</Label>
                      <Input
                        id="gz-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="gz-style">Style / Tooth Placement</Label>
                      <select
                        id="gz-style"
                        name="interest"
                        className="h-11 w-full rounded-[1rem] border border-black/12 bg-white px-3.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#1B3745]"
                      >
                        <option value="">Select style / placement…</option>
                        <option>Single Tooth Cap</option>
                        <option>Canine / Vampire Fangs (Pair)</option>
                        <option>Open-Face Window Cap</option>
                        <option>Top 6 Teeth (Canine to Canine)</option>
                        <option>Bottom 6 Teeth</option>
                        <option>Full Top &amp; Bottom Set (12 Teeth)</option>
                        <option>Fully Iced-Out VVS Diamond Set</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gz-metal">Metal / Gold Preference</Label>
                      <select
                        id="gz-metal"
                        name="interest2"
                        className="h-11 w-full rounded-[1rem] border border-black/12 bg-white px-3.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#1B3745]"
                      >
                        <option value="">Select metal…</option>
                        <option>10k Yellow Gold</option>
                        <option>14k Yellow Gold</option>
                        <option>14k White / Rose Gold</option>
                        <option>18k Yellow / White Gold</option>
                        <option>Silver</option>
                        <option>Unsure / Want Advice</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gz-phone">Phone Number *</Label>
                    <Input id="gz-phone" name="phone" type="tel" placeholder="+44" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gz-message">Describe Your Design</Label>
                    <Textarea
                      id="gz-message"
                      name="message"
                      placeholder="Tell us about diamond placement, perm-cut grooves, or upcoming events..."
                      required
                    />
                  </div>

                  {enquiry.error && (
                    <p role="alert" className="text-sm text-[#8A3A34]">
                      {enquiry.error}
                    </p>
                  )}

                  <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                    <Button type="submit" disabled={enquiry.sending} size="lg">
                      <Send className="size-4" />
                      {enquiry.sending ? "Sending…" : "Send Design Request"}
                    </Button>
                    <a
                      href="tel:08001938786"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B3745] hover:underline"
                    >
                      <PhoneCall className="size-4" />
                      Call Freephone: 0800 1938 786
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
