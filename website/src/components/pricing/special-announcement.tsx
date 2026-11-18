import { motion } from "motion/react";
import {
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Phone,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";

const ANNOUNCEMENTS = [
  {
    icon: CreditCard,
    badge: "0% APR Representative",
    title: "0% Finance Options",
    description:
      "We understand that upfront dental costs can be daunting. Spread the cost over 6, 10, or 12 months with 0% interest and £0 deposit across all eligible treatments.",
    perks: [
      "Instant decision in-clinic or online",
      "Soft credit check with no score impact",
      "Available from £250",
    ],
  },
  {
    icon: HeartHandshake,
    badge: "Integrated Care",
    title: "NHS & Private Care",
    description:
      "Whether you need routine NHS check-ups for exempt patients and children, or advanced private cosmetic treatments, we support you with unhurried, gentle care.",
    perks: [
      "NHS care for exempt patients",
      "Bespoke private cosmetic dentistry",
      "Direct emergency access guaranteed",
    ],
  },
  {
    icon: ShieldCheck,
    badge: "No Hidden Costs",
    title: "Transparent Pricing",
    description:
      "We provide upfront, transparent fees before treatment begins. Every patient receives an itemized written estimate, plus special concessions for families and seniors.",
    perks: [
      "Clear itemized written estimates",
      "Family registration discounts",
      "Senior (65+) & student concessions",
    ],
  },
];

export function SpecialAnnouncement() {
  const { data: announcements } = useQuery({
    queryKey: ["active-announcements"],
    queryFn: () => api.announcements.list(),
  });

  const active = announcements?.find((a) => a.is_active);

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Dynamic Admin Announcement Banner if configured */}
        {active && (
          <div className="mb-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 sm:p-6 text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="size-10 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Megaphone className="size-5" />
              </div>
              <div>
                {active.title && <h4 className="font-bold text-sm text-[#844d1e]">{active.title}</h4>}
                <p className="text-xs sm:text-sm text-fg/90">{active.body}</p>
              </div>
            </div>
            {active.cta_text && (
              <Button asChild size="sm" className="bg-[#844d1e] text-white shrink-0">
                <a href={active.cta_url || BOOKING_URL}>{active.cta_text}</a>
              </Button>
            )}
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-primary mb-4 shadow-xs">
            <Sparkles className="size-3.5 text-gold" />
            <span>Patient Care & Accessibility</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#844d1e] tracking-tight">
            Special Announcement from Pav Dental
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
            At Pav Dental, we believe that high-quality dental care should be accessible to all.
            We understand that dental treatments can be a significant investment, and we are
            committed to making our services as affordable, transparent, and welcoming as possible.
          </p>
        </div>

        {/* 3 Announcement Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {ANNOUNCEMENTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-6 shadow-xs hover:shadow-soft hover:border-primary/40 transition-all duration-200"
              >
                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#f6ecdf] text-[#844d1e]">
                      <Icon className="size-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/15">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-fg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Benefits List */}
                <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
                  {item.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-fg/85">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Bar & CTAs */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" />
              <span>Same-Day Appointments</span>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>GDC Registered Bradford</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <Button asChild size="default" className="accent-gradient text-white font-semibold text-xs h-10 px-5 gap-1.5">
              <a href={BOOKING_URL}>
                Book Free Consultation
                <ArrowRight className="size-3.5" />
              </a>
            </Button>
            <Button asChild variant="outline" className="text-xs h-10 px-4 gap-1.5 text-fg">
              <a href="tel:08001938786">
                <Phone className="size-3.5 text-primary" />
                <span>0800 1938 786</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
