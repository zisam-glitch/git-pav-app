import {
  CheckCircle2,
  ChevronRight,
  Crown,
  Paintbrush,
  Search,
  Sparkles,
  Stethoscope,
  Truck,
  Zap,
} from "lucide-react";
import { BOOKING_URL, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const TRUST_ITEMS = [
  "GDC Registered Clinicians",
  "24/7 Emergency Dental Care",
  "£35 Complete Check-Up",
  "Same-Day Bradford Appointments",
  "Mobile Dental Van",
] as const;

const PRIMARY_BENTO = [
  {
    prefix: "Complete",
    accent: "check-up",
    accentColor: "text-[#4D88BA]",
    subtitle: "From £35 — £7.60 more than NHS",
    href: BOOKING_URL,
    icon: Stethoscope,
    image: "/media/hims/bento-checkup.jpg",
  },
  {
    prefix: "24/7",
    accent: "emergency",
    accentColor: "text-[#8A3A34]",
    subtitle: "Day & night, including bank holidays",
    href: "/services/emergency-dental",
    icon: Zap,
    image: "/media/hims/bento-emergency.jpg",
  },
  {
    prefix: "Brighten",
    accent: "your smile",
    accentColor: "text-[#AD6E4B]",
    subtitle: "Doctor-supervised whitening",
    href: "/services/whitening",
    icon: Sparkles,
    image: "/media/hims/bento-whitening.jpg",
  },
  {
    prefix: "Mobile",
    accent: "dental van",
    accentColor: "text-[#1B3745]",
    subtitle: "Domiciliary care at your door",
    href: "/services/mobile-dentistry",
    icon: Truck,
    image: "/media/hims/bento-mobile-van.jpg",
  },
] as const;

const SECONDARY_BENTO = [
  {
    prefix: "Facial",
    accent: "aesthetics",
    accentColor: "text-[#754B3D]",
    href: "/services/aesthetics",
    icon: Crown,
  },
  {
    prefix: "Cosmetic",
    accent: "dentistry",
    accentColor: "text-[#4D88BA]",
    href: "/services/cosmetic",
    icon: Paintbrush,
  },
  {
    prefix: "Browse all",
    accent: "treatments",
    accentColor: "text-black",
    href: "/services",
    icon: Search,
    isSearch: true,
  },
] as const;

export function HeroSlider() {
  return (
    <section id="top" className="relative pt-20 pb-8 sm:pt-24">
      {/* Slim Hims-style top trust strip */}
      <div className="border-y border-black/6 bg-[#FAF8F2]">
        <div className="mx-auto flex max-w-[87rem] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5 text-xs text-black/65 sm:justify-between sm:px-6 lg:px-8">
          <span className="font-medium text-black">Why Pav Dental?</span>
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#1B3745]" aria-hidden="true" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main airy Hims hero + 4-col Bento Grid */}
      <div className="mx-auto max-w-[87rem] px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-normal tracking-[-0.045em] leading-[1.06] text-black sm:text-6xl lg:text-[4.25rem]">
            <span className="block text-[#4D88BA]">Accessible dental care</span>
            <span className="block text-black">personalized to you</span>
          </h1>
          <p className="mt-4 text-base text-black/60 sm:text-lg">
            Complete dental check-up from £35 and 24/7 emergency dentistry in Bradford.
          </p>
        </div>

        {/* 4-column Bento Grid matching Mobbin Hims */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRIMARY_BENTO.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="hims-tile-warm group flex min-h-[210px] flex-col justify-between rounded-[1.25rem] border border-black/6 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.07)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-base font-medium tracking-tight text-black">
                    {card.prefix}{" "}
                    <span className={card.accentColor}>{card.accent}</span>
                  </span>
                  <p className="mt-1 text-xs text-black/55">{card.subtitle}</p>
                </div>
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-black/45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-black" />
              </div>

              <div className="mt-3 flex items-center justify-center">
                <div className="size-32 overflow-hidden [mask-image:radial-gradient(circle_at_center,black_35%,transparent_68%)]">
                  <img
                    src={card.image}
                    alt={`${card.prefix} ${card.accent}`}
                    className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* 3-column Compact Secondary Row */}
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {SECONDARY_BENTO.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hims-tile-warm group flex h-[76px] items-center justify-between rounded-[1.25rem] border border-black/6 px-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
            >
              <span className="text-base font-medium tracking-tight text-black">
                {item.prefix}{" "}
                <span className={item.accentColor}>{item.accent}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-white shadow-xs">
                  <item.icon className="size-4 text-[#1B3745]" />
                </span>
                {"isSearch" in item && item.isSearch ? null : (
                  <ChevronRight className="size-4 text-black/45 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-black" />
                )}
              </span>
            </a>
          ))}
        </div>

        {/* Rounded Slate Featured Emergency Banner matching Mobbin bottom hero card */}
        <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#D6E0E8] via-[#E5ECF1] to-[#F2EDE5] px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[#1B3745]">
              786 Leeds Road, Bradford · BD3 9TY
            </span>
            <h2 className="mt-4 font-display text-2xl font-normal tracking-[-0.04em] text-[#1B3745] sm:text-4xl">
              24/7 Emergency Dentistry by Pav Dental
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[#1B3745]/75 sm:text-base">
              Covering Bradford 24 hours, 7 days a week including National and Bank Holidays — £45
              consultation (£90* out-of-hours consultation).
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={BOOKING_URL}
                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-[#1B3745]"
              >
                Book Online
              </a>
              <a
                href={PRACTICE_PHONE_HREF}
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-[#FAF8F2]"
              >
                Call 0800 1938 786
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
