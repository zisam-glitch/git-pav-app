import { ChevronRight, Pause, Play, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section } from "@/components/hims";
import { ACCENT_TEXT } from "@/components/hims/tones";
import { BOOKING_URL } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

const HERO_PHRASES = [
  { label: "Exceptional dentistry", tone: "terracotta" as const },
  { label: "24/7 emergency care", tone: "sky" as const },
  { label: "Teeth whitening", tone: "copper" as const },
  { label: "Facial aesthetics", tone: "clay" as const },
] as const;

const FEATURED_TILES = [
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
    imgSrc: "/images/home/tile-case.webp",
    imgAlt: "Soft 3D sky-blue matte tablet with an engraved tooth and a plus sign",
  },
  {
    id: "aesthetics",
    title: "Facial",
    accent: "Aesthetics",
    accentTone: "copper" as const,
    hoverTone: "copper" as const,
    to: "/services/aesthetics" as const,
    external: false,
    imgSrc: "/images/home/tile-vial.webp",
    imgAlt: "Soft 3D frosted glass vial with a gold cap beside a slim syringe",
  },
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
    imgSrc: "/images/home/tile-mirror.webp",
    imgAlt:
      "Soft 3D off-white matte tablet speckled with terracotta, with an engraved dental mirror",
  },
  {
    id: "whitening",
    title: "Teeth",
    accent: "Whitening",
    accentTone: "sky" as const,
    hoverTone: "sky-gold" as const,
    to: "/services/whitening" as const,
    external: false,
    imgSrc: "/images/home/tile-strips.webp",
    imgAlt: "Soft 3D whitening strips box with two translucent strips and a small gel syringe",
  },
] as const;

const SECONDARY_TILES = [
  {
    title: "General",
    accent: "Dentistry",
    accentTone: "terracotta" as const,
    hoverTone: "terracotta" as const,
    to: "/services/general-dentistry" as const,
    imgSrc: "/images/home/tile-tooth.webp",
    imgAlt: "Soft 3D cream molar tooth with a small white filling",
  },
  {
    title: "Mobile",
    accent: "Dentistry",
    accentTone: "copper" as const,
    hoverTone: "copper" as const,
    to: "/services/mobile-dentistry" as const,
    imgSrc: "/images/home/tile-van.webp",
    imgAlt: "Soft 3D teal toy-style mobile dentistry van with a white roof and an embossed tooth",
  },
] as const;

/** The Hims home hero: big two-tone headline, one line of support, then 4 tall tiles over 3 slim ones. */
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
    <Section id="top" theme="white" space="none" className="pt-8 pb-10 md:pt-12 md:pb-14">
      <h1 className="text-display text-fg">
        <span className={cn("block t-colors", ACCENT_TEXT[activePhrase.tone])}>
          {activePhrase.label}
        </span>{" "}
        <span className="block">that you can rely on</span>
      </h1>
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

      <div className="mt-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="hero-tile-media size-[104px] object-contain"
                />
                <span
                  aria-hidden
                  className="hero-tile-shadow mt-2 block h-2.5 w-28 rounded-full opacity-90"
                />
              </div>
            </>
          );
          const tileClass =
            "hero-tile group flex min-h-[248px] flex-col justify-between rounded-[28px] p-5 md:min-h-[252px]";
          if ("external" in tile && tile.external) {
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
            <Link key={tile.id} to={tile.to} data-hover-tone={tile.hoverTone} className={tileClass}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {SECONDARY_TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            data-hover-tone={tile.hoverTone}
            className="hero-tile group flex min-h-[82px] items-center justify-between gap-4 rounded-[28px] px-5 py-3"
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
                  className="hero-tile-media size-10 object-contain"
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
          className="hero-tile group flex min-h-[82px] items-center justify-between gap-4 rounded-[28px] px-5 py-4"
        >
          <span className="hero-tile-title relative z-10 text-nav-lg font-[470] text-fg">
            Browse all <span className="hero-tile-accent text-copper">treatments</span>
          </span>
          <Search aria-hidden className="hero-tile-icon relative z-10 size-5 shrink-0 text-fg" />
        </Link>
      </div>
    </Section>
  );
}
