import { Send, CheckCircle2, Phone, Clock, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PRACTICE_HOURS } from "@/lib/enquiry";
import { useEnquiry } from "@/lib/use-enquiry";

export function AestheticsSafety() {
  const enquiry = useEnquiry("Facial aesthetics");

  return (
    <section id="safety" className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          {/* Left: Consultation Info & Clinic Details */}
          <div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
              Book a Consultation
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#6b5848] leading-relaxed max-w-md">
              Ready to explore your aesthetic options? Meet with our medically qualified doctors for a private facial assessment and personalized treatment plan.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Phone, label: "0800 1938 786", sub: "Aesthetics consultation line" },
                { icon: MapPin, label: "786 Leeds Road, Bradford, BD3 9TY", sub: "Clinic location" },
                { icon: Clock, label: PRACTICE_HOURS, sub: "Opening hours" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3.5">
                  <Icon className="size-5 text-[#925a27] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#6b5848]">{sub}</p>
                    <p className="text-sm font-semibold text-[#2a1c12] mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6  ">
              <div className="flex items-start gap-3 text-xs text-[#6b5848] leading-relaxed">
                <ShieldCheck className="size-4 text-[#925a27] flex-shrink-0 mt-0.5" />
                <p>
                  Strict clinical governance · Allergan &amp; IBSA authentic products · Fully insured medical practitioners.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Solid Consultation Form Card */}
          <div className="bg-white rounded-xl   shadow-sm p-8">
            {enquiry.sent ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                  Consultation Request Sent!
                </h3>
                <p className="text-[#6b5848] text-sm max-w-sm">
                  Thank you for contacting Pav Dental Aesthetics. Our clinical coordinator will review your request and get in touch within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={enquiry.reset}
                  className="text-xs text-[#925a27] underline mt-2"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={enquiry.submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="aes-name" className="text-sm font-semibold text-[#2a1c12]">
                      Full Name
                    </Label>
                    <Input
                      id="aes-name"
                      name="name"
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="h-11 rounded-lg  bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aes-email" className="text-sm font-semibold text-[#2a1c12]">
                      Email Address
                    </Label>
                    <Input
                      id="aes-email"
                      name="email"
                      type="email"
                      placeholder="sarah@example.com"
                      required
                      className="h-11 rounded-lg  bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="aes-service" className="text-sm font-semibold text-[#2a1c12]">
                      Treatment of Interest
                    </Label>
                    <select
                      id="aes-service"
                      name="interest"
                      className="w-full h-11 rounded-lg   bg-white px-3 text-sm text-[#2a1c12] focus:outline-none focus:ring-2 focus:ring-[#cf9448]/30"
                    >
                      <option value="">Select a treatment…</option>
                      <option>Anti-Wrinkle Injections (Botox®)</option>
                      <option>Dermal Fillers (Lips / Cheeks)</option>
                      <option>Profhilo® Bio-Remodeling</option>
                      <option>Masseter Slimming / Bruxism</option>
                      <option>General Aesthetics Consultation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aes-phone" className="text-sm font-semibold text-[#2a1c12]">
                      Phone Number
                    </Label>
                    <Input
                      id="aes-phone"
                      name="phone"
                      type="tel"
                      placeholder="+44 7700 900555"
                      required
                      className="h-11 rounded-lg  bg-white focus-visible:ring-[#cf9448]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aes-message" className="text-sm font-semibold text-[#2a1c12]">
                    Your Aesthetic Goals &amp; Questions
                  </Label>
                  <Textarea
                    id="aes-message"
                    name="message"
                    placeholder="Tell us what areas you would like to enhance, refresh, or discuss with the doctor..."
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
                  {enquiry.sending ? "Sending…" : "Request Doctor Consultation"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
