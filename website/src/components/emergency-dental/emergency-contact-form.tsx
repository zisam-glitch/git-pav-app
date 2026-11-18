import { useState } from "react";
import { Send, CheckCircle2, CalendarDays, PhoneCall, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";

export function EmergencyContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const subject = String(formData.get("subject") || "Emergency Dental Consultation Request").trim();
    const message = String(formData.get("message") || "").trim();

    try {
      await api.forms.submitContact({
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Could not submit your emergency request. Please call directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact-form" className="py-20 sm:py-28 bg-[#fffdf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2d4c0] bg-[#faf6f0] px-4 py-1.5 mb-3">
            <AlertTriangle className="size-3.5 text-[#925a27]" />
            <span className="text-xs font-bold uppercase text-[#925a27]">
              Immediate Attention
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#2a1c12]">
            Send us a <span className="text-[#925a27]">message</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#6b5848] max-w-lg mx-auto">
            Need an urgent appointment or advice? Fill in the form and our on-call dental coordinator will contact you immediately.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 sm:p-12 shadow-xl border border-[#e2d4c0]/80">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
              <CheckCircle2 className="size-16 text-emerald-600" />
              <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                Emergency Request Received!
              </h3>
              <p className="text-[#6b5848] text-sm max-w-md">
                Our on-call team has been alerted. We will call you within 15 minutes to confirm your slot and give you immediate pain relief advice.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-[#faf6f0] border border-[#e2d4c0] text-[#2a1c12] text-xs font-medium">
                If your condition is severe or rapidly deteriorating, please call directly on <strong>07311 871456</strong>.
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-[#925a27] underline mt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="em-name" className="text-sm font-semibold text-[#2a1c12]">
                    Full Name *
                  </Label>
                  <Input
                    id="em-name"
                    name="name"
                    placeholder="e.g. John Doe"
                    required
                    className="h-12 rounded-xl border-[#e2d4c0] bg-white focus-visible:ring-[#925a27]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em-email" className="text-sm font-semibold text-[#2a1c12]">
                    Email Address *
                  </Label>
                  <Input
                    id="em-email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="h-12 rounded-xl border-[#e2d4c0] bg-white focus-visible:ring-[#925a27]/30"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="em-subject" className="text-sm font-semibold text-[#2a1c12]">
                    Subject
                  </Label>
                  <Input
                    id="em-subject"
                    name="subject"
                    placeholder="e.g. Severe Toothache / Swelling"
                    className="h-12 rounded-xl border-[#e2d4c0] bg-white focus-visible:ring-[#925a27]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em-phone" className="text-sm font-semibold text-[#2a1c12]">
                    Phone Number *
                  </Label>
                  <Input
                    id="em-phone"
                    name="phone"
                    type="tel"
                    placeholder="+44 7700 900123"
                    required
                    className="h-12 rounded-xl border-[#e2d4c0] bg-white focus-visible:ring-[#925a27]/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="em-message" className="text-sm font-semibold text-[#2a1c12]">
                  Your Message (Describe pain, swelling or trauma) *
                </Label>
                <Textarea
                  id="em-message"
                  name="message"
                  placeholder="Please describe what happened, when the pain started, and any swelling or bleeding..."
                  className="min-h-32 rounded-xl border-[#e2d4c0] bg-white focus-visible:ring-[#925a27]/30 resize-none"
                  required
                />
              </div>

              {error && <p className="text-sm font-medium text-red-700">{error}</p>}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto accent-gradient rounded-full px-8 h-12 text-white font-bold shadow-md hover:opacity-95"
                >
                  <Send className="mr-2 size-4" />
                  {loading ? "Sending..." : "Send Message"}
                </Button>
                <a
                  href="tel:07311871456"
                  className="text-xs sm:text-sm font-bold text-red-600 hover:underline flex items-center gap-1.5"
                >
                  <PhoneCall className="size-4" />
                  Prefer to speak now? Call 07311 871456
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Big centered Book Appointment button at the bottom */}
        <div className="mt-12 text-center">
          <Button
            asChild
            className="accent-gradient rounded-full px-12 h-14 text-base text-white font-bold shadow-xl hover:opacity-95 transition-all"
          >
            <a href={BOOKING_URL}>
              <CalendarDays className="mr-2.5 size-5" />
              Book Appointment
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
