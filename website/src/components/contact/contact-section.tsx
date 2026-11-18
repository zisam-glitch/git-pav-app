import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Headphones,
  MessageSquareText,
  Newspaper,
  ChevronDown,
  ExternalLink,
  ArrowRight,
  Clock,
  Navigation,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/home/reveal";
import { api } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  FAQ data                                                          */
/* ------------------------------------------------------------------ */
const faqs = [
  {
    q: "What are your opening hours?",
    a: "We are open 7 days a week, from 08:00 to 22:00. Emergency appointments are available 24/7 by calling our dedicated emergency line.",
  },
  {
    q: "How do I book an appointment?",
    a: "You can book online through the form on this page, call us directly at 0800 1938 786, or send a WhatsApp message. We typically respond within 30 minutes during business hours.",
  },
  {
    q: "Do you accept walk-in patients?",
    a: "Yes, we welcome walk-in patients. However, we recommend booking in advance to minimise wait times and ensure you receive the most convenient slot.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards, bank transfers, and offer 0% interest finance plans. Payment can be made in the clinic or online.",
  },
  {
    q: "Is parking available at the clinic?",
    a: "Yes, we have a free on-site car park with dedicated disabled spaces. Street parking is also available on Leeds Road.",
  },
];

/* ------------------------------------------------------------------ */
/*  Department cards                                                  */
/* ------------------------------------------------------------------ */
const departments = [
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Our support team is available around the clock to address any concerns or queries you may have.",
    link: "Get support",
  },
  {
    icon: MessageSquareText,
    title: "Feedback & Suggestions",
    description:
      "We value your feedback and are continuously working to improve. Your input is crucial in shaping our future.",
    link: "Share feedback",
  },
  {
    icon: Newspaper,
    title: "Media Inquiries",
    description:
      "For media-related questions or press inquiries, please contact us at hello@pavdental.com.",
    link: "Press contact",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Section                                                      */
/* ------------------------------------------------------------------ */
export function ContactSection() {
  return (
    <>
      <ContactHero />
      <DepartmentCards />
      <FaqSection />
      <MapSection />
      <CtaBanner />
    </>
  );
}

/* ================================================================== */
/*  1. CONTACT HERO  — left info + right form card                    */
/* ================================================================== */
function ContactHero() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forms.submitContact({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  };

  return (
    <section className="relative overflow-hidden bg-[#faf8f5] pb-24 pt-14 sm:pt-20 lg:pb-32">
      {/* ---- Layered decorative background ---- */}
      <div className="pointer-events-none absolute -right-52 -top-52 size-[600px] rounded-full bg-gradient-to-br from-primary/[0.06] to-gold/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-[400px] rounded-full bg-gradient-to-tr from-primary/[0.03] to-transparent blur-[80px]" />
      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
          {/* ---- Left column: headline + contact info ---- */}
          <Reveal>
            <div className="max-w-lg pt-2 lg:pt-10">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-xs font-medium text-primary shadow-sm"
              >
                <Sparkles className="size-3.5" />
                We'd love to hear from you
              </motion.div>

              <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                Contact{" "}
                <span className="accent-text">Us</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-[1.05rem]">
                Email, call, or complete the form to learn how we can help you with your dental care
                needs.
              </p>

              {/* Quick contact links */}
              <div className="mt-10 space-y-4">
                {[
                  {
                    icon: Mail,
                    href: "mailto:hello@pavdental.com",
                    label: "hello@pavdental.com",
                    sub: "Email us anytime",
                  },
                  {
                    icon: Phone,
                    href: "tel:08001938786",
                    label: "0800 1938 786",
                    sub: "Mon–Sun, 08:00–22:00",
                  },
                  {
                    icon: MapPin,
                    href: "https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY",
                    label: "786 Leeds Road, Bradford",
                    sub: "BD3 9TY · Free parking",
                    external: true,
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-xl p-2 -ml-2 transition-colors hover:bg-white/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border/50 bg-white text-primary shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:border-primary/30 group-hover:shadow-md">
                      <item.icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-fg group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="block text-xs text-muted/80">{item.sub}</span>
                    </span>
                  </a>
                ))}
              </div>

              {/* Customer Support link */}
              <div className="mt-10 flex items-center gap-6">
                <a
                  href="#faq"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-fg transition-colors hover:text-primary"
                >
                  Customer Support
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
                <span className="h-5 w-px bg-border/60" />
                <a
                  href="https://wa.me/447311871456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-fg transition-colors hover:text-primary"
                >
                  WhatsApp
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* ---- Right column: form card ---- */}
          <Reveal delay={0.12}>
            <div className="relative">
              {/* Card glow behind */}
              <div className="pointer-events-none absolute -inset-3 rounded-xl bg-gradient-to-br from-primary/[0.07] via-gold/[0.05] to-transparent blur-2xl" />

              <div className="relative overflow-hidden rounded-xl border border-white/70 bg-white/95 p-7 shadow-[0_24px_64px_-16px_rgba(42,28,18,0.18)] sm:p-9">
                {/* Accent line at top */}

                <h2 className="font-display text-2xl font-bold text-fg sm:text-[1.7rem]">
                  Get in Touch
                </h2>
                <p className="mt-1.5 text-sm text-muted">You can reach us anytime</p>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-8 rounded-xl bg-gradient-to-br from-[#faf6f0] to-[#f5f0e8] p-8 text-center ring-1 ring-primary/10"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.15, type: "spring", bounce: 0.5 }}
                        className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm"
                      >
                        <CheckCircle2 className="size-8" />
                      </motion.div>
                      <h3 className="font-display text-xl font-bold text-fg">Message Sent!</h3>
                      <p className="mx-auto mt-2.5 max-w-xs text-sm leading-relaxed text-muted">
                        Thank you for reaching out. Our team will review your inquiry and get back
                        to you shortly.
                      </p>
                      <Button onClick={reset} className="mt-7 text-xs" size="sm">
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="mt-7 space-y-5"
                    >
                      {/* First + Last Name row */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-xs font-medium text-muted">
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
                            className="h-11 rounded-xl border-border/50 bg-[#fdfcfa] text-sm shadow-sm placeholder:text-subtle/50 transition-all duration-200 focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_rgba(146,90,39,0.08)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-xs font-medium text-muted">
                            Last name
                          </Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                            className="h-11 rounded-xl border-border/50 bg-[#fdfcfa] text-sm shadow-sm placeholder:text-subtle/50 transition-all duration-200 focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_rgba(146,90,39,0.08)]"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-medium text-muted">
                          Your email
                        </Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle/50" />
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="h-11 rounded-xl border-border/50 bg-[#fdfcfa] pl-10 text-sm shadow-sm placeholder:text-subtle/50 transition-all duration-200 focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_rgba(146,90,39,0.08)]"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-medium text-muted">
                          Phone number
                        </Label>
                        <div className="flex gap-2.5">
                          <div className="flex h-11 w-[4.5rem] items-center justify-center rounded-xl border border-border/50 bg-[#fdfcfa] text-sm font-medium text-muted shadow-sm">
                            +44
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="7311 871 456"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="h-11 flex-1 rounded-xl border-border/50 bg-[#fdfcfa] text-sm shadow-sm placeholder:text-subtle/50 transition-all duration-200 focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_rgba(146,90,39,0.08)]"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-xs font-medium text-muted">
                          How can we help?
                        </Label>
                        <Textarea
                          id="message"
                          required
                          rows={4}
                          placeholder="Tell us about your dental needs..."
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          className="min-h-[7rem] rounded-xl border-border/50 bg-[#fdfcfa] text-sm shadow-sm placeholder:text-subtle/50 transition-all duration-200 focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_rgba(146,90,39,0.08)]"
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full gap-2.5 text-sm font-semibold"
                        size="lg"
                      >
                        {loading ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                          >
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="inline-block size-4 rounded-full border-2 border-white/30 border-t-white"
                            />
                            Sending…
                          </motion.span>
                        ) : (
                          <>
                            Submit
                            <Send className="size-4" />
                          </>
                        )}
                      </Button>

                      <p className="text-center text-[11px] leading-relaxed text-subtle/80">
                        By contacting us, you agree to our{" "}
                        <a
                          href="#"
                          className="font-medium text-muted underline underline-offset-2 transition-colors hover:text-fg"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="font-medium text-muted underline underline-offset-2 transition-colors hover:text-fg"
                        >
                          Privacy Policy
                        </a>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  2. DEPARTMENT CARDS                                               */
/* ================================================================== */
function DepartmentCards() {
  return (
    <section className="relative bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <Reveal>
          <div className="mb-12 max-w-lg">
            <span className="text-xs font-semibold uppercase text-primary">
              How can we help
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-fg sm:text-4xl">
              Get in touch with the right team
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept, i) => (
            <Reveal key={dept.title} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-b from-[#fdfcfa] to-[#faf8f5] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_50px_-20px_rgba(42,28,18,0.15)] sm:p-8">
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/[0.06] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-border/40 transition-all duration-300 group-hover:ring-primary/30 group-hover:shadow-md group-hover:scale-110">
                    <dept.icon className="size-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-fg">{dept.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{dept.description}</p>
                  <a
                    href="#"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100"
                  >
                    {dept.link}
                    <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  3. FAQ SECTION                                                    */
/* ================================================================== */
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-[#faf8f5] py-20 sm:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-0 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/[0.04] to-transparent blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          {/* Left: heading + question prompt */}
          <Reveal>
            <div className="sticky top-24">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase text-primary shadow-sm">
                FAQ
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold text-fg sm:text-4xl lg:text-[2.5rem]">
                Do you have any
                <br />
                questions for us?
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
                If there are questions you want to ask, we will answer all your questions. You can
                also reach us directly at our email.
              </p>

              {/* Quick email input */}
              <div className="mt-8 flex items-center gap-2.5">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle/50" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-xl border border-border/50 bg-white pl-10 pr-4 text-sm text-fg shadow-sm placeholder:text-subtle/50 transition-all duration-200 focus:border-primary/40 focus:outline-none focus:shadow-[0_0_0_3px_rgba(146,90,39,0.08)]"
                  />
                </div>
                <Button size="lg" className="shrink-0 text-sm font-semibold px-6">
                  Submit
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Right: accordion */}
          <Reveal delay={0.1}>
            <div className="rounded-xl border border-border/30 bg-white/80 p-2 shadow-sm sm:p-3">
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-xl transition-colors duration-200 ${
                      isOpen ? "bg-[#faf8f5]" : "hover:bg-[#fdfcfa]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-semibold text-fg sm:text-[0.95rem]">
                        {faq.q}
                      </span>
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
                          isOpen
                            ? "bg-primary text-white rotate-180"
                            : "bg-white text-muted ring-1 ring-border/40 shadow-sm"
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
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  4. MAP SECTION                                                    */
/* ================================================================== */
function MapSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-[#faf8f5] px-3 py-1 text-xs font-semibold uppercase text-primary shadow-sm">
              Our Location
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold text-fg sm:text-4xl lg:text-[2.5rem]">
              Connecting Near and Far
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              Visit us at our modern clinic in Bradford, easily accessible with free parking.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-xl border border-border/30 bg-white shadow-[0_24px_64px_-20px_rgba(42,28,18,0.12)]">
            {/* Map embed */}
            <div className="relative h-72 w-full bg-[#e8ecef] sm:h-[420px]">
              <iframe
                title="Pav Dental Bradford Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.4024254848316!2d-1.728923322964094!3d53.79978714088019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48795c6fcb3dc04b%3A0x7d6f51a7e4b9bbd0!2s786%20Leeds%20Rd%2C%20Bradford%20BD3%209TY%2C%20UK!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                className="h-full w-full border-0"
                loading="lazy"
              />

              {/* Floating info card over map */}
              <div className="absolute bottom-4 left-4 hidden rounded-xl border border-white/60 bg-white/95 p-4 shadow-lg sm:block sm:max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg accent-gradient text-white shadow-sm">
                    <MapPin className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-fg">Pav Dental</p>
                    <p className="text-xs text-muted">786 Leeds Rd, Bradford BD3 9TY</p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-fg"
                >
                  Open Google Maps
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            {/* Map footer info — mobile fallback */}
            <div className="flex flex-col items-start justify-between gap-4 border-t border-border/30 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-3.5">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#faf8f5] text-primary ring-1 ring-border/30">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-fg">Pav Dental</p>
                  <p className="text-xs text-muted">786 Leeds Road, Bradford, BD3 9TY</p>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=786+Leeds+Road+Bradford+BD3+9TY"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-[#faf8f5] px-4 py-2 text-sm font-medium text-fg shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                Open in Google Maps
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </Reveal>

        {/* Location details row */}
        <Reveal delay={0.18}>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {[
              {
                icon: Building2,
                label: "Headquarters",
                title: "Pav Dental",
                sub: "786 Leeds Road, Bradford, BD3 9TY",
              },
              {
                icon: Clock,
                label: "Opening Hours",
                title: "Mon – Sun",
                sub: "08:00 – 22:00 (Emergency 24/7)",
              },
              {
                icon: Navigation,
                label: "Get Directions",
                title: "Easy Access",
                sub: "Free parking · Bus routes 72 & 73",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="group rounded-xl border border-border/30 bg-gradient-to-b from-[#fdfcfa] to-[#faf8f5] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-border/30 transition-all duration-300 group-hover:ring-primary/25 group-hover:scale-105">
                  <item.icon className="size-4" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-semibold uppercase text-primary/70">
                  {item.label}
                </span>
                <p className="mt-1.5 text-sm font-bold text-fg">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.sub}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  5. CTA BANNER                                                     */
/* ================================================================== */
function CtaBanner() {
  return (
    <section className="bg-[#faf8f5] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-xl accent-gradient px-6 py-14 text-center text-white sm:px-16 sm:py-20">
            {/* Layered decorative elements */}
            <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-white/[0.08] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-white/[0.08] blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Floating sparkle accents */}
            <motion.div
              animate={{ y: [-4, 4, -4], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute left-[15%] top-[20%] size-2 rounded-full bg-white/40"
            />
            <motion.div
              animate={{ y: [3, -3, 3], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="pointer-events-none absolute right-[20%] top-[30%] size-1.5 rounded-full bg-white/40"
            />

            <div className="relative">
              <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                Book your appointment today and take the first step toward a healthier, brighter
                smile.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button
                  asChild
                  className="bg-white text-primary hover:bg-white/90 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.15)] font-semibold"
                  size="lg"
                >
                  <a className="text-white" href="tel:08001938786">
                    <Phone className="size-4" />
                    Call 0800 1938 786
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 bg-white/[0.08] text-white hover:bg-white/15 shadow-none"
                  size="lg"
                >
                  <a href="https://wa.me/447311871456" target="_blank" rel="noopener noreferrer">
                    WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
