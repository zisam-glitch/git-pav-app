import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquareText,
  Minus,
  Navigation,
  Phone,
  Plus,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const faqs = [
  {
    q: "What are your opening hours?",
    a: "Our Bradford clinic is open 7 days a week from 08:00 to 22:00, with 24/7 emergency dental cover available by calling 0800 1938 786.",
  },
  {
    q: "How do I book an appointment?",
    a: "You can book online via Setmore at any time, call our freephone helpline on 0800 1938 786, or message us on WhatsApp at +44 7311 871456.",
  },
  {
    q: "Do you accept walk-in patients?",
    a: "Yes, we welcome walk-in patients. Calling ahead on 0800 1938 786 or booking online helps minimise wait times and ensures a clinician is ready for you.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards as well as bank transfers. Please speak to our reception team if you would like to discuss treatment payment options.",
  },
  {
    q: "Is parking available at the clinic?",
    a: "Yes, we have free on-site parking with accessible spaces at 786 Leeds Road, Bradford, BD3 9TY, and nearby bus routes 72 and 73.",
  },
];

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    href: PRACTICE_PHONE_HREF,
    label: PRACTICE_PHONE,
    sub: "24/7 Freephone · Urgent & routine enquiries",
  },
  {
    icon: MessageSquareText,
    href: "https://wa.me/447311871456",
    label: "Whatsapp: +44 7311 871456",
    sub: "Message our reception team on WhatsApp",
    external: true,
  },
  {
    icon: Mail,
    href: "mailto:hello@pavdental.com",
    label: "hello@pavdental.com",
    sub: "Practice Manager & general enquiries",
  },
  {
    icon: MapPin,
    href: "https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY",
    label: "786 Leeds Road, Bradford, BD3 9TY",
    sub: "Free on-site parking",
    external: true,
  },
];

const INPUT_CLASS =
  "h-11 rounded-xl border border-black/10 bg-[#FAF8F2] text-sm text-black placeholder:text-black/45 focus:border-[#1B3745] focus:outline-none focus:ring-2 focus:ring-[#1B3745]/15";

export function ContactSection() {
  return (
    <>
      <ContactHero />
      <MapSection />
      <FaqSection />
      <CtaBanner />
    </>
  );
}

function ContactHero() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.forms.submitContact({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject.trim() || undefined,
        message: formData.message,
      });
      setSubmitted(true);
    } catch {
      setErrorMsg(
        "We could not send your message right now. Please call 0800 1938 786 or email hello@pavdental.com.",
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setFormData({ firstName: "", lastName: "", email: "", subject: "", phone: "", message: "" });
  };

  return (
    <section className="bg-[#FBF8F5] py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left column: headline + direct contact directory */}
          <div className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">
              Bradford Clinic
            </p>
            <h1 className="mt-3 font-display text-4xl font-normal leading-[1.06] tracking-[-0.04em] text-black sm:text-5xl lg:text-6xl">
              Contact <span className="text-[#754B3D]">Us</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-black/65">
              Email, call, or complete the form to learn how we can help you with your dental care
              needs.
            </p>

            {/* Quick actions */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  <Calendar className="size-4" aria-hidden="true" />
                  Book Appointment
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={PRACTICE_PHONE_HREF}>
                  <Phone className="size-4" aria-hidden="true" />
                  {PRACTICE_PHONE}
                </a>
              </Button>
            </div>

            {/* Contact directory */}
            <div className="mt-8 space-y-3">
              {CONTACT_CHANNELS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-4 rounded-[1.25rem] border border-black/6 bg-[#FAF8F2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F2EDE5] text-[#1B3745] transition-colors group-hover:bg-[#1B3745] group-hover:text-white">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-black group-hover:text-[#1B3745]">
                      {item.label}
                    </span>
                    <span className="block text-xs text-black/55">{item.sub}</span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1B3745]"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Right column: enquiry form card */}
          <div className="lg:col-span-7">
            <div className="rounded-[1.5rem] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-9">
              <h2 className="font-display text-2xl font-normal tracking-[-0.03em] text-black sm:text-3xl">
                Send us Message
              </h2>
              <p className="mt-1.5 text-sm text-black/60">
                You can reach us anytime — our Practice Manager and reception team respond promptly.
              </p>

              {submitted ? (
                <div className="mt-7 rounded-[1.25rem] border border-black/6 bg-[#FAF8F2] p-8 text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#1B3745] text-[#ECD880]">
                    <CheckCircle2 className="size-7" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-2xl font-normal tracking-[-0.025em] text-black">
                    Message Sent
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-black/65">
                    Thank you for reaching out. Our team has received your enquiry and will get back
                    to you shortly.
                  </p>
                  <Button onClick={reset} className="mt-6" size="sm">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {errorMsg && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-[#8A3A34]/20 bg-[#8A3A34]/8 p-3.5 text-sm text-[#8A3A34]"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-medium text-black/75">
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        required
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-medium text-black/75">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-black/75">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-medium text-black/75">
                        Phone
                      </Label>
                      <div className="flex gap-2">
                        <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[#FAF8F2] text-sm font-medium text-black/75">
                          +44
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="7311 871 456"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`${INPUT_CLASS} flex-1`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-medium text-black/75">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      placeholder="General enquiry, emergency care, or appointment question"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs font-medium text-black/75">
                      Your Message
                    </Label>
                    <Textarea
                      id="message"
                      required
                      rows={4}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="min-h-[7rem] rounded-xl border border-black/10 bg-[#FAF8F2] text-sm text-black placeholder:text-black/45 focus:border-[#1B3745] focus:outline-none focus:ring-2 focus:ring-[#1B3745]/15"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
                    {loading ? "Sending..." : "Send Message"}
                    <Send className="size-4" aria-hidden="true" />
                  </Button>

                  <p className="text-center text-xs leading-relaxed text-black/55">
                    By contacting us, you agree to our{" "}
                    <Link
                      to="/terms-and-condition"
                      className="font-medium text-[#754B3D] underline underline-offset-4 hover:text-[#1B3745]"
                    >
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="font-medium text-[#754B3D] underline underline-offset-4 hover:text-[#1B3745]"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section className="bg-[#FBF8F5] py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-t border-black/10 pt-14 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">Location</p>
            <h2 className="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
              Connecting <span className="text-[#754B3D]">Near and Far</span>
            </h2>
            <p className="mt-3 max-w-xl text-base text-black/65">
              Visit us at our clinic in Bradford — easily accessible with free on-site parking.
            </p>
          </div>
          <Button asChild variant="outline">
            <a
              href="https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-black/6 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
          <div className="h-72 w-full bg-[#FAF8F2] sm:h-[400px]">
            <iframe
              title="Pav Dental Bradford Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.4024254848316!2d-1.728923322964094!3d53.79978714088019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c6fcb3dc04b%3A0x7d6f51a7e4b9bbd0!2s786%20Leeds%20Rd%2C%20Bradford%20BD3%209TY%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-black/8 bg-[#FAF8F2] p-5 sm:grid-cols-3 sm:p-6">
            {[
              {
                icon: MapPin,
                label: "Clinic Address",
                title: "Pav Dental",
                sub: "786 Leeds Road, Bradford, BD3 9TY",
              },
              {
                icon: Clock,
                label: "Opening Hours",
                title: "Mon – Sun · 08:00 – 22:00",
                sub: "24/7 emergency dental cover",
              },
              {
                icon: Navigation,
                label: "Directions & Parking",
                title: "Easy Access",
                sub: "Free parking · Bus routes 72 & 73",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3.5 rounded-[1.25rem] border border-black/6 bg-white p-4"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F2EDE5] text-[#1B3745]">
                  <item.icon className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-black/50">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-black">{item.title}</p>
                  <p className="mt-0.5 text-xs text-black/60">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#FBF8F5] py-14 sm:py-20">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 border-t border-black/10 pt-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50">FAQ</p>
            <h2 className="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-4xl">
              Frequently Asked <span className="text-[#754B3D]">Questions</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-black/65">
              Quick answers about opening hours, appointments, walk-ins, and parking. Need
              immediate help? Call or email our team directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href={PRACTICE_PHONE_HREF}>
                  <Phone className="size-4" aria-hidden="true" />
                  Call {PRACTICE_PHONE}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:hello@pavdental.com">
                  <Mail className="size-4" aria-hidden="true" />
                  hello@pavdental.com
                </a>
              </Button>
            </div>
          </div>

          <div className="divide-y divide-black/10 border-y border-black/10 lg:col-span-7">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.q} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-display text-lg font-normal tracking-[-0.02em] text-black sm:text-xl">
                      {faq.q}
                    </span>
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F2EDE5] text-black transition-colors hover:bg-[#1B3745] hover:text-white"
                      aria-hidden="true"
                    >
                      {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-3 pr-10 text-sm leading-relaxed text-black/65 sm:text-base">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="bg-[#FBF8F5] py-10 sm:py-16">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] hims-navy-gradient px-6 py-12 text-center text-white sm:px-14 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-wider text-[#ECD880]">
            24/7 Bradford Practice
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
            Book your appointment today or speak directly with our Bradford reception team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <a href={PRACTICE_PHONE_HREF}>
                <Phone className="size-4" aria-hidden="true" />
                Call {PRACTICE_PHONE}
              </a>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a href={BOOKING_URL}>
                <Calendar className="size-4" aria-hidden="true" />
                Book Appointment
              </a>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a href="https://wa.me/447311871456" target="_blank" rel="noopener noreferrer">
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
