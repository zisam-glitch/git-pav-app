import { Send, CheckCircle2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEnquiry } from "@/lib/use-enquiry";

export function DenturesContact() {
  const enquiry = useEnquiry("Dentures");

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Contact Us
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848] leading-relaxed">
            Have questions about our dentures or need a consultation? Contact our prosthetics team below.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-xl bg-white border border-[#e2d4c0] p-8 sm:p-12 shadow-sm">
          {enquiry.sent ? (
            <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
              <CheckCircle2 className="size-16 text-emerald-500" />
              <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                Denture Consultation Requested!
              </h3>
              <p className="text-[#6b5848] text-sm max-w-md">
                Thank you for contacting Pav Dental. Our prosthetics coordinator will call you to arrange your impression fitting or repair service.
              </p>
              <button
                type="button"
                onClick={enquiry.reset}
                className="text-xs text-[#925a27] underline mt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="den-name" className="text-sm font-semibold text-[#2a1c12]">
                    Full Name *
                  </Label>
                  <Input
                    id="den-name"
                    name="name"
                    placeholder="e.g. William Bennett"
                    required
                    className="h-12 rounded-xl border-[#e2d4c0] bg-white/70 focus-visible:ring-[#cf9448]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="den-email" className="text-sm font-semibold text-[#2a1c12]">
                    Email Address *
                  </Label>
                  <Input
                    id="den-email"
                    name="email"
                    type="email"
                    placeholder="william@example.com"
                    required
                    className="h-12 rounded-xl border-[#e2d4c0] bg-white/70 focus-visible:ring-[#cf9448]/30"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="den-service" className="text-sm font-semibold text-[#2a1c12]">
                    Denture Service Needed
                  </Label>
                  <select
                    id="den-service"
                    name="interest"
                    className="w-full h-12 rounded-xl border border-[#e2d4c0] bg-white/70 px-3 text-sm text-[#2a1c12] focus:outline-none focus:ring-2 focus:ring-[#cf9448]/30"
                  >
                    <option value="">Select a denture service…</option>
                    <option>Full Dentures (Upper / Lower)</option>
                    <option>Partial Dentures (Acrylic / Valplast)</option>
                    <option>Cobalt Chrome Metal Dentures</option>
                    <option>Implant-Retained Overdentures</option>
                    <option>Emergency Same-Day Denture Repair</option>
                    <option>Denture Reline / Adjustment</option>
                    <option>Home / Mobile Visit Inquiry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="den-phone" className="text-sm font-semibold text-[#2a1c12]">
                    Phone Number *
                  </Label>
                  <Input
                    id="den-phone"
                    name="phone"
                    type="tel"
                    placeholder="+44 7700 900567"
                    required
                    className="h-12 rounded-xl border-[#e2d4c0] bg-white/70 focus-visible:ring-[#cf9448]/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="den-message" className="text-sm font-semibold text-[#2a1c12]">
                  Your Message or Current Situation
                </Label>
                <Textarea
                  id="den-message"
                  name="message"
                  placeholder="Tell us about your current dentures, loose fit, missing teeth, or if you need an emergency repair..."
                  className="min-h-32 rounded-xl border-[#e2d4c0] bg-white/70 focus-visible:ring-[#cf9448]/30 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                {enquiry.error && (
                  <p role="alert" className="text-sm text-red-700">
                    {enquiry.error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={enquiry.sending}
                  className="w-full sm:w-auto accent-gradient rounded-full px-9 h-12 text-white font-bold shadow-md hover:opacity-95"
                >
                  <Send className="mr-2 size-4" />
                  {enquiry.sending ? "Sending…" : "Send Message"}
                </Button>
                <a
                  href="tel:08001938786"
                  className="text-xs sm:text-sm font-bold text-[#925a27] hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall className="size-4" />
                  Call Freephone: 0800 1938 786
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
