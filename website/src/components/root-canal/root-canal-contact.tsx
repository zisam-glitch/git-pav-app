import { Send, CheckCircle2, Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PRACTICE_HOURS, PRACTICE_PHONE } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function RootCanalContact() {
  const enquiry = useEnquiry("Root canal");

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#faf6f0] border-t border-[#e2d4c0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          {/* Left: Contact info */}
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
              Get in Touch
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#6b5848] leading-relaxed max-w-md">
              Have questions about tooth pain or need an emergency root canal assessment? Contact our specialist endodontic team today.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Phone, label: PRACTICE_PHONE, sub: "Emergency & enquiry line" },
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

          {/* Right: Solid white form card */}
          <div className="bg-white rounded-xl border border-[#e2d4c0] shadow-sm p-8">
            {enquiry.sent ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                  Message Received!
                </h3>
                <p className="text-[#6b5848] text-sm max-w-sm">
                  Thank you for contacting Pav Dental. Our endodontic clinical coordinator will review your symptoms and call you promptly.
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
                    <Label htmlFor="rc-name" className="text-sm font-semibold text-[#2a1c12]">
                      Full Name
                    </Label>
                    <Input
                      id="rc-name"
                      name="name"
                      placeholder="e.g. Robert Taylor"
                      required
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rc-email" className="text-sm font-semibold text-[#2a1c12]">
                      Email Address
                    </Label>
                    <Input
                      id="rc-email"
                      name="email"
                      type="email"
                      placeholder="robert@example.com"
                      required
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="rc-subject" className="text-sm font-semibold text-[#2a1c12]">
                      Subject
                    </Label>
                    <Input
                      id="rc-subject"
                      name="subject"
                      placeholder="Toothache / Root Canal Query"
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rc-phone" className="text-sm font-semibold text-[#2a1c12]">
                      Phone Number
                    </Label>
                    <Input
                      id="rc-phone"
                      name="phone"
                      type="tel"
                      placeholder="+44 7700 900786"
                      required
                      className="h-11 rounded-lg border-[#e2d4c0] bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rc-message" className="text-sm font-semibold text-[#2a1c12]">
                    Tooth Symptoms &amp; Details
                  </Label>
                  <Textarea
                    id="rc-message"
                    name="message"
                    placeholder="Describe the affected tooth, pain level, sensitivity to hot/cold, or duration..."
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
