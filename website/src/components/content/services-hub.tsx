import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  ACCENT_TEXT,
  BookButton,
  CallButton,
  CtaBand,
  Heading,
  Section,
  type AccentTone,
} from "@/components/hims";
import { LIVE_PAGES } from "@/content/live-pages";
import { SERVICE_PAGES } from "@/content/site-links";
import { cn } from "@/lib/utils";

type HoverTone = "terracotta" | "blue" | "copper" | "sky-gold";

type ServiceCard = {
  title: string;
  leadWord: string;
  accentWord?: string;
  text: string;
  href: LinkProps["to"];
  label?: string;
  badge?: string;
  hoverTone: HoverTone;
  accentTone: AccentTone;
};

const HOVER_CONFIG: Record<
  string,
  { hoverTone: HoverTone; accentTone: AccentTone; label?: string }
> = {
  "/services/emergency-dental": {
    hoverTone: "blue",
    accentTone: "clay",
    label: "24/7 Urgent Care",
  },
  "/services/tooth-extraction": {
    hoverTone: "terracotta",
    accentTone: "terracotta",
    label: "From £95",
  },
  "/services/root-canal": { hoverTone: "copper", accentTone: "copper", label: "From £195" },
  "/services/oral-hygiene": { hoverTone: "sky-gold", accentTone: "clay", label: "From £45" },
  "/services/general-dentistry": {
    hoverTone: "terracotta",
    accentTone: "terracotta",
    label: "Check-Up £35",
  },
  "/services/dentures": { hoverTone: "copper", accentTone: "copper", label: "From £495" },
  "/services/whitening": {
    hoverTone: "sky-gold",
    accentTone: "terracotta",
    label: "In-Clinic & Home",
  },
  "/services/cosmetic": { hoverTone: "terracotta", accentTone: "clay", label: "Smile Design" },
  "/services/aesthetics": { hoverTone: "copper", accentTone: "copper", label: "Clinician-Led" },
  "/services/custom-grillz": { hoverTone: "sky-gold", accentTone: "clay", label: "Custom Crafted" },
  "/services/mouthguards": { hoverTone: "blue", accentTone: "clay", label: "Custom Fit" },
  "/services/mobile-dentistry": { hoverTone: "copper", accentTone: "copper" },
  "/services/virtual-dentistry": { hoverTone: "blue", accentTone: "clay" },
  "/services/finance": {
    hoverTone: "sky-gold",
    accentTone: "clay",
    label: "Payment Options",
  },
  "/services/regestration": {
    hoverTone: "terracotta",
    accentTone: "terracotta",
    label: "Patient Registration",
  },
};

const BUILT_HREFS = new Map<string, LinkProps["to"]>(
  SERVICE_PAGES.map((page): [string, LinkProps["to"]] => [page.href, page.href as LinkProps["to"]]),
);

function splitTitleWords(title: string): { leadWord: string; accentWord?: string } {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) return { leadWord: title };
  return {
    leadWord: parts.slice(0, -1).join(" "),
    accentWord: parts[parts.length - 1],
  };
}

function getBuiltServices(): ServiceCard[] {
  const cardsBlock = LIVE_PAGES["/services"].blocks.find((block) => block.kind === "cards");
  if (!cardsBlock || cardsBlock.kind !== "cards") return [];

  const services: ServiceCard[] = [];
  for (const item of cardsBlock.items) {
    const href = BUILT_HREFS.get(item.href);
    if (!href) continue;
    const config = HOVER_CONFIG[item.href] ?? {
      hoverTone: "terracotta" as const,
      accentTone: "terracotta" as const,
    };
    const { leadWord, accentWord } = splitTitleWords(item.title);
    services.push({
      title: item.title,
      leadWord,
      accentWord,
      text: item.text,
      href,
      label: config.label,
      badge: item.badge,
      hoverTone: config.hoverTone,
      accentTone: config.accentTone,
    });
  }
  return services;
}

/** The /services hub: live page heading and a Hims interactive .hero-tile directory of all 15 built services. */
export function ServicesHub() {
  const servicesPage = LIVE_PAGES["/services"];
  const services = getBuiltServices();

  return (
    <>
      <Section theme="cream" width="wide" space="sm" className="pt-6 md:pt-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-white px-3.5 py-1.5 text-caption font-medium text-terracotta">
              <span aria-hidden className="size-1.5 rounded-full bg-terracotta" />
              786 Leeds Road, Bradford · Open 24/7
            </p>
            <Heading
              as="h1"
              size="hero"
              accent="Services"
              tone="terracotta"
              inline
              className="mt-4"
            >
              {servicesPage.heading.replace(/\s+Services$/, "")}
            </Heading>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
        </div>
      </Section>

      <Section theme="white" width="wide" space="default">
        <ul className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={String(service.href)} className="flex">
              <Link
                to={service.href}
                data-hover-tone={service.hoverTone}
                className="hero-tile group flex min-h-[210px] w-full flex-col justify-between rounded-xl border border-border p-5 md:p-6"
              >
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <span className="hero-tile-title text-h4 font-[470] text-fg">
                    {service.accentWord ? (
                      <>
                        {service.leadWord}{" "}
                        <span className={cn("hero-tile-accent", ACCENT_TEXT[service.accentTone])}>
                          {service.accentWord}
                        </span>
                      </>
                    ) : (
                      <span className={cn("hero-tile-accent", ACCENT_TEXT[service.accentTone])}>
                        {service.leadWord}
                      </span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    {service.badge ? (
                      <span className="hero-tile-badge inline-flex items-center rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-fg">
                        {service.badge}
                      </span>
                    ) : service.label ? (
                      <span className="hero-tile-badge inline-flex items-center rounded-pill bg-white/80 px-2.5 py-0.5 text-caption font-medium text-fg">
                        {service.label}
                      </span>
                    ) : null}
                    <ChevronRight
                      aria-hidden
                      className="hero-tile-icon mt-0.5 size-5 shrink-0 text-fg"
                    />
                  </span>
                </div>

                <div className="relative z-10 mt-6 border-t border-black/8 pt-4">
                  <span className="hero-tile-title block text-small leading-relaxed text-muted">
                    {service.text}
                  </span>
                  <div className="mt-3 flex items-center justify-between text-caption font-medium">
                    <span className="hero-tile-accent text-terracotta">
                      {service.label ?? service.title}
                    </span>
                    <span className="hero-tile-title tabular-nums text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        theme="brown"
        title="Ready for dental care"
        accent="that fits your life?"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        786 Leeds Road, Bradford, BD3 9TY · Open 00:00 – 24:00, seven days a week.
      </CtaBand>
    </>
  );
}
