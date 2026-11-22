import { ChevronRight, Pause, Play, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookButton, CallButton, Section } from "@/components/hims";
import { ACCENT_TEXT } from "@/components/hims/tones";
import { BOOKING_URL, PRACTICE_PHONE } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

const HERO_PHRASES = [
  { label: "Exceptional dentistry", tone: "terracotta" as const },
  { label: "24/7 emergency care", tone: "sky" as const },
  { label: "Teeth whitening", tone: "copper" as const },
  { label: "Facial aesthetics", tone: "clay" as const },
] as const;

const FEATURED_TILES = [
  {
    id: "checkup",
    title: "Complete",
    accent: "Check-Up",
    accentTone: "terracotta" as const,
    hoverTone: "terracotta" as const,
    badge: "£35",
    badgeClass: "bg-terracotta text-white",
    href: BOOKING_URL,
    external: true,
    imgSrc: "/images/generated/hero-tile-checkup.webp",
    imgAlt: "Dental mirror and explorer on a cream ceramic tray in warm morning light",
  },
  {
    id: "emergency",
    title: "Emergency",
    accent: "Dentist",
    accentTone: "sky" as const,
    hoverTone: "blue" as const,
    badge: "24/7",
    badgeClass: "bg-navy text-white",
    to: "/services/emergency-dental" as const,
    external: false,
    imgSrc: "/images/generated/hero-tile-emergency.webp",
    imgAlt: "Navy emergency dental kit with a gold clasp on a stone counter beside a wall clock",
  },
  {
    id: "aesthetics",
    title: "Facial",
    accent: "Aesthetics",
    accentTone: "copper" as const,
    hoverTone: "copper" as const,
    to: "/services/aesthetics" as const,
    external: false,
    imgSrc: "/images/generated/hero-tile-aesthetics.webp",
    imgAlt: "Amber glass serum dropper bottle beside a travertine pebble and eucalyptus sprig",
  },
  {
    id: "whitening",
    title: "Teeth",
    accent: "Whitening",
    accentTone: "sky" as const,
    hoverTone: "sky-gold" as const,
    to: "/services/whitening" as const,
    external: false,
    imgSrc: "/images/generated/hero-tile-whitening.webp",
    imgAlt: "Whitening pen beside a sage case holding a white ceramic tooth model",
  },
] as const;

const SECONDARY_TILES = [
  {
    title: "General",
    accent: "Dentistry",
    accentTone: "terracotta" as const,
    hoverTone: "terracotta" as const,
    to: "/services/general-dentistry" as const,
    imgSrc: "/images/generated/hero-tile-general.webp",
    imgAlt: "Brushed steel dental instruments arranged on a round cream ceramic tray",
  },
  {
    title: "Mobile",
    accent: "Dentistry",
    accentTone: "copper" as const,
    hoverTone: "copper" as const,
    to: "/services/mobile-dentistry" as const,
    imgSrc: "/images/generated/hero-tile-mobile.webp",
    imgAlt: "White mobile dental clinic van parked on a tree-lined street at golden hour",
  },
] as const;

export function HeroSlider() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % HERO_PHRASES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const activePhrase = HERO_PHRASES[phraseIndex] ?? HERO_PHRASES[0];

  return (
    <Section id="top" theme="white" space="none" className="pt-6 pb-8 md:pt-10 md:pb-12">
      {/* Hims rotating two-tone hero headline + subtitle + primary pills */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="flex items-start gap-3">
            <h1 className="text-display text-fg">
              <span className={cn("block t-colors", ACCENT_TEXT[activePhrase.tone])}>
                {activePhrase.label}
              </span>{" "}
              <span className="block">that you can rely on</span>
            </h1>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-lead text-muted">
              24-hour private, cosmetic, and emergency dental care in Bradford starts here.
            </p>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? "Resume rotating headline" : "Pause rotating headline"}
              className="inline-flex size-7 items-center justify-center rounded-pill border border-border bg-white text-muted t-colors hover:border-fg hover:text-fg"
            >
              {paused ? (
                <Play aria-hidden className="size-3.5" />
              ) : (
                <Pause aria-hidden className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <BookButton>Book Online</BookButton>
          <CallButton variant="outline">Call us Now · {PRACTICE_PHONE}</CallButton>
        </div>
      </div>

      {/* Tier 1: Hims 4-column category tiles with 400ms colour-gradient cross-fade on hover */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_TILES.map((tile) => {
          const content = (
            <>
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="hero-tile-title text-nav-lg font-[470] text-fg">
                  {tile.title}{" "}
                  <span className={cn("hero-tile-accent", ACCENT_TEXT[tile.accentTone])}>
                    {tile.accent}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {"badge" in tile && tile.badge ? (
                    <span
                      className={cn(
                        "hero-tile-badge inline-flex items-center rounded-pill px-2.5 py-0.5 text-caption font-medium",
                        tile.badgeClass,
                      )}
                    >
                      {tile.badge}
                    </span>
                  ) : null}
                  <ChevronRight aria-hidden className="hero-tile-icon size-4 text-fg" />
                </span>
              </div>

              <div className="relative z-10 mt-4 flex flex-1 flex-col items-center justify-center">
                <img
                  src={tile.imgSrc}
                  alt={tile.imgAlt}
                  fetchPriority="high"
                  width={480}
                  height={360}
                  className="hero-tile-media max-h-[164px] w-auto max-w-[80%] object-contain"
                />
                <span
                  aria-hidden
                  className="hero-tile-shadow mt-2 block h-2.5 w-28 rounded-full opacity-90"
                />
              </div>
            </>
          );

          const tileClass =
            "hero-tile group flex min-h-[248px] flex-col justify-between rounded-xl p-5 md:min-h-[268px]";

          if (tile.external) {
            return (
              <a
                key={tile.id}
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
                data-hover-tone={tile.hoverTone}
                className={tileClass}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={tile.id}
              to={tile.to}
              data-hover-tone={tile.hoverTone}
              className={tileClass}
            >
              {content}
            </Link>
          );
        })}
      </div>

      {/* Tier 2: Hims 3-column slim quick-action tiles with matching 400ms hover colour cross-fade */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SECONDARY_TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            data-hover-tone={tile.hoverTone}
            className="hero-tile group flex min-h-[82px] items-center justify-between gap-4 rounded-xl px-5 py-3"
          >
            <span className="hero-tile-title relative z-10 text-nav-lg font-[470] text-fg">
              {tile.title}{" "}
              <span className={cn("hero-tile-accent", ACCENT_TEXT[tile.accentTone])}>
                {tile.accent}
              </span>
            </span>
            <span className="relative z-10 flex shrink-0 items-center gap-3">
              <span className="flex h-14 w-20 flex-col items-center justify-center">
                <img
                  src={tile.imgSrc}
                  alt={tile.imgAlt}
                  loading="eager"
                  width={160}
                  height={112}
                  className="hero-tile-media max-h-12 w-auto max-w-full object-contain"
                />
                <span
                  aria-hidden
                  className="hero-tile-shadow mt-0.5 block h-1.5 w-12 rounded-full opacity-80"
                />
              </span>
              <ChevronRight aria-hidden className="hero-tile-icon size-4 text-fg" />
            </span>
          </Link>
        ))}

        <Link
          to="/services"
          data-hover-tone="sky-gold"
          className="hero-tile group flex min-h-[82px] items-center justify-between gap-4 rounded-xl px-5 py-4"
        >
          <span className="hero-tile-title relative z-10 text-nav-lg font-[470] text-fg">
            Browse all <span className="hero-tile-accent text-copper">treatments</span>
          </span>
          <Search aria-hidden className="hero-tile-icon relative z-10 size-5 shrink-0 text-fg" />
        </Link>
      </div>

      {/* Tier 3: Full-width Hims editorial feature banner (steady frame, 1.03 smooth media zoom) */}
      <div className="group relative mt-4 overflow-hidden rounded-xl bg-brown-deep text-white">
        <img
          src="/images/generated/home-hero-banner.jpg"
          alt="Sunlit modern Pav Dental studio lounge with walnut cabinetry and cream dental chair"
          fetchPriority="high"
          width={1600}
          height={900}
          className="absolute inset-0 size-full object-cover object-center transition-transform duration-300 ease-smooth group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-brown-deep/95 via-brown-deep/80 to-brown-deep/20 transition-opacity duration-200 ease-linear group-hover:opacity-95"
        />

        <div className="relative z-10 grid items-end gap-8 p-6 sm:p-10 md:min-h-[380px] md:grid-cols-[1.25fr_0.75fr] md:p-12 lg:p-14">
          <div className="max-w-xl">
            <p className="text-caption font-medium text-gold">ACCESSIBLE SMILES</p>
            <h2 className="mt-2 text-h2 text-white">
              Complete Dental Check-Up <span className="text-gold">£35</span>
            </h2>
            <p className="mt-4 text-lead text-white/90">
              Only £7.60 more than the NHS fee (£27.40), with faster access and premium service.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <BookButton variant="gold">Book - £35</BookButton>
              <Link
                to="/services/emergency-dental"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-white/25 bg-white/10 px-6 text-label text-white t-colors hover:bg-white/20"
              >
                <span>Emergency Dentist · £45</span>
                <ChevronRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-brown-deep/90 p-5 md:max-w-sm md:justify-self-end">
            <p className="text-caption font-medium text-butter">24/7 EMERGENCY CARE</p>
            <p className="text-body text-white">
              Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays.
            </p>
            <p className="text-small text-white/80">
              £45 consultation · £90* out-of-hours consultation
            </p>
            <Link
              to="/services/aesthetics"
              className="mt-1 inline-flex items-center gap-1.5 text-small font-medium text-gold underline underline-offset-4 t-colors hover:text-white"
            >
              <span>FACIAL AESTHETICS — Learn more</span>
              <ChevronRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
