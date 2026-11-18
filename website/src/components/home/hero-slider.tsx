import { ArrowRight, ChevronRight, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BookButton, CallButton, Heading, Section } from "@/components/hims";
import { ACCENT_TEXT } from "@/components/hims/tones";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const CATEGORY_CARDS = [
  {
    title: "Facial",
    accent: "Aesthetics",
    accentTone: "copper" as const,
    subtitle: "Rediscover Your Youthful Radiance with Our Premier Aesthetic Treatments",
    to: "/services/aesthetics" as const,
    imgSrc: "/media/hero2.jpg",
    imgAlt: "Pav Dental facial aesthetics consultation suite",
  },
  {
    title: "General",
    accent: "Dentistry",
    accentTone: "terracotta" as const,
    subtitle: "Check-ups, hygiene, fillings and preventive family care",
    to: "/services/general-dentistry" as const,
    imgSrc: "/media/hero-clinic.jpg",
    imgAlt: "Pav Dental modern dental surgery suite",
  },
  {
    title: "Teeth",
    accent: "Whitening",
    accentTone: "terracotta" as const,
    subtitle: "Clinician-led whitening tailored to your smile",
    to: "/services/whitening" as const,
    imgSrc: "/media/hero-smile.jpg",
    imgAlt: "Bright natural smile after whitening care",
  },
  {
    title: "Mobile",
    accent: "Dentistry",
    accentTone: "copper" as const,
    subtitle: "Dental care delivered directly to your door",
    to: "/services/mobile-dentistry" as const,
    imgSrc: "/media/hero.jpg",
    imgAlt: "Pav Dental mobile dentistry visit",
  },
] as const;

export function HeroSlider() {
  return (
    <Section id="top" theme="white" space="none" className="pt-6 pb-8 md:pt-9 md:pb-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <Heading as="h1" size="hero" accent="that you can rely on" tone="terracotta">
            Exceptional dentistry
          </Heading>
          <p className="mt-3 text-lead text-muted">
            24-hour private, cosmetic, and emergency dental care in Bradford.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <BookButton>Book Online</BookButton>
          <CallButton variant="outline">Call us Now · {PRACTICE_PHONE}</CallButton>
        </div>
      </div>

      {/* Featured Hero Pair: tall tactile Hims cards with real clinic photography */}
      <div className="mt-7 grid gap-2 md:grid-cols-2">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative grid min-h-[212px] md:h-[216px] grid-cols-[1.15fr_0.85fr] overflow-hidden rounded-xl bg-gradient-to-r from-brown-deep via-brown to-copper text-white t-lift"
        >
          <div className="flex flex-col justify-between p-5 md:p-6">
            <div>
              <p className="text-caption text-gold">ACCESSIBLE SMILES</p>
              <h2 className="mt-1.5 text-h4 text-white">
                Complete Dental Check-Up <span className="text-gold">£35</span>
              </h2>
              <p className="mt-2 text-small text-white/85">
                Only £7.60 more than the NHS fee (£27.40), with faster access and premium service
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-label text-gold">
              <span>Book - £35</span>
              <ChevronRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </div>
          </div>
          <div className="relative h-full min-h-[190px] overflow-hidden">
            <img
              src="/media/hero1.jpg"
              alt="Pav Dental treatment room for routine dental check-ups"
              fetchPriority="high"
              className="t-zoom absolute inset-0 size-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-copper/60 via-transparent to-transparent" />
          </div>
        </a>

        <Link
          to="/services/emergency-dental"
          className="group relative grid min-h-[212px] md:h-[216px] grid-cols-[1.15fr_0.85fr] overflow-hidden rounded-xl bg-navy-deep text-white t-lift"
        >
          <div className="flex flex-col justify-between p-5 md:p-6">
            <div>
              <p className="text-caption text-butter">24/7 URGENT CARE</p>
              <h2 className="mt-1.5 text-h4 text-white">
                Emergency <span className="text-butter">Dentist</span>
              </h2>
              <p className="mt-2 text-small text-white/80">
                Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays
              </p>
              <p className="mt-1.5 text-caption text-white/90">
                £45 consultation · £90* out-of-hours consultation
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-label text-butter">
              <span>Emergency Dental</span>
              <ChevronRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </div>
          </div>
          <div className="relative h-full min-h-[190px] overflow-hidden">
            <img
              src="/media/hero-night.jpg"
              alt="Pav Dental reception lit at night for 24/7 emergency access"
              fetchPriority="high"
              className="t-zoom absolute inset-0 size-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/75 via-navy-deep/20 to-transparent" />
          </div>
        </Link>
      </div>

      {/* Four Hims-style visual category cards */}
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group flex flex-col justify-between overflow-hidden rounded-xl bg-tile-cream p-4 t-lift md:p-5"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-nav-lg font-[470] text-fg">
                  {card.title} <span className={ACCENT_TEXT[card.accentTone]}>{card.accent}</span>
                </span>
                <ChevronRight
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-fg transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </div>
              <p className="mt-1.5 text-small text-muted">{card.subtitle}</p>
            </div>
            <div className="t-zoom mt-4 aspect-[16/10] overflow-hidden rounded-lg bg-sand">
              <img
                src={card.imgSrc}
                alt={card.imgAlt}
                loading="eager"
                className="size-full object-cover object-center"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom slim action row matching Mobbin Hims hero second tier */}
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Link
          to="/services/tooth-extraction"
          className="group flex items-center justify-between rounded-xl bg-tile-cream px-5 py-4 t-lift"
        >
          <span className="text-nav-lg font-[470] text-fg">
            Tooth <span className="text-terracotta">Extraction</span>
          </span>
          <ChevronRight
            aria-hidden
            className="size-4 text-fg transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>

        <a
          href={PRACTICE_PHONE_HREF}
          className="group flex items-center justify-between rounded-xl bg-tile-cream px-5 py-4 t-lift"
        >
          <span className="flex items-center gap-2 text-nav-lg font-[470] text-fg">
            <Phone aria-hidden className="size-4 text-terracotta" />
            <span>
              Call <span className="text-terracotta">{PRACTICE_PHONE}</span>
            </span>
          </span>
          <ChevronRight
            aria-hidden
            className="size-4 text-fg transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </a>

        <Link
          to="/services"
          className="group flex items-center justify-between rounded-xl bg-tile-cream px-5 py-4 t-lift"
        >
          <span className="text-nav-lg font-[470] text-fg">
            Explore all <span className="text-copper">treatments</span>
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 text-fg transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </Section>
  );
}
