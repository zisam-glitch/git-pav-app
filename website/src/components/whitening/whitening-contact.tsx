import React, { useState } from "react";
import { CalendarDays, CheckCircle2, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function WhiteningContact() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState("Custom Home Suite (£295)");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact-booking" className="py-20 sm:py-28 bg-[#faf6f0] border-t border-[#e2d4c0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-start">
          {/* Left: Info & Clinic Hours */}
          <div>
            <span className="text-xs font-bold uppercase text-[#925a27] bg-white border border-[#e2d4c0] px-4 py-1.5 rounded-full inline-block mb-3">
              Consultation &amp; Prescriptions
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#2a1c12] leading-tight">
              Ready for a Whiter, Healthier Smile?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#6b5848] leading-relaxed max-w-md">
              Complete the form to schedule your dental shade assessment and 3D intraoral scan. Our clinical team in Bradford will contact you within 24 hours.
            </p>

            {/* Contact details with crisp rounded-lg */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-[#e2d4c0] shadow-sm max-w-md">
                <div className="size-10 rounded-lg bg-[#faf6f0] text-[#925a27] flex items-center justify-center font-bold">
                  <Phone className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-[#6b5848]">Direct Telephone</p>
                  <p className="text-sm font-bold text-[#2a1c12]">01274 123 456</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-[#e2d4c0] shadow-sm max-w-md">
                <div className="size-10 rounded-lg bg-[#faf6f0] text-[#925a27] flex items-center justify-center font-bold">
                  <Mail className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-[#6b5848]">Clinical Enquiries</p>
                  <p className="text-sm font-bold text-[#2a1c12]">whitening@pavdental.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-[#e2d4c0] shadow-sm max-w-md">
                <div className="size-10 rounded-lg bg-[#faf6f0] text-[#925a27] flex items-center justify-center font-bold">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-[#6b5848]">Practice Hours</p>
                  <p className="text-sm font-bold text-[#2a1c12]">Mon–Fri 8:30am – 6:00pm &bull; Sat by Appt</p>
                </div>
              </div>
            </div>

            {/* Direct Booking Solid Card with crisp rounded-xl */}
            <div className="mt-8 p-6 rounded-xl bg-[#2a1c12] text-white border border-[#3d2a1d] shadow-md max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <CalendarDays className="size-6 text-[#cf9448]" />
                <h3 className="font-display text-xl font-bold">Priority Online Booking</h3>
              </div>
              <p className="text-white/70 text-xs sm:text-sm mb-5 leading-relaxed">
                Choose your preferred clinic appointment date directly for same-day shade impressions.
              </p>
              <Button
                asChild
                className="accent-gradient rounded-full px-7 h-11 text-white font-bold hover:opacity-95 shadow-sm text-xs sm:text-sm w-full"
              >
                <a href="/contact-us">Book Clinic Appointment Online</a>
              </Button>
            </div>
          </div>

          {/* Right: Solid Form Card (Crisp rounded-xl, No Glass) */}
          <div className="bg-white rounded-xl p-8 sm:p-10 shadow-sm border border-[#e2d4c0]">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="size-10" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                  Assessment Request Received
                </h3>
                <p className="text-[#6b5848] text-sm max-w-sm leading-relaxed">
                  Thank you for reaching out. One of our whitening coordinators will review your preferences and contact you within 24 hours.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="rounded-full border-[#925a27] text-[#925a27] font-semibold text-xs mt-2"
                >
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-[#2a1c12]">
                    Book Your Whitening Assessment
                  </h3>
                  <p className="text-xs text-[#6b5848] mt-1">
                    Free clinical review included with all treatment suites.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="wc-name" className="text-xs font-bold text-[#2a1c12]">
                        Full Name
                      </Label>
                      <Input
                        id="wc-name"
                        required
                        placeholder="e.g. Eleanor Vance"
                        className="rounded-lg border-[#e2d4c0] bg-[#faf6f0] focus:bg-white text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="wc-phone" className="text-xs font-bold text-[#2a1c12]">
                        Phone Number
                      </Label>
                      <Input
                        id="wc-phone"
                        type="tel"
                        required
                        placeholder="07123 456 789"
                        className="rounded-lg border-[#e2d4c0] bg-[#faf6f0] focus:bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="wc-email" className="text-xs font-bold text-[#2a1c12]">
                      Email Address
                    </Label>
                    <Input
                      id="wc-email"
                      type="email"
                      required
                      placeholder="eleanor@example.co.uk"
                      className="rounded-lg border-[#e2d4c0] bg-[#faf6f0] focus:bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-[#2a1c12]">
                      Target Whitening Treatment
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        "Whitening Strips (£25)",
                        "Custom Home Suite (£295)",
                        "Home UV LED Kit (£99)",
                      ].map((pkg) => (
                        <button
                          type="button"
                          key={pkg}
                          onClick={() => setSelectedSystem(pkg)}
                          className={`p-2.5 rounded-lg text-left border text-xs font-semibold transition-colors ${
                            selectedSystem === pkg
                              ? "border-[#925a27] bg-[#faf6f0] text-[#925a27] font-bold"
                              : "border-[#e2d4c0] bg-white text-[#6b5848] hover:border-[#925a27]"
                          }`}
                        >
                          {pkg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="wc-notes" className="text-xs font-bold text-[#2a1c12]">
                      Additional Notes / Existing Dental Work (Optional)
                    </Label>
                    <Textarea
                      id="wc-notes"
                      rows={3}
                      placeholder="Let us know if you have veneers, crowns, sensitive teeth, or an event date..."
                      className="rounded-lg border-[#e2d4c0] bg-[#faf6f0] focus:bg-white text-sm resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full accent-gradient text-white rounded-full h-12 text-sm font-bold shadow-sm hover:opacity-95 mt-2"
                  >
                    Submit Whitening Consultation Request <ArrowRight className="ml-2 size-4" />
                  </Button>

                  <p className="text-[11px] text-[#6b5848] text-center mt-2">
                    Your details are protected under UK GDPR &bull; No spam guaranteed.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
