import { Send, CheckCircle2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEnquiry } from "@/lib/use-enquiry";

export function GrillzContact() {
  const enquiry = useEnquiry("Custom grillz");

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#fffdf9] border-b border-[#e8ddd0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12]">
            Get In Touch
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848] max-w-xl mx-auto leading-relaxed">
            Ready to craft your bespoke gold or diamond grill? Send your design ideas and we'll reply with a preliminary quote.
          </p>
        </div>

        <div className="rounded-xl bg-white border border-[#e2d4c0] p-8 sm:p-12 shadow-sm">
          {enquiry.sent ? (
            <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
              <CheckCircle2 className="size-16 text-emerald-500" />
              <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                Grillz Request Received!
              </h3>
              <p className="text-[#6b5848] text-sm max-w-md">
                Thank you for your design inquiry. Our custom dental jewelry specialist will review your specifications and call you to book your in-clinic impression appointment.
              </p>
              <button
                type="button"
                onClick={enquiry.reset}
                className="text-xs text-[#925a27] underline mt-2"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={enquiry.submit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gz-name" className="text-sm font-semibold text-[#2a1c12]">
                    Full Name *
                  </Label>
                  <Input
                    id="gz-name"
                    name="name"
                    placeholder="e.g. Marcus Vance"
                    required
                    className="h-12 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gz-email" className="text-sm font-semibold text-[#2a1c12]">
                    Email Address *
                  </Label>
                  <Input
                    id="gz-email"
                    name="email"
                    type="email"
                    placeholder="marcus@example.com"
                    required
                    className="h-12 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gz-style" className="text-sm font-semibold text-[#2a1c12]">
                    Style / Tooth Placement
                  </Label>
                  <select
                    id="gz-style"
                    name="interest"
                    className="w-full h-12 rounded-lg border border-[#e2d4c0] bg-white px-3 text-sm text-[#2a1c12] focus:outline-none focus:ring-2 focus:ring-[#cf9448]/30 appearance-none"
                  >
                    <option value="">Select style / placement…</option>
                    <option>Single Tooth Cap</option>
                    <option>Canine / Vampire Fangs (Pair)</option>
                    <option>Open-Face Window Cap</option>
                    <option>Top 6 Teeth (Canine to Canine)</option>
                    <option>Bottom 6 Teeth</option>
                    <option>Full Top &amp; Bottom Set (12 Teeth)</option>
                    <option>Fully Iced-Out VVS Diamond Set</option>
                    <option>Custom Concept / Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gz-metal" className="text-sm font-semibold text-[#2a1c12]">
                    Gold Alloy Preference
                  </Label>
                  <select
                    id="gz-metal"
                    name="interest2"
                    className="w-full h-12 rounded-lg border border-[#e2d4c0] bg-white px-3 text-sm text-[#2a1c12] focus:outline-none focus:ring-2 focus:ring-[#cf9448]/30 appearance-none"
                  >
                    <option value="">Select gold purity…</option>
                    <option>10k Yellow Gold</option>
                    <option>10k White Gold</option>
                    <option>14k Yellow Gold (Most Popular)</option>
                    <option>14k Rose Gold</option>
                    <option>14k White Gold</option>
                    <option>18k Yellow Gold (High Purity)</option>
                    <option>18k White Gold</option>
                    <option>Unsure / Want Advice</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gz-phone" className="text-sm font-semibold text-[#2a1c12]">
                  Phone Number *
                </Label>
                <Input
                  id="gz-phone"
                  name="phone"
                  type="tel"
                  placeholder="+44 7700 900890"
                  required
                  className="h-12 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gz-message" className="text-sm font-semibold text-[#2a1c12]">
                  Describe Your Design / Special Requests
                </Label>
                <Textarea
                  id="gz-message"
                  name="message"
                  placeholder="Tell us about specific engravings, diamond placement, perm-cut grooves, or upcoming events/deadlines..."
                  className="min-h-32 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30 resize-none"
                  required
                />
              </div>

              <div className="pt-2 space-y-3">
                {enquiry.error && (
                  <p role="alert" className="text-sm text-red-700">
                    {enquiry.error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={enquiry.sending}
                  className="w-full accent-gradient rounded-full px-9 h-12 text-white font-bold shadow-sm hover:opacity-95"
                >
                  <Send className="mr-2 size-4" />
                  {enquiry.sending ? "Sending…" : "Send Design Request"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-[#9a8674] mb-6">
            Prefer to call us directly? Our team is available to discuss your design requirements.
          </p>
          <a
            href="tel:08001938786"
            className="text-sm font-bold text-[#925a27] hover:underline flex items-center justify-center gap-1.5"
          >
            <PhoneCall className="size-4" />
            Call Freephone: 0800 1938 786
          </a>
        </div>
      </div>
    </section>
  );
}
