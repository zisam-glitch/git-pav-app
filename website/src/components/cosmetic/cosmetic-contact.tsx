import { Send, CheckCircle2, Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PRACTICE_HOURS } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function CosmeticContact() {
  const enquiry = useEnquiry("Cosmetic dentistry");

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#faf6f0]  ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          {/* Left: Contact info */}
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
              Get in Touch
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#6b5848] leading-relaxed max-w-md">
              Ready to explore your options? Contact our smile design team today and receive a tailored consultation plan within 24 hours.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Phone, label: "0800 1938 786", sub: "Clinic consultation line" },
                { icon: MapPin, label: "786 Leeds Road, Bradford, BD3 9TY", sub: "Practice address" },
                { icon: Clock, label: PRACTICE_HOURS, sub: "Opening hours" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-white   flex items-center justify-center flex-shrink-0 shadow-sm">
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
          <div className="bg-white rounded-xl   shadow-sm p-8">
            {enquiry.sent ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                  Consultation Request Received!
                </h3>
                <p className="text-[#6b5848] text-sm max-w-sm">
                  Thank you for contacting Pav Dental. Our smile design coordinator will be in touch shortly.
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
                    <Label htmlFor="cos-name" className="text-sm font-semibold text-[#2a1c12]">
                      Full Name
                    </Label>
                    <Input
                      id="cos-name"
                      name="name"
                      placeholder="e.g. Jessica Smith"
                      required
                      className="h-11 rounded-lg  bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cos-email" className="text-sm font-semibold text-[#2a1c12]">
                      Email Address
                    </Label>
                    <Input
                      id="cos-email"
                      name="email"
                      type="email"
                      placeholder="jessica@example.com"
                      required
                      className="h-11 rounded-lg  bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="cos-service" className="text-sm font-semibold text-[#2a1c12]">
                      Procedure of Interest
                    </Label>
                    <select
                      id="cos-service"
                      name="interest"
                      className="w-full h-11 rounded-lg   bg-white px-3 text-sm text-[#2a1c12] focus:outline-none focus:ring-2 focus:ring-[#cf9448]/30"
                    >
                      <option value="">Select a procedure…</option>
                      <option>Porcelain Veneers</option>
                      <option>Composite Bonding</option>
                      <option>Dental Implants</option>
                      <option>Full Smile Makeover</option>
                      <option>General Aesthetic Consultation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cos-phone" className="text-sm font-semibold text-[#2a1c12]">
                      Phone Number
                    </Label>
                    <Input
                      id="cos-phone"
                      name="phone"
                      type="tel"
                      placeholder="+44 7700 900456"
                      required
                      className="h-11 rounded-lg  bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cos-message" className="text-sm font-semibold text-[#2a1c12]">
                    Your Goals &amp; Questions
                  </Label>
                  <Textarea
                    id="cos-message"
                    name="message"
                    placeholder="Tell us what you would love to improve about your smile (e.g. gaps, shade, chipped edges)..."
                    className="min-h-28 rounded-lg  bg-white focus-visible:ring-[#cf9448]/30 resize-none"
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
                  {enquiry.sending ? "Sending…" : "Send Consultation Request"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
