import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BookButton, ButtonLink, CallButton, Heading, Media, Section } from "@/components/hims";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { ACCENT_TEXT } from "@/components/hims/tones";

const CATEGORY_TILES = [
  {
    title: "Mobile",
    accent: "Dentistry",
    accentTone: "terracotta" as const,
    to: "/services/mobile-dentistry" as const,
    mediaAlt: "Portable dental equipment for mobile home visits",
  },
  {
    title: "Facial",
    accent: "Aesthetics",
    accentTone: "copper" as const,
    to: "/services/aesthetics" as const,
    mediaAlt: "Facial aesthetics consultation suite at Pav Dental",
  },
  {
    title: "Tooth",
    accent: "Extraction",
    accentTone: "terracotta" as const,
    to: "/services/tooth-extraction" as const,
    mediaAlt: "Gentle oral surgery and extraction instruments",
  },
  {
    title: "Teeth",
    accent: "Whitening",
    accentTone: "terracotta" as const,
    to: "/services/whitening" as const,
    mediaAlt: "Professional teeth whitening kit on cream surface",
  },
];

export function HeroSlider() {
  return (
    <Section id="top" theme="white" space="none" className="pt-6 pb-8 md:pt-8 md:pb-12">
      <div className="max-w-3xl">
        <Heading as="h1" size="hero" accent="that you can rely on" tone="terracotta">
          Exceptional dentistry
        </Heading>
        <p className="mt-4 text-lead text-muted">
          24-hour private and emergency dental care in Bradford — complete check-ups from £35,
          cosmetic care, and same-day urgent access.
        </p>
      </div>

      {/* Featured Tiles Row: 2 large rounded-xl tiles with tight 4px (gap-1) Hims bento gap */}
      <div className="mt-6 grid grid-cols-2 gap-1 md:mt-8">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundImage: "linear-gradient(to right, #492C00, #7B5720)" }}
          className="group relative flex min-h-[227px] flex-col justify-between overflow-hidden rounded-xl p-4 text-white t-lift md:min-h-[199px] md:p-6"
        >
          <div>
            <p className="text-caption text-white/80">ACCESSIBLE SMILES</p>
            <h2 className="mt-1.5 text-h4 text-white">
              Complete Dental Check-Up <span className="text-gold">£35</span>
            </h2>
            <p className="mt-2 hidden text-small text-white/80 sm:block">
              Only £7.60 more than the NHS fee (£27.40), with faster access and premium service
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-label text-gold">Book - £35</span>
            <ChevronRight
              aria-hidden
              className="size-5 shrink-0 text-white transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </a>

        <Link
          to="/services/emergency-dental"
          className="group relative flex min-h-[227px] flex-col justify-between overflow-hidden rounded-xl bg-navy-deep p-4 text-white t-lift md:min-h-[199px] md:p-6"
        >
          <div>
            <p className="text-caption text-white/70">24/7 URGENT CARE</p>
            <h2 className="mt-1.5 text-h4 text-white">
              Emergency <span className="text-butter">Dentist</span>
            </h2>
            <p className="mt-2 hidden text-small text-white/70 sm:block">
              Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays
            </p>
            <p className="mt-1.5 text-caption text-white/80 sm:text-small">
              £45 consultation · £90* out-of-hours consultation
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-label text-butter">Emergency Dental</span>
            <ChevronRight
              aria-hidden
              className="size-5 shrink-0 text-white transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </Link>
      </div>

      {/* Category Tiles Row: 4 compact horizontal bg-tile-cream tiles */}
      <div className="mt-1 grid grid-cols-1 gap-1 lg:grid-cols-4">
        {CATEGORY_TILES.map((tile, idx) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="group flex h-[80px] items-center justify-between gap-3 overflow-hidden rounded-xl bg-tile-cream px-4 t-lift lg:h-[100px]"
          >
            <span className="text-nav-lg font-[470] text-fg">
              {tile.title} <span className={ACCENT_TEXT[tile.accentTone]}>{tile.accent}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="t-zoom block w-14 overflow-hidden rounded-md lg:w-16">
                <Media
                  src={idx === 0 ? "/media/hero.jpg" : undefined}
                  alt={tile.mediaAlt}
                  ratio="4 / 3"
                  tone="sand"
                  priority={idx === 0}
                  className="rounded-md"
                />
              </span>
              <ChevronRight
                aria-hidden
                className="size-4 shrink-0 text-fg transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>

      {/* Verbatim live hero offers & quick actions */}
      <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl bg-sand p-5 md:flex-row md:items-center md:px-6">
        <div className="space-y-1">
          <p className="text-caption text-muted">FACIAL AESTHETICS &amp; GENERAL DENTISTRY</p>
          <p className="text-body font-medium text-fg">
            Rediscover Your Youthful Radiance with Our Premier Aesthetic Treatments
          </p>
          <p className="text-small text-muted">
            Complete Dental Check-Up: £35 Only £7.60 more than the NHS fee (£27.40), with faster
            access and premium service · General Dentistry &amp; Emergency Dental
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <BookButton size="sm">Book Online</BookButton>
          <CallButton size="sm" variant="outline" href={PRACTICE_PHONE_HREF}>
            Call us Now · {PRACTICE_PHONE}
          </CallButton>
          <ButtonLink to="/services/aesthetics" size="sm" variant="ghost">
            Learn more
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
