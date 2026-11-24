import { Link } from "@tanstack/react-router";
import { CalendarCheck, Siren, Video } from "lucide-react";
import { BookButton, CallButton } from "@/components/hims";

/**
 * The About page, matched to the Hims "About the company" page on Mobbin (web sections):
 *  - a lavender gradient banner, then a big title beside a numbered "On this page" list;
 *  - "Company milestones": a title and intro on the left, a purple timeline on the right;
 *  - "by the numbers": soft white cards with line icons.
 * Every sentence is the live About copy, unchanged.
 */

const PURPLE = "#5b3fc4";
const TITLE =
  "text-[clamp(40px,5vw,72px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#1b1b1b]";
const BODY = "text-[16px] leading-[1.45] text-[#55565a]";
const SOFT_CARD = "rounded-[22px] bg-white shadow-[0_10px_36px_rgba(20,20,40,0.07)]";

const PAGE_JUMPS = [
  { label: "Our Story", href: "#our-story" },
  { label: "The Dream & Team", href: "#dream-team" },
  { label: "A Legacy Fulfilled", href: "#legacy-fulfilled" },
  { label: "The Future of Dentistry", href: "#future-dentistry" },
] as const;

const DREAM_STEPS = [
  {
    step: "Step 1",
    title: "Dream",
    body: "Envisioning a patient-centered clinic where the best dental care meets the flexibility of mobile services.",
    icon: "/images/home/about-icon-dream.webp",
  },
  {
    step: "Step 2",
    title: "Creating a Partnership",
    body: "Building a foundation of shared passion and complementary expertise.",
    icon: "/images/home/about-icon-partner.webp",
  },
  {
    step: "Step 3",
    title: "Reaching Shared Value between the Partnership",
    body: "Defining their commitment to patient well-being and professional excellence.",
    icon: "/images/home/about-icon-value.webp",
  },
  {
    step: "Step 4",
    title: "Creating a Very Detailed Roadmap",
    body: "Outlining every stage, from cutting-edge technology acquisition to community outreach.",
    icon: "/images/home/about-icon-roadmap.webp",
  },
] as const;

const LEGACY_CARDS = [
  {
    pill: "Step 5",
    title: "Executing",
    body: "Bringing this dental clinic to life, serving our community with the same care and innovation Dr. Pav championed.",
    image: "/images/home/about-executing.webp",
    alt: "Gloved dentist's hands holding a dental mirror and probe in a warm, sunlit clinic",
  },
  {
    pill: "Always",
    title: "Inspiration and Growth",
    body: "“We can achieve all our dreams if we are brave enough to pursue them.” This philosophy, shared by Dr. Pav and Dr. Hassan, will forever guide our practice.",
    image: "/images/home/about-inspiration.webp",
    alt: "A smiling dentist in a white coat against a warm sand-coloured wall (illustration, not a member of staff)",
  },
] as const;

const APP_FEATURES = [
  { icon: CalendarCheck, text: "Schedule routine checkups and cleanings at your home or office." },
  { icon: Siren, text: "Book emergency appointments for swift relief." },
  { icon: Video, text: "Consult virtually with our dentists for immediate advice." },
] as const;

export function Story() {
  return (
    <>
      {/* Hero: a centred two-tone statement (Hims "Through Hims…" section), the banner, then chips */}
      <section id="our-story" className="scroll-mt-20 bg-white pt-14 pb-14 text-center md:pt-24 md:pb-24">
        <div className="wrap-bento max-w-[1396px]">
          <h1 className="mx-auto max-w-[18ch] text-[clamp(40px,5.6vw,84px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#1b1b1b]">
            A Legacy of <span className="text-[#b5644a]">Care and Innovation</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[40rem] text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#55565a]">
            Our dental clinic isn&apos;t just about delivering exceptional oral healthcare;
            it&apos;s a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a
            passionate believer that dentistry could – and should – extend beyond traditional
            practice, providing unparalleled convenience and accessibility.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
          </div>
          <img
            src="/images/home/about-banner.webp"
            alt="A hand holding a phone with the Pav Dental app and a dentist's hand holding a mirror, among floating patient-record cards"
            width={2200}
            height={767}
            fetchPriority="high"
            className="mt-14 aspect-[2200/767] w-full rounded-[28px] object-cover"
          />
          <nav aria-label="On this page" className="mt-8">
            <p className="text-small text-[#55565a]">On this page:</p>
            <ol className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
              {PAGE_JUMPS.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#f4f1ea] py-1.5 pr-4 pl-1.5 text-[16px] text-[#1b1b1b] t-colors hover:bg-[#ebe6dc]"
                  >
                    <span
                      className="inline-flex size-7 items-center justify-center rounded-full text-[14px] text-white"
                      style={{ backgroundColor: PURPLE }}
                    >
                      {i + 1}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* The Dream and The Team: Hims "Total care, totally different" row of soft cards with line icons */}
      <section id="dream-team" className="scroll-mt-20 bg-[#f7f5f2] py-14 md:py-24">
        <div className="wrap-bento max-w-[1396px]">
          <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <h2 className={TITLE}>
              The Dream <span className="text-[#8b8d92]">and The Team</span>
            </h2>
            <p className="text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#55565a]">
              Dr. Pav&apos;s dream was shared, nurtured, and diligently planned alongside his close
              friend and colleague, Dr. Hassan. Together, they meticulously crafted a plan,
              encompassing these crucial steps:
            </p>
          </div>
          <ol className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {DREAM_STEPS.map((item) => (
              <li
                key={item.title}
                className={`${SOFT_CARD} flex min-h-[360px] flex-col justify-between p-6 md:p-7`}
              >
                <div>
                  <span
                    className="inline-flex rounded-full px-2.5 py-[3px] text-[11px] leading-none text-white"
                    style={{ backgroundColor: PURPLE }}
                  >
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-[clamp(22px,1.9vw,28px)] leading-[1.12] font-normal tracking-[-0.015em] text-[#1b1b1b]">
                    {item.title}
                  </h3>
                  <p className={`mt-3 ${BODY}`}>{item.body}</p>
                </div>
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  width={180}
                  height={180}
                  className="mt-6 size-[120px] object-contain mix-blend-multiply"
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* A Legacy Fulfilled: Hims "personalised treatment plan" tall photo cards */}
      <section id="legacy-fulfilled" className="scroll-mt-20 bg-white py-14 md:py-24">
        <div className="wrap-bento max-w-[1396px]">
          <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <h2 className={TITLE}>
              A Legacy <span className="text-[#b5644a]">Fulfilled</span>
            </h2>
            <p className="text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#55565a]">
              Tragically, Dr. Pav passed away before witnessing the clinic&apos;s realization.
              Their shared vision now rests with Dr. Hassan as a profound responsibility. Fueled by
              a deep respect for their collaboration, Dr Hassan vowed to complete the final step:
            </p>
          </div>
          <ol className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {LEGACY_CARDS.map((card) => (
              <li
                key={card.title}
                className="relative flex min-h-[460px] flex-col justify-end overflow-hidden rounded-[28px] bg-[#e9e2d6] text-white lg:min-h-[560px]"
              >
                <img
                  src={card.image}
                  alt={card.alt}
                  loading="lazy"
                  width={800}
                  height={1067}
                  className="absolute inset-0 size-full object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                />
                <div className="relative p-6 md:p-8">
                  <span className="inline-flex rounded-full bg-white/25 px-3 py-1 text-[12px] leading-none backdrop-blur">
                    {card.pill}
                  </span>
                  <h3 className="mt-3 text-[clamp(26px,2.4vw,36px)] leading-[1.08] font-normal tracking-[-0.02em]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.4] text-white/90">{card.body}</p>
                </div>
              </li>
            ))}
            <li className={`${SOFT_CARD} flex flex-col justify-center gap-6 bg-[#f7f5f2] p-7 shadow-none md:col-span-2 md:p-9 lg:col-span-1`}>
              <p className="text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#1b1b1b]">
                While we must forgive past failings and present obstacles, the future of this
                clinic demands unwavering standards. We will never compromise on the quality,
                compassion, or dedication to access that Dr. Pav envisioned.
              </p>
              <p className="text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#1b1b1b]">
                We invite you to join us on this journey, as we honor a remarkable legacy and build
                a future where dental care is truly accessible to all.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* The Future of Dentistry: "by the numbers" style soft cards */}
      <section id="future-dentistry" className="scroll-mt-20 bg-[#f7f5f2] py-14 md:py-24">
        <div className="wrap-bento max-w-[1396px]">
          <h2 className="text-[clamp(30px,3.4vw,48px)] leading-[1.05] font-normal tracking-[-0.02em] text-[#1b1b1b]">
            The Future <span className="text-[#8b8d92]">of Dentistry</span>
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4">
              <div className={`${SOFT_CARD} p-7 md:p-9`}>
                <p className="text-[clamp(22px,2vw,28px)] leading-[1.25] text-[#1b1b1b]">
                  We believe the Pav Dental App, alongside our Hub and Mobile clinic, represents the
                  future of dentistry. It&apos;s a future shaped by Dr. Pav&apos;s belief in
                  accessibility and patient empowerment.
                </p>
              </div>
              <div className={`${SOFT_CARD} p-7 md:p-9`}>
                <p className="text-[20px] leading-[1.3] text-[#1b1b1b]">
                  We&apos;re proud to announce the Pav Dental App – think of it as the Uber of
                  dentistry! With just a few taps, you can:
                </p>
                <ul className="mt-6 space-y-5">
                  {APP_FEATURES.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-4 text-[18px] text-[#1b1b1b]">
                      <Icon aria-hidden strokeWidth={1.4} className="size-9 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <BookButton>Book Now</BookButton>
                  <Link
                    to="/services"
                    className="text-small font-medium text-[#1b1b1b] underline underline-offset-4"
                  >
                    View Services
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-center overflow-hidden rounded-[22px] bg-gradient-to-b from-[#ece6fa] to-[#f6f2fd] pt-10">
              <img
                src="/images/home/phone-emergency.webp"
                alt="Hand holding a smartphone showing the Pav Dental app"
                loading="lazy"
                width={773}
                height={1085}
                className="h-auto w-[min(380px,72%)] drop-shadow-[0_18px_28px_rgba(40,20,90,0.25)]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
