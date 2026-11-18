import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquareText,
  Navigation,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";

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
    href: "tel:08001938786",
    label: "0800 1938 786",
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
    <section className="bg-[#faf6f0] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left column: headline + direct contact directory */}
          <div className="lg:col-span-5">
            <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Email, call, or complete the form to learn how we can help you with your dental care
              needs.
            </p>

            {/* Quick actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={BOOKING_URL}>
                  <Calendar className="size-4" />
                  Book Appointment
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white hover:bg-[#f0e7da]">
                <a href="tel:08001938786">
                  <Phone className="size-4" />
                  0800 1938 786
                </a>
              </Button>
            </div>

            {/* Borderless contact directory */}
            <div className="mt-8 space-y-2.5">
              {CONTACT_CHANNELS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-4 rounded-xl bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#faf6f0] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <item.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-fg group-hover:text-primary">
                      {item.label}
                    </span>
                    <span className="block text-xs text-muted">{item.sub}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Right column: borderless elevated enquiry form card */}
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-white p-6 shadow-soft sm:p-9">
              <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">
                Send us Message
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                You can reach us anytime — our Practice Manager and reception team respond promptly.
              </p>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-7 rounded-xl bg-[#faf6f0] p-8 text-center"
                  >
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary text-white">
                      <CheckCircle2 className="size-7" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-fg">Message Sent</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                      Thank you for reaching out. Our team has received your enquiry and will get
                      back to you shortly.
                    </p>
                    <Button onClick={reset} className="mt-6" size="sm">
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {errorMsg && (
                      <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-lg bg-[#fef2f2] p-3.5 text-sm text-danger"
                      >
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-xs font-semibold text-fg">
                          First name
                        </Label>
                        <Input
                          id="firstName"
                          required
                          placeholder="Jane"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          className="h-11 rounded-lg border-0 bg-[#faf6f0] text-sm text-fg placeholder:text-subtle"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-xs font-semibold text-fg">
                          Last name
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          className="h-11 rounded-lg border-0 bg-[#faf6f0] text-sm text-fg placeholder:text-subtle"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold text-fg">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-11 rounded-lg border-0 bg-[#faf6f0] text-sm text-fg placeholder:text-subtle"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-semibold text-fg">
                          Phone
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-[#faf6f0] text-sm font-medium text-fg">
                            +44
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="7311 871 456"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-11 flex-1 rounded-lg border-0 bg-[#faf6f0] text-sm text-fg placeholder:text-subtle"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-xs font-semibold text-fg">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        placeholder="General enquiry, emergency care, or appointment question"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="h-11 rounded-lg border-0 bg-[#faf6f0] text-sm text-fg placeholder:text-subtle"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-xs font-semibold text-fg">
                        Your Message
                      </Label>
                      <Textarea
                        id="message"
                        required
                        rows={4}
                        placeholder="Tell us how we can help..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="min-h-[7rem] rounded-lg border-0 bg-[#faf6f0] text-sm text-fg placeholder:text-subtle"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full gap-2 text-sm font-semibold"
                      size="lg"
                    >
                      {loading ? "Sending..." : "Send Message"}
                      <Send className="size-4" />
                    </Button>

                    <p className="text-center text-xs leading-relaxed text-muted">
                      By contacting us, you agree to our{" "}
                      <Link
                        to="/terms-and-condition"
                        className="font-medium text-primary underline underline-offset-2 hover:text-[#7a491e]"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy-policy"
                        className="font-medium text-primary underline underline-offset-2 hover:text-[#7a491e]"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section className="bg-[#fffdf9] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold text-fg sm:text-4xl">
              Connecting Near and Far
            </h2>
            <p className="mt-3 max-w-xl text-base text-muted">
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
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-soft">
          <div className="h-72 w-full bg-[#faf6f0] sm:h-[400px]">
            <iframe
              title="Pav Dental Bradford Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.4024254848316!2d-1.728923322964094!3d53.79978714088019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c6fcb3dc04b%3A0x7d6f51a7e4b9bbd0!2s786%20Leeds%20Rd%2C%20Bradford%20BD3%209TY%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 bg-[#faf6f0] p-5 sm:grid-cols-3 sm:p-6">
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
              <div key={item.label} className="flex items-start gap-3.5 rounded-lg bg-white p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#faf6f0] text-primary">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-fg">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.sub}</p>
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
    <section id="faq" className="bg-[#faf6f0] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl font-bold text-fg sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Quick answers about opening hours, appointments, walk-ins, and parking. Need
              immediate help? Call or email our team directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href="tel:08001938786">
                  <Phone className="size-4" />
                  Call 0800 1938 786
                </a>
              </Button>
              <Button asChild variant="outline" className="bg-white hover:bg-[#f0e7da]">
                <a href="mailto:hello@pavdental.com">
                  <Mail className="size-4" />
                  hello@pavdental.com
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-7">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.q} className="rounded-xl bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-fg sm:text-base">{faq.q}</span>
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-md transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-primary text-white" : "bg-[#faf6f0] text-fg"
                      }`}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
    <section className="bg-[#fffdf9] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-[#2a1c12] px-6 py-12 text-center text-white sm:px-14 sm:py-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#e8ddd0] sm:text-base">
            Book your appointment today or speak directly with our Bradford reception team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:08001938786"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#cf9448] px-6 text-sm font-bold text-[#1a1a1a] transition-colors hover:bg-[#c2873d]"
            >
              <Phone className="size-4" />
              Call 0800 1938 786
            </a>
            <a
              href={BOOKING_URL}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#925a27] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#7a491e]"
            >
              <Calendar className="size-4" />
              Book Appointment
            </a>
            <a
              href="https://wa.me/447311871456"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#372418] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#462f20]"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
