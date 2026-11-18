import {
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  Phone,
  Check,
  Calendar,
  ArrowRight,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

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
    <section className="bg-[#FBF8F5] py-16 sm:py-24">
      <div className="mx-auto max-w-[87rem] px-4 sm:px-6 lg:px-8">
        {active && (
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-[1.5rem] hims-navy-gradient p-6 text-white sm:flex-row">
            <div className="flex items-center gap-3.5 text-left">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#ECD880]">
                <Megaphone className="size-5" aria-hidden="true" />
              </div>
              <div>
                {active.title && <h4 className="text-sm font-medium text-[#ECD880]">{active.title}</h4>}
                <p className="text-xs text-white/85 sm:text-sm">{active.body}</p>
              </div>
            </div>
            {active.cta_text && (
              <Button asChild variant="gold" size="sm" className="shrink-0">
                <a href={active.cta_url || BOOKING_URL}>{active.cta_text}</a>
              </Button>
            )}
          </div>
        )}

        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">
            Patient Care &amp; Accessibility
          </p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.04em] text-black sm:text-5xl">
            Special Announcement from{" "}
            <span className="text-[#754B3D]">Pav Dental</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-black/65 sm:text-base">
            At Pav Dental, we take immense pride in being recognized as the market leader in dental
            pricing. We guarantee to beat the price of any dental treatment offered by our
            competitors — present us with a written quote and we will offer you a better price.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ANNOUNCEMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-[1.5rem] border border-black/6 bg-[#FAF8F2] p-7 transition-all duration-200 hover:bg-white hover:shadow-[0_8px_28px_rgba(0,0,0,0.04)]"
              >
                <div>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[#F2EDE5] text-[#1B3745]">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#754B3D] border border-black/6">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-normal tracking-[-0.025em] text-black">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-black/65">
                    {item.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-2.5 border-t border-black/8 pt-5">
                  {item.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-xs text-black/80 sm:text-sm">
                      <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <Check className="size-2.5 stroke-[2.5]" aria-hidden="true" />
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-black/10 pt-8 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-black/60 sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-[#1B3745]" aria-hidden="true" />
              Same-Day Appointments
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#1B3745]" aria-hidden="true" />
              GDC Registered Bradford
            </span>
          </div>

          <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:w-auto">
            <Button asChild size="default">
              <a href={BOOKING_URL}>
                Book Free Consultation
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="default">
              <a href={PRACTICE_PHONE_HREF}>
                <Phone className="size-4 text-[#1B3745]" aria-hidden="true" />
                {PRACTICE_PHONE}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
