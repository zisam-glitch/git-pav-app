import type { LinkProps } from "@tanstack/react-router";
import { BookButton, CallButton, CtaBand, Media, Section } from "@/components/hims";
import { CategoryHero } from "@/components/hims/category-hero";
import { Chip } from "@/components/hims/chip";
import { ServiceTile } from "@/components/hims/service-tile";
import { LIVE_PAGES } from "@/content/live-pages";
import { SERVICE_PAGES } from "@/content/site-links";

type ServiceCard = {
  title: string;
  leadWord: string;
  accentWord?: string;
  text: string;
  href: LinkProps["to"];
  badge?: string;
  image?: { src: string; width: number; height: number };
};

/** Pictures already on the site for each service (the page heroes). Finance and registration have none yet. */
const TILE_IMAGES: Record<string, { src: string; width: number; height: number }> = {
  "/services/emergency-dental": {
    src: "/images/generated/emergency-dental-hero.jpg",
    width: 1200,
    height: 896,
  },
  "/services/tooth-extraction": {
    src: "/images/generated/tooth-extraction-hero.jpg",
    width: 1200,
    height: 896,
  },
  "/services/root-canal": {
    src: "/images/generated/root-canal-hero.jpg",
    width: 1200,
    height: 896,
  },
  "/services/oral-hygiene": {
    src: "/images/generated/oral-hygiene-hero.jpg",
    width: 1200,
    height: 896,
  },
  "/services/general-dentistry": {
    src: "/images/generated/general-dentistry-hero.jpg",
    width: 1200,
    height: 896,
  },
  "/services/dentures": { src: "/images/generated/dentures-hero.jpg", width: 1200, height: 896 },
  "/services/whitening": { src: "/images/generated/whitening-hero.jpg", width: 1376, height: 768 },
  "/services/cosmetic": { src: "/images/generated/cosmetic-hero.jpg", width: 1376, height: 768 },
  "/services/aesthetics": {
    src: "/images/generated/aesthetics-hero.jpg",
    width: 1376,
    height: 768,
  },
  "/services/custom-grillz": {
    src: "/images/generated/custom-grillz-hero.jpg",
    width: 1376,
    height: 768,
  },
  "/services/mouthguards": {
    src: "/images/generated/mouthguards-hero.jpg",
    width: 1200,
    height: 896,
  },
  "/services/mobile-dentistry": {
    src: "/images/generated/mobile-dentistry-hero.jpg",
    width: 1376,
    height: 768,
  },
  "/services/virtual-dentistry": {
    src: "/images/generated/virtual-dentistry-hero.jpg",
    width: 1200,
    height: 896,
  },
  "/services/finance": { src: "/images/generated/pricing-hero.jpg", width: 1200, height: 896 },
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
    const { leadWord, accentWord } = splitTitleWords(item.title);
    services.push({
      title: item.title,
      leadWord,
      accentWord,
      text: item.text,
      href,
      badge: item.badge,
      image: TILE_IMAGES[item.href],
    });
  }
  return services;
}

/**
 * The /services hub, built like a Hims category page (`/hair-loss.html`): a cream hero with the H1 and the
 * buttons, then a grid of picture tiles (one per built service page, with the live blurb), then the closing
 * call to action. Every tile is one link, in the live order.
 */
export function ServicesHub() {
  const servicesPage = LIVE_PAGES["/services"];
  const services = getBuiltServices();

  return (
    <>
      <CategoryHero
        title={servicesPage.heading.replace(/\s+Services$/, "")}
        accent="Services"
        actions={
          <>
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </>
        }
      />

      <Section theme="white" space="none" className="py-8 md:py-[60px]" aria-label="All services">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={String(service.href)}>
              <ServiceTile
                to={service.href}
                media={
                  service.image ? (
                    <Media
                      src={service.image.src}
                      alt={`${service.leadWord}${service.accentWord ? ` ${service.accentWord}` : ""}`}
                      width={service.image.width}
                      height={service.image.height}
                      ratio="4 / 3"
                      tone="cream"
                      className="rounded-md"
                    />
                  ) : (
                    // Placeholder until the "services-registration" picture exists (see Images needed).
                    <span
                      aria-hidden
                      className="block rounded-md bg-tile-sage"
                      style={{ aspectRatio: "4 / 3" }}
                    />
                  )
                }
                title={
                  service.accentWord ? (
                    <>
                      {service.leadWord}{" "}
                      <span className="text-terracotta">{service.accentWord}</span>
                    </>
                  ) : (
                    <span className="text-terracotta">{service.leadWord}</span>
                  )
                }
                description={service.text}
                chip={service.badge ? <Chip tone="gold">{service.badge}</Chip> : undefined}
              />
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
