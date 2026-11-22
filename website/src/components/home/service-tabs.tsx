import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { useState } from "react";
import { BookButton, ButtonLink, Carousel, Heading, Section } from "@/components/hims";
import { cn } from "@/lib/utils";

type ServiceRoute =
  | "/services/emergency-dental"
  | "/services/mobile-dentistry"
  | "/services/aesthetics"
  | "/services/general-dentistry"
  | "/services/tooth-extraction"
  | "/services/whitening";

interface LiveHomeService {
  id: string;
  tabLabel: string;
  badge: string;
  heading: string;
  subtitle: string;
  copy: string;
  cardHeadline: string;
  ctaLabel: string;
  to: ServiceRoute;
  imgSrc: string;
  imgAlt: string;
  contactNote?: { label: string; href: string };
}

const LIVE_HOME_SERVICES: readonly LiveHomeService[] = [
  {
    id: "emergency-dental",
    tabLabel: "Emergency Dental",
    badge: "24/7 Urgent Care",
    heading: "24/7 Emergency Dental Services in Bradford",
    subtitle: "We offer same day emergency dental care 24-hours a day, seven days a week.",
    copy: "We understand that dental emergencies can occur at any time, which is why we offer same day emergency dental care 24-hours a day, seven days a week, including National and Bank Holidays. Our dedicated team is always on hand to provide immediate and effective dental treatment, ensuring that you receive the care you need when you need it most.",
    cardHeadline: "Same-day emergency dental care",
    ctaLabel: "Read More",
    to: "/services/emergency-dental",
    imgSrc: "/images/generated/home-card-emergency.jpg",
    imgAlt: "Serene modern dental suite lit by a warm brass pendant lamp at twilight",
  },
  {
    id: "aesthetics",
    tabLabel: "Aesthetics",
    badge: "Facial Aesthetics",
    heading: "Pav Dental Aesthetics Award-Winning Clinic",
    subtitle:
      "Rediscover Your Youthful Radiance with Our Premier Aesthetic Treatments — Botox, dermal fillers, and chemical peels.",
    copy: "At Pav Dental Aesthetics, we offer a range of top-quality aesthetic treatments designed to enhance your natural beauty and boost your confidence. Our services include Botox, dermal fillers, chemical peels, lip enhancement, and microneedling, all performed using premium-grade products for exceptional results. Our dedicated team provides expert guidance, ensuring personalized care and a commitment to quality. Contact us at 0800 099 6375 to learn more about our offers and packages, and experience the finest aesthetic treatments available.",
    cardHeadline: "Rediscover Your Youthful Radiance",
    ctaLabel: "Learn more",
    to: "/services/aesthetics",
    imgSrc: "/images/generated/home-card-aesthetics.jpg",
    imgAlt: "Frosted amber serum bottle and ceramic cream jar on sunlit walnut shelf",
    contactNote: { label: "Aesthetics enquiries: 0800 099 6375", href: "tel:08000996375" },
  },
  {
    id: "whitening",
    tabLabel: "Whitening",
    badge: "Teeth Whitening",
    heading: "Brighten Your Smile with Advanced Whitening Solutions",
    subtitle: "Designed by Dentists, Developed for You: Explore Our Premium Whitening Ranges",
    copy: "Discover a carefully curated selection of whitening ranges at Pav Dental, meticulously crafted to effectively remove stains and discoloration, giving you the confidence to flash your pearly whites. From professional whitening strips to in-office treatments, our range offers convenience, effectiveness, and professional-grade results. Book your appointment today and experience the difference of our award-winning whitening treatments.",
    cardHeadline: "Brighten your smile safely",
    ctaLabel: "Explore whitening",
    to: "/services/whitening",
    imgSrc: "/images/generated/home-card-whitening.jpg",
    imgAlt: "Porcelain whitening applicator pen and pastel sage dental tray on travertine",
  },
  {
    id: "general-dentistry",
    tabLabel: "General Dentistry",
    badge: "Preventive Care",
    heading: "General Dentistry Gateway to Lifelong Oral Health",
    subtitle: "Comprehensive Care from Regular Check-Ups to Advanced Treatments",
    copy: "Welcome to your guide to General Dentistry, the foundation of oral health and wellness. From routine check-ups and dental fillings to complex root canals and extractions, general dentistry services are designed to maintain and enhance your dental health. Discover the importance of early diagnosis, preventative care, and the wide range of treatments available to ensure a lifetime of healthy smiles.",
    cardHeadline: "Gateway to lifelong oral health",
    ctaLabel: "Explore general care",
    to: "/services/general-dentistry",
    imgSrc: "/images/generated/home-card-general.jpg",
    imgAlt: "Matte cream ceramic tray with brushed titanium dental mirror on dark walnut",
  },
  {
    id: "tooth-extraction",
    tabLabel: "Tooth Extraction",
    badge: "Same-Day Relief",
    heading: "Swift Tooth Extraction Your Trusted Partner in Oral Health",
    subtitle: "Experience Immediate Relief with Our Same-Day Tooth Extraction Services",
    copy: "At Pav Dental, our experienced oral surgeons use the latest techniques and technologies to ensure a comfortable and effective treatment experience. We offer guaranteed same-day tooth extractions for immediate pain relief. With transparent pricing for simple, intermediate, and complex extractions, you can trust us for professional care that prioritizes your needs. Follow our post-operative instructions for a smooth recovery, and book your appointment today to receive compassionate, state-of-the-art dental care.",
    cardHeadline: "Same-day tooth extraction care",
    ctaLabel: "Explore extractions",
    to: "/services/tooth-extraction",
    imgSrc: "/images/generated/home-card-extraction.jpg",
    imgAlt: "Minimalist stone apothecary vessel and precision dental instrument on dark travertine",
  },
  {
    id: "mobile-dentistry",
    tabLabel: "Mobile Dentistry",
    badge: "At-Home Care",
    heading: "Mobile Dentistry at Your Doorstep",
    subtitle: "Enabling our patients to access treatment in the comfort of their own home.",
    copy: "Pav Dental Mobile offers comprehensive dental services delivered right to your home. With extensive experience in both traditional and mobile dentistry, we ensure top-notch care using the latest technology and equipment. Ideal for care homes, we help make your home oral-health CQC-compliant and work with NHS partners. Our modern, well-equipped mobile surgery serves patients across the UK, bringing convenience and expert dental care directly to your doorstep. Contact us at hello@pavdental.com to schedule your appointment today.",
    cardHeadline: "Mobile dentistry at your doorstep",
    ctaLabel: "Explore mobile care",
    to: "/services/mobile-dentistry",
    imgSrc: "/images/generated/home-card-mobile.jpg",
    imgAlt: "Compact matte sand and walnut portable dental care trunk by sunlit curtains",
    contactNote: { label: "Email hello@pavdental.com", href: "mailto:hello@pavdental.com" },
  },
] as const;

export function ServiceTabs() {
  const [activeId, setActiveId] = useState<string>(LIVE_HOME_SERVICES[0].id);
  const active =
    LIVE_HOME_SERVICES.find((service) => service.id === activeId) ?? LIVE_HOME_SERVICES[0];

  return (
    <Section id="services" theme="white" space="default">
      {/* Header matching Mobbin Hims "Get a personalized treatment plan with doctor-trusted solutions" */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <Heading as="h2" size="h2" accent="with clinician-led dental care" tone="terracotta">
            Get a personalised treatment plan
          </Heading>
        </div>
        <ButtonLink to="/services" variant="outline" className="shrink-0 self-start md:self-auto">
          Explore all services
        </ButtonLink>
      </div>

      {/* Hims editorial 3:4 portrait treatment cards carousel (Mobbin 81c02fb1) */}
      <Carousel label="Featured dental treatments" className="mt-8">
        {LIVE_HOME_SERVICES.map((service) => (
          <Link
            key={service.id}
            to={service.to}
            className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-xl bg-brown-deep p-5 text-white t-lift md:p-6"
          >
            <img
              src={service.imgSrc}
              alt={service.imgAlt}
              loading="lazy"
              width={768}
              height={1024}
              className="t-zoom absolute inset-0 size-full object-cover object-center"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20"
            />

            <div className="relative z-10">
              <span className="inline-flex items-center rounded-pill bg-brown-deep/85 px-3 py-1 text-caption font-medium text-white">
                {service.tabLabel}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-h4 text-white">{service.cardHeadline}</h3>
              <span className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-pill bg-white px-5 text-small font-medium text-black t-colors group-hover:bg-cream">
                <span>{service.ctaLabel}</span>
                <ArrowRight
                  aria-hidden
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </Link>
        ))}
      </Carousel>

      {/* Interactive 6-service live detail tabs */}
      <div className="mt-12 rounded-xl bg-tile-cream p-6 md:p-10">
        <div
          role="tablist"
          aria-label="Pav Dental services"
          className="flex flex-wrap items-center gap-2"
        >
          {LIVE_HOME_SERVICES.map((service) => {
            const isSelected = service.id === active.id;
            return (
              <button
                key={service.id}
                type="button"
                role="tab"
                id={`tab-${service.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${service.id}`}
                onClick={() => setActiveId(service.id)}
                className={cn(
                  "inline-flex h-11 items-center rounded-pill border px-5 text-small font-medium t-colors",
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-border bg-white text-fg hover:border-fg",
                )}
              >
                {service.tabLabel}
              </button>
            );
          })}
        </div>

        {LIVE_HOME_SERVICES.map((service) => {
          const isSelected = service.id === active.id;
          return (
            <div
              key={service.id}
              role="tabpanel"
              id={`panel-${service.id}`}
              aria-labelledby={`tab-${service.id}`}
              hidden={!isSelected}
              className={cn(
                "mt-8 items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12",
                isSelected ? "grid" : "hidden",
              )}
            >
              <div>
                <p className="text-caption font-medium text-copper">{service.badge}</p>
                <h3 className="mt-2 text-h3-md text-fg">{service.heading}</h3>
                <p className="mt-3 text-lead text-fg">{service.subtitle}</p>
                <p className="mt-4 text-body text-muted">{service.copy}</p>

                {service.contactNote ? (
                  <p className="mt-4">
                    <a
                      href={service.contactNote.href}
                      className="inline-flex items-center gap-2 text-small font-medium text-terracotta underline underline-offset-4 t-colors hover:text-fg"
                    >
                      <Phone aria-hidden className="size-3.5" />
                      <span>{service.contactNote.label}</span>
                    </a>
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <ButtonLink to={service.to} variant="default">
                    Read More
                  </ButtonLink>
                  <BookButton variant="outline">Book Online</BookButton>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-sand">
                <img
                  src={service.imgSrc}
                  alt={service.imgAlt}
                  loading="lazy"
                  width={768}
                  height={576}
                  className="aspect-[4/3] size-full object-cover object-center"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
