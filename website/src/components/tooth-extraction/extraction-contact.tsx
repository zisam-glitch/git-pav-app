import { Send, CheckCircle2, Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PRACTICE_HOURS } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function ExtractionContact() {
  const enquiry = useEnquiry("Tooth extraction");

  return (
    <section className="py-20 sm:py-28 bg-[#faf6f0] border-t border-[#e2d4c0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          {/* Left — contact info */}
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
              Get in Touch
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#6b5848] leading-relaxed max-w-md">
              Have a question about same-day tooth extraction? Contact us below
              and get a response fast.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Phone, label: "0800 1938 786", sub: "24h emergency line" },
                { icon: MapPin, label: "786 Leeds Road, Bradford, BD3 9TY", sub: "Clinic address" },
                { icon: Clock, label: PRACTICE_HOURS, sub: "Opening hours" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-white border border-[#e2d4c0] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="size-4 text-[#925a27]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6b5848]">{sub}</p>
                    <p className="text-sm font-semibold text-[#2a1c12] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-xl border border-[#e2d4c0] shadow-sm p-8">
            {enquiry.sent ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                  Message Sent!
                </h3>
                <p className="text-[#6b5848] text-sm max-w-sm">
                  Thank you for contacting Pav Dental. Our surgical coordinator will be in touch shortly.
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
              <form onSubmit={enquiry.submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="te-name" className="text-sm font-semibold text-[#2a1c12]">
                      Full Name
                    </Label>
                    <Input
                      id="te-name"
                      name="name"
                      placeholder="e.g. John Doe"
                      required
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="te-email" className="text-sm font-semibold text-[#2a1c12]">
                      Email Address
                    </Label>
                    <Input
                      id="te-email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="te-subject" className="text-sm font-semibold text-[#2a1c12]">
                      Subject
                    </Label>
                    <Input
                      id="te-subject"
                      name="subject"
                      placeholder="Emergency Extraction Query"
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="te-phone" className="text-sm font-semibold text-[#2a1c12]">
                      Phone
                    </Label>
                    <Input
                      id="te-phone"
                      name="phone"
                      type="tel"
                      placeholder="+44 7700 900077"
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="te-message" className="text-sm font-semibold text-[#2a1c12]">
                    Your Message
                  </Label>
                  <Textarea
                    id="te-message"
                    name="message"
                    placeholder="Tell us about the tooth causing discomfort, swelling, or pain level..."
                    className="min-h-28 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30 resize-none"
                    required
                  />
                </div>

                {enquiry.error && (
                  <p role="alert" className="text-sm text-red-700">
                    {enquiry.error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={enquiry.sending}
                  className="accent-gradient rounded-full px-8 h-11 text-white font-bold shadow-sm hover:opacity-95 transition-opacity"
                >
                  <Send className="mr-2 size-4" />
                  {enquiry.sending ? "Sending…" : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
