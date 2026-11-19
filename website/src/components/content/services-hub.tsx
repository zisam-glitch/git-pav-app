import type { LinkProps } from "@tanstack/react-router";
import { BookButton, CallButton, CtaBand, Heading, Section, TileLink } from "@/components/hims";
import { LIVE_PAGES } from "@/content/live-pages";
import { SERVICE_PAGES } from "@/content/site-links";

type ServiceCard = {
  title: string;
  text: string;
  href: LinkProps["to"];
  badge?: string;
};

const BUILT_HREFS = new Map<string, LinkProps["to"]>([
  ...SERVICE_PAGES.map((page): [string, LinkProps["to"]] => [
    page.href,
    page.href as LinkProps["to"],
  ]),
  ["/services/finance", "/pricing"],
  ["/services/regestration", "/contact-us"],
]);

function getBuiltServices(): ServiceCard[] {
  const cardsBlock = LIVE_PAGES["/services"].blocks.find((block) => block.kind === "cards");
  if (!cardsBlock || cardsBlock.kind !== "cards") return [];

  const services: ServiceCard[] = [];
  for (const item of cardsBlock.items) {
    const href = BUILT_HREFS.get(item.href);
    if (!href) continue;
    services.push({
      title: item.title,
      text: item.text,
      href,
      badge: item.badge,
    });
  }
  return services;
}

/** The /services hub: live page heading and a Hims TileLink grid of the 13 built services. */
export function ServicesHub() {
  const servicesPage = LIVE_PAGES["/services"];
  const services = getBuiltServices();

  return (
    <>
      <Section theme="cream" width="wide" space="sm">
        <Heading as="h1" size="hero" accent="Services" tone="terracotta" inline>
          {servicesPage.heading.replace(/\s+Services$/, "")}
        </Heading>
        <div className="mt-6 flex flex-wrap gap-3">
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" />
        </div>
      </Section>

      <Section theme="white" width="wide" space="default">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={String(service.href)} className="flex">
              <TileLink
                to={service.href}
                tone="cream"
                title={service.title}
                description={
                  <>
                    <span className="block">{service.text}</span>
                    {service.badge ? (
                      <span className="mt-3 inline-flex rounded-pill border border-border bg-white px-3 py-1 text-caption font-medium text-fg">
                        {service.badge}
                      </span>
                    ) : null}
                  </>
                }
                className="w-full justify-between p-5 md:p-6"
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
