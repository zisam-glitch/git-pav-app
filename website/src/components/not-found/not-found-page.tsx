import { ChevronRight, Phone } from "lucide-react";
import { BookButton, CallButton, Heading, Section } from "@/components/hims";
import { ACCENT_TEXT } from "@/components/hims/tones";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { NOT_FOUND } from "@/content/not-found";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

const HOVER_TONES = ["terracotta", "blue", "copper", "sky-gold"] as const;

const FEATURED_SHORTCUTS = [
  {
    href: "/services/emergency-dental",
    title: "Emergency",
    accent: "Dentist",
    accentTone: "sky" as const,
    hoverTone: "blue" as const,
    imgSrc: "/images/generated/home-tile-emergency.png",
    imgAlt: "Minimalist midnight-navy and gold dental care capsule floating on warm cream",
  },
  {
    href: "/services/general-dentistry",
    title: "General",
    accent: "Dentistry",
    accentTone: "terracotta" as const,
    hoverTone: "terracotta" as const,
    imgSrc: "/images/generated/home-tile-general.png",
    imgAlt: "Minimalist brushed titanium dental care instrument",
  },
  {
    href: "/services/aesthetics",
    title: "Facial",
    accent: "Aesthetics",
    accentTone: "copper" as const,
    hoverTone: "copper" as const,
    imgSrc: "/images/generated/home-tile-aesthetics.png",
    imgAlt: "Frosted amber glass serum bottle beside a travertine pebble on warm cream",
  },
  {
    href: "/services/whitening",
    title: "Teeth",
    accent: "Whitening",
    accentTone: "sky" as const,
    hoverTone: "sky-gold" as const,
    imgSrc: "/images/generated/home-tile-whitening.png",
    imgAlt: "Matte porcelain whitening applicator pen with sage tray case on warm cream",
  },
] as const;

/**
 * Shown for an address that is no page. The response is a real 404 and the head says noindex
 * (see the root route), so search engines drop the address; people get the site's header, footer
 * and the pages they most likely wanted.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-fg">
      <Header />
      <main className="flex-1">
        <Section theme="white" width="wide" space="default">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-block rounded-pill border border-border bg-cream px-4 py-1.5 text-caption font-medium text-terracotta">
                {NOT_FOUND.code}
              </span>
              <Heading
                as="h1"
                size="hero"
                accent="not found"
                tone="terracotta"
                inline
                className="mt-4"
              >
                Page
              </Heading>
              <p className="mt-4 text-lead text-muted">{NOT_FOUND.text}</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <BookButton>{NOT_FOUND.bookLabel}</BookButton>
              <CallButton variant="outline" />
            </div>
          </div>

          {/* Hims .hero-tile visual treatment shortcuts with 400ms gradient cross-fade */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_SHORTCUTS.map((tile) => (
              <a
                key={tile.href}
                href={tile.href}
                data-hover-tone={tile.hoverTone}
                className="hero-tile group flex min-h-[228px] flex-col justify-between rounded-xl p-5"
              >
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span className="hero-tile-title text-nav-lg font-[470] text-fg">
                    {tile.title}{" "}
                    <span className={cn("hero-tile-accent", ACCENT_TEXT[tile.accentTone])}>
                      {tile.accent}
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" className="hero-tile-icon size-4 text-fg" />
                </div>

                <div className="relative z-10 mt-4 flex flex-1 flex-col items-center justify-center">
                  <img
                    src={tile.imgSrc}
                    alt={tile.imgAlt}
                    width={360}
                    height={270}
                    className="hero-tile-media max-h-[136px] w-auto max-w-[78%] object-contain"
                  />
                  <span
                    aria-hidden="true"
                    className="hero-tile-shadow mt-2 block h-2 w-24 rounded-full opacity-90"
                  />
                </div>
              </a>
            ))}
          </div>

          {/* All 8 quick navigation links using Hims .hero-tile slim tiles */}
          <ul className="mt-4 grid list-none grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {NOT_FOUND.links.map((link, index) => {
              const hoverTone = HOVER_TONES[index % HOVER_TONES.length];
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-hover-tone={hoverTone}
                    className="hero-tile group flex min-h-[68px] items-center justify-between rounded-xl px-5 py-4 text-fg"
                  >
                    <span className="hero-tile-title relative z-10 text-nav-lg font-[470] text-fg">
                      {link.label}
                    </span>
                    <ChevronRight
                      className="hero-tile-icon relative z-10 size-4 shrink-0 text-fg transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* High-contrast Hims dark brown emergency banner */}
          <div className="mt-10 flex flex-col justify-between gap-4 rounded-xl bg-brown p-6 text-white sm:flex-row sm:items-center md:p-8">
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-pill bg-gold/15 text-gold">
                <Phone className="size-4" aria-hidden="true" />
              </span>
              <p className="text-body text-white/90">
                {NOT_FOUND.pain}{" "}
                <a
                  href={PRACTICE_PHONE_HREF}
                  className="whitespace-nowrap font-medium text-gold underline underline-offset-4 hover:text-white"
                >
                  {PRACTICE_PHONE}
                </a>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2.5">
              <BookButton variant="gold" size="sm">
                {NOT_FOUND.bookLabel}
              </BookButton>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
