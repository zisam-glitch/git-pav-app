import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { useState } from "react";
import { BookButton, ButtonLink } from "@/components/hims";
import { PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";
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
  phoneSrc: string;
  tabLabel: string;
  badge: string;
  heading: string;
  subtitle: string;
  copy: string;
  ctaLabel: string;
  to: ServiceRoute;
  contactNote?: { label: string; href: string };
}

/** The six services as the live home page words them. */
const SERVICES: readonly LiveHomeService[] = [
  {
    id: "emergency-dental",
    phoneSrc: "/images/home/phone-emergency.webp",
    tabLabel: "Emergency Dental",
    badge: "24/7 Urgent Care",
    heading: "24/7 Emergency Dental Services in Bradford",
    subtitle: "We offer same day emergency dental care 24-hours a day, seven days a week.",
    copy: "We understand that dental emergencies can occur at any time, which is why we offer same day emergency dental care 24-hours a day, seven days a week, including National and Bank Holidays. Our dedicated team is always on hand to provide immediate and effective dental treatment, ensuring that you receive the care you need when you need it most.",
    ctaLabel: "Read More",
    to: "/services/emergency-dental",
  },
  {
    id: "aesthetics",
    phoneSrc: "/images/home/phone-aesthetics.webp",
    tabLabel: "Aesthetics",
    badge: "Facial Aesthetics",
    heading: "Pav Dental Aesthetics Award-Winning Clinic",
    subtitle:
      "Rediscover Your Youthful Radiance with Our Premier Aesthetic Treatments — Botox, dermal fillers, and chemical peels.",
    copy: "At Pav Dental Aesthetics, we offer a range of top-quality aesthetic treatments designed to enhance your natural beauty and boost your confidence. Our services include Botox, dermal fillers, chemical peels, lip enhancement, and microneedling, all performed using premium-grade products for exceptional results. Our dedicated team provides expert guidance, ensuring personalized care and a commitment to quality. Contact us at 0800 099 6375 to learn more about our offers and packages, and experience the finest aesthetic treatments available.",
    ctaLabel: "Learn more",
    to: "/services/aesthetics",
    contactNote: { label: "Aesthetics enquiries: 0800 099 6375", href: "tel:08000996375" },
  },
  {
    id: "whitening",
    phoneSrc: "/images/home/phone-whitening.webp",
    tabLabel: "Whitening",
    badge: "Teeth Whitening",
    heading: "Brighten Your Smile with Advanced Whitening Solutions",
    subtitle: "Designed by Dentists, Developed for You: Explore Our Premium Whitening Ranges",
    copy: "Discover a carefully curated selection of whitening ranges at Pav Dental, meticulously crafted to effectively remove stains and discoloration, giving you the confidence to flash your pearly whites. From professional whitening strips to in-office treatments, our range offers convenience, effectiveness, and professional-grade results. Book your appointment today and experience the difference of our award-winning whitening treatments.",
    ctaLabel: "Explore whitening",
    to: "/services/whitening",
  },
  {
    id: "general-dentistry",
    phoneSrc: "/images/home/phone-general.webp",
    tabLabel: "General Dentistry",
    badge: "Preventive Care",
    heading: "General Dentistry Gateway to Lifelong Oral Health",
    subtitle: "Comprehensive Care from Regular Check-Ups to Advanced Treatments",
    copy: "Welcome to your guide to General Dentistry, the foundation of oral health and wellness. From routine check-ups and dental fillings to complex root canals and extractions, general dentistry services are designed to maintain and enhance your dental health. Discover the importance of early diagnosis, preventative care, and the wide range of treatments available to ensure a lifetime of healthy smiles.",
    ctaLabel: "Explore general care",
    to: "/services/general-dentistry",
  },
  {
    id: "tooth-extraction",
    phoneSrc: "/images/home/phone-extraction.webp",
    tabLabel: "Tooth Extraction",
    badge: "Same-Day Relief",
    heading: "Swift Tooth Extraction Your Trusted Partner in Oral Health",
    subtitle: "Experience Immediate Relief with Our Same-Day Tooth Extraction Services",
    copy: "At Pav Dental, our experienced oral surgeons use the latest techniques and technologies to ensure a comfortable and effective treatment experience. We offer guaranteed same-day tooth extractions for immediate pain relief. With transparent pricing for simple, intermediate, and complex extractions, you can trust us for professional care that prioritizes your needs. Follow our post-operative instructions for a smooth recovery, and book your appointment today to receive compassionate, state-of-the-art dental care.",
    ctaLabel: "Explore extractions",
    to: "/services/tooth-extraction",
  },
  {
    id: "mobile-dentistry",
    phoneSrc: "/images/home/phone-mobile.webp",
    tabLabel: "Mobile Dentistry",
    badge: "At-Home Care",
    heading: "Mobile Dentistry at Your Doorstep",
    subtitle: "Enabling our patients to access treatment in the comfort of their own home.",
    copy: "Pav Dental Mobile offers comprehensive dental services delivered right to your home. With extensive experience in both traditional and mobile dentistry, we ensure top-notch care using the latest technology and equipment. Ideal for care homes, we help make your home oral-health CQC-compliant and work with NHS partners. Our modern, well-equipped mobile surgery serves patients across the UK, bringing convenience and expert dental care directly to your doorstep. Contact us at hello@pavdental.com to schedule your appointment today.",
    ctaLabel: "Explore mobile care",
    to: "/services/mobile-dentistry",
    contactNote: { label: "Email hello@pavdental.com", href: "mailto:hello@pavdental.com" },
  },
];

const POINTS = [
  "Oral hygiene advisory & assessment",
  "Dental public health insurance",
  "Free online appointment booking",
  "Various cosmetic dentistry services",
  "Special care dentistry services",
  "Oral surgery",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WALL = Array.from({ length: 20 }, (_, i) => `/images/home/wall-${String(i + 1).padStart(2, "0")}.webp`);

const STATS = [
  ["2", "Doctors / Dentist"],
  ["5", "Staffs"],
  ["25+", "Years of experience"],
  ["500+", "Happy Patients"],
] as const;

const GOLD = "text-[#ffd48a]";
const CARD = "rounded-[28px] bg-[#6b430f]/25";
const PILL =
  "inline-flex h-12 items-center justify-center rounded-pill bg-[#6b430f]/45 px-6 text-label text-white t-colors hover:bg-[#6b430f]/65";

export function ServicesFeature() {
  const [activeId, setActiveId] = useState(SERVICES[0].id);
  const active = SERVICES.find((s) => s.id === activeId) ?? SERVICES[0];
  const [ethosOpen, setEthosOpen] = useState(false);

  return (
    <section id="services" className="relative -mt-8 rounded-t-[32px] bg-[#ab742d] pt-2 pb-[4.5rem] text-white md:pb-[5.5rem]">
      <div className="wrap-bento mt-0 grid max-w-[1396px] gap-2.5 pt-10 md:pt-14 lg:grid-cols-2">
        {/* Left: the six live service blurbs, one at a time */}
        <article className={cn(CARD, "flex flex-col items-center px-6 py-10 text-center md:px-10 md:py-14")}>
          <p className={cn("text-small font-medium", GOLD)}>{active.badge}</p>
          <h2 className="mt-2 t-hims-feature text-white">{active.heading}</h2>
          <img
            src={active.phoneSrc}
            alt={`Hand holding a smartphone showing a Pav Dental ${active.tabLabel} app screen`}
            loading="lazy"
            width={773}
            height={1085}
            className="mt-6 h-auto w-[min(300px,72%)] drop-shadow-[0_18px_28px_rgba(60,30,0,0.35)]"
          />
          {active.subtitle ? (
            <p className={cn("mt-6 max-w-md t-hims-lead", GOLD)}>{active.subtitle}</p>
          ) : null}
          <div className="mt-3 w-full">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                role="tabpanel"
                id={`panel-${service.id}`}
                aria-labelledby={`tab-${service.id}`}
                hidden={service.id !== active.id}
              >
                <p className="mx-auto max-w-md t-hims-body text-white/90">{service.copy}</p>
                {service.contactNote ? (
                  <p className="mt-4">
                    <a
                      href={service.contactNote.href}
                      className={cn(
                        "inline-flex items-center gap-2 text-small font-medium underline underline-offset-4",
                        GOLD,
                      )}
                    >
                      <Phone aria-hidden className="size-3.5" />
                      <span>{service.contactNote.label}</span>
                    </a>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <ButtonLink to={active.to} variant="glass" className={cn(PILL, "mt-7 border-0")}>
            {active.ctaLabel}
          </ButtonLink>
          <div
            role="tablist"
            aria-label="Pav Dental services"
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                role="tab"
                id={`tab-${service.id}`}
                aria-selected={service.id === active.id}
                aria-controls={`panel-${service.id}`}
                onClick={() => setActiveId(service.id)}
                className={cn(
                  "inline-flex h-10 items-center rounded-pill px-4 text-small font-medium t-colors",
                  service.id === active.id
                    ? "bg-white text-[#6b430f]"
                    : "bg-[#6b430f]/35 text-white hover:bg-[#6b430f]/55",
                )}
              >
                {service.tabLabel}
              </button>
            ))}
          </div>
        </article>

        {/* Right: comprehensive services, a perspective photo wall, and the list */}
        <div className="flex flex-col gap-2.5">
          <article
            className={cn(CARD, "flex flex-1 flex-col items-center overflow-hidden pt-10 text-center md:pt-14")}
          >
            <h2 className="px-6 t-hims-feature text-white md:px-10">
              Comprehensive Dental Services:{" "}
              <span className={GOLD}>Book Online, Specialized Care, and Insurance Support</span>
            </h2>
            <p className="mt-5 max-w-md px-6 t-hims-body text-white/90">
              Providing expert oral surgery, comprehensive dental hygiene assessments, cosmetic
              dentistry, special care services, and public health insurance assistance, our clinic
              ensures top-notch care for all your dental needs. Enjoy the convenience of free online
              appointment booking to easily schedule your visits.
            </p>
            <BookNow />
            <div
              aria-hidden
              className="relative -mt-2 min-h-[300px] w-full flex-1 overflow-hidden [perspective:600px]"
            >
              <div className="absolute inset-x-[-12%] bottom-[-22%] grid grid-cols-5 gap-2.5 [transform:rotateX(38deg)] [transform-origin:50%_100%] [mask-image:linear-gradient(to_top,#000_50%,transparent)]">
                {WALL.map((src) => (
                  <div
                    key={src}
                    className="aspect-[5/4] w-full rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
              </div>
            </div>
          </article>

          <ul className={cn(CARD, "divide-y divide-white/15 px-6 py-2 md:px-10")}>
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 py-3.5 t-hims-body">
                <span aria-hidden className={cn("w-4 shrink-0 text-center t-hims-lead", GOLD)}>+</span>{" "}
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ethos: the Hims "more than a plan" card, with the stats and hours as floating chips */}
      <div className="wrap-bento mt-2.5 max-w-[1396px]">
        <article className={cn(CARD, "px-4 py-10 md:px-10 md:py-14")}>
          <div className="relative mx-auto text-center">
            <h2 className="text-[clamp(38px,4.3vw,62px)] leading-[1.02] font-[430] tracking-[-0.02em] text-white">
              Exceptional Dentistry That <span className={cn("block", GOLD)}>You Can Rely On</span>
            </h2>
            <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <ul className="hidden max-w-[260px] space-y-1 justify-self-end lg:block">
                {STATS.map(([value, label]) => (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-lg bg-[#6b430f]/80 px-3 py-2 text-left text-caption"
                  >
                    <span>{label}</span>
                    <span className={GOLD}>{value}</span>
                  </li>
                ))}
              </ul>
              <img
                src="/images/home/hassan-hims.jpg"
                alt="Dr Hassan Bhojani, founder and principal dentist at Pav Dental, in a white coat against a warm studio backdrop"
                loading="lazy"
                width={1100}
                height={1473}
                className="mx-auto aspect-[3/4] w-[min(320px,78vw)] rounded-[32px] object-cover object-top"
              />
              <div className="hidden max-w-[300px] justify-self-start lg:block">
                <HoursChips />
              </div>
            </div>
            <div className="mx-auto max-w-[760px]">
            <div
              id="ethos-text"
              className={cn(
                "mt-6 space-y-3 t-hims-lead text-white/90",
                !ethosOpen &&
                  "max-h-[7.2rem] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]",
              )}
            >
              <p>
                At Pav Dental we hold a strong ethos in delivering the best dental care possible for
                all of our patients. We believe a healthy and happy smile is true to one’s nature in
                expression of themselves and we are committed to making sure all of our patients can
                be confident and satisfied with the care they receive from the moment they walk
                through our doors. We uphold community values and believe we have an important
                responsibility in serving our community to the best our ability.
              </p>
              <p>
                We appreciate no two patients are the same and are committed to delivering care and
                treatment tailored to fulfil the dental care you deserve. Dentistry is a fundamental
                aspect of any individual well being and we are determined to ensure excellence no
                matter what your needs may be.
              </p>
            </div>
            <button
              type="button"
              aria-expanded={ethosOpen}
              aria-controls="ethos-text"
              onClick={() => setEthosOpen((v) => !v)}
              className={cn("mt-3 text-small font-medium underline underline-offset-4", GOLD)}
            >
              {ethosOpen ? "Show less" : "Read more"}
            </button>
            <p className="mt-6 text-label">Dr. Hassan Bhojani</p>
            <p className="text-small text-white/80">Founder &amp; Principal Dentist</p>
            <BookNow />
            </div>
          </div>

          {/* Below large screens the chips drop under the text */}
          <div className="mx-auto mt-10 grid max-w-[760px] gap-3 sm:grid-cols-2 lg:hidden">
            <ul className="space-y-1">
              {STATS.map(([value, label]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg bg-[#6b430f]/60 px-3 py-2 text-caption"
                >
                  <span>{label}</span>
                  <span className={GOLD}>{value}</span>
                </li>
              ))}
            </ul>
            <HoursChips />
          </div>
        </article>
      </div>

      <p className="mx-auto mt-8 max-w-[760px] px-4 text-center text-caption text-white/70">
        Open 24 hours, 7 days a week · 786 Leeds Road, Bradford, BD3 9TY
      </p>
      <Link to="/services" className="sr-only">
        Explore all services
      </Link>
    </section>
  );
}

function BookNow() {
  return (
    <div className="mt-7 flex justify-center">
      <BookButton variant="glass" className={cn(PILL, "border-0")}>
        Book Now
      </BookButton>
    </div>
  );
}

function HoursChips() {
  return (
    <div className="text-left">
      <p className="rounded-t-lg bg-[#6b430f]/80 px-3 py-2 text-caption font-medium">Working Hours</p>
      <ul className="space-y-1">
        {DAYS.map((day) => (
          <li
            key={day}
            className="flex items-center justify-between gap-3 bg-[#6b430f]/80 px-3 py-1.5 text-caption last:rounded-b-lg"
          >
            <span>{day}</span>
            <span className={cn("tabular-nums", GOLD)}>00:00 – 24:00</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 rounded-lg bg-[#6b430f]/80 px-3 py-2 text-caption">
        For private appointments.{" "}
        <a href={PRACTICE_PHONE_HREF} className={cn("underline underline-offset-2", GOLD)}>
          {PRACTICE_PHONE}
        </a>
      </p>
    </div>
  );
}
