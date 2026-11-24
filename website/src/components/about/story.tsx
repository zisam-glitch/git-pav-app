import { Link } from "@tanstack/react-router";
import { CalendarCheck, Siren, Video } from "lucide-react";
import type { ReactNode } from "react";
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

interface Milestone {
  pill: string;
  title: string;
  body: ReactNode;
  tile?: string;
}

const DREAM_STEPS: readonly Milestone[] = [
  {
    pill: "Step 1",
    title: "Dream",
    body: "Envisioning a patient-centered clinic where the best dental care meets the flexibility of mobile services.",
    tile: "/images/home/tile-smile.webp",
  },
  {
    pill: "Step 2",
    title: "Creating a Partnership",
    body: "Building a foundation of shared passion and complementary expertise.",
    tile: "/images/home/tile-mirror.webp",
  },
  {
    pill: "Step 3",
    title: "Reaching Shared Value between the Partnership",
    body: "Defining their commitment to patient well-being and professional excellence.",
    tile: "/images/home/tile-tooth.webp",
  },
  {
    pill: "Step 4",
    title: "Creating a Very Detailed Roadmap",
    body: "Outlining every stage, from cutting-edge technology acquisition to community outreach.",
    tile: "/images/home/tile-van.webp",
  },
];

const LEGACY_STEPS: readonly Milestone[] = [
  {
    pill: "Step 5",
    title: "Executing",
    body: "Bringing this dental clinic to life, serving our community with the same care and innovation Dr. Pav championed.",
    tile: "/images/home/tile-case.webp",
  },
  {
    pill: "Always",
    title: "Inspiration and Growth",
    body: "“We can achieve all our dreams if we are brave enough to pursue them.” This philosophy, shared by Dr. Pav and Dr. Hassan, will forever guide our practice.",
    tile: "/images/home/tile-strips.webp",
  },
];

const APP_FEATURES = [
  { icon: CalendarCheck, text: "Schedule routine checkups and cleanings at your home or office." },
  { icon: Siren, text: "Book emergency appointments for swift relief." },
  { icon: Video, text: "Consult virtually with our dentists for immediate advice." },
] as const;

/** Left: title and intro. Right: the purple milestone timeline. */
function Milestones({
  id,
  title,
  intro,
  items,
}: {
  id: string;
  title: string;
  intro: string;
  items: readonly Milestone[];
}) {
  return (
    <section id={id} className="scroll-mt-20 bg-white py-14 md:py-24">
      <div className="wrap-bento grid max-w-[1396px] gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className={TITLE}>{title}</h2>
          <p className="mt-6 max-w-[34rem] text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#55565a]">
            {intro}
          </p>
        </div>
        <ol className="relative">
          {items.map((item) => (
            <li key={item.title} className="relative pb-14 pl-10 last:pb-0">
              <span
                aria-hidden
                className="absolute top-0 left-0 size-3.5 rounded-full ring-[5px] ring-white"
                style={{ backgroundColor: PURPLE }}
              />
              <span
                aria-hidden
                className="absolute top-6 bottom-2 left-[4px] w-[6px] rounded-full"
                style={{ backgroundColor: PURPLE }}
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className="inline-flex rounded-full px-2.5 py-[3px] text-[11px] leading-none text-white"
                    style={{ backgroundColor: PURPLE }}
                  >
                    {item.pill}
                  </span>
                  <h3 className="mt-3 text-[clamp(26px,2.8vw,40px)] leading-[1.1] font-normal tracking-[-0.02em] text-[#1b1b1b]">
                    {item.title}
                  </h3>
                </div>
                {item.tile ? (
                  <span className="flex size-[92px] shrink-0 items-center justify-center rounded-2xl bg-[#f4f1ea] md:size-[116px]">
                    <img
                      src={item.tile}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      width={160}
                      height={160}
                      className="size-[72px] object-contain md:size-[88px]"
                    />
                  </span>
                ) : null}
              </div>
              <p className={`mt-5 ${BODY}`}>{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Story() {
  return (
    <>
      {/* Hero: gradient banner, then the title beside "On this page" */}
      <section id="our-story" className="scroll-mt-20 bg-white pt-4 pb-14 md:pb-24">
        <div className="wrap-bento max-w-[1396px]">
          <img
            src="/images/home/about-banner.webp"
            alt="A hand holding a phone with the Pav Dental app and a dentist's hand holding a mirror, among floating patient-record cards"
            width={2200}
            height={767}
            fetchPriority="high"
            className="aspect-[2200/767] w-full rounded-[28px] object-cover"
          />
          <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div>
              <h1 className={TITLE}>A Legacy of Care and Innovation</h1>
              <p className="mt-7 max-w-[36rem] text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#55565a]">
                Our dental clinic isn&apos;t just about delivering exceptional oral healthcare;
                it&apos;s a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a
                passionate believer that dentistry could – and should – extend beyond traditional
                practice, providing unparalleled convenience and accessibility.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <BookButton>Book Now</BookButton>
                <CallButton variant="outline" />
              </div>
            </div>
            <nav aria-label="On this page" className="lg:pt-6">
              <p className="text-[20px] text-[#55565a]">On this page:</p>
              <ol className="mt-5 space-y-3.5">
                {PAGE_JUMPS.map((item, i) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-4 text-[20px] text-[#1b1b1b] underline decoration-[#1b1b1b]/40 underline-offset-4 t-colors hover:decoration-[#1b1b1b]"
                    >
                      <span
                        className="inline-flex size-[30px] items-center justify-center rounded-full text-[15px] text-white no-underline"
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
        </div>
      </section>

      <Milestones
        id="dream-team"
        title="The Dream and The Team"
        intro="Dr. Pav's dream was shared, nurtured, and diligently planned alongside his close friend and colleague, Dr. Hassan. Together, they meticulously crafted a plan, encompassing these crucial steps:"
        items={DREAM_STEPS}
      />

      <Milestones
        id="legacy-fulfilled"
        title="A Legacy Fulfilled"
        intro="Tragically, Dr. Pav passed away before witnessing the clinic's realization. Their shared vision now rests with Dr. Hassan as a profound responsibility. Fueled by a deep respect for their collaboration, Dr Hassan vowed to complete the final step:"
        items={LEGACY_STEPS}
      />

      {/* Portrait banner and the two closing paragraphs */}
      <section className="bg-white pb-14 md:pb-24">
        <div className="wrap-bento max-w-[1396px]">
          <img
            src="/images/home/hassan-wide.jpg"
            alt="Dr Hassan Bhojani, founder and principal dentist at Pav Dental"
            loading="lazy"
            width={1360}
            height={800}
            className="aspect-[17/10] w-full rounded-[28px] object-cover md:aspect-[2/1]"
          />
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-20">
            <p className="text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#1b1b1b]">
              While we must forgive past failings and present obstacles, the future of this clinic
              demands unwavering standards. We will never compromise on the quality, compassion, or
              dedication to access that Dr. Pav envisioned.
            </p>
            <p className="text-[clamp(18px,1.5vw,22px)] leading-[1.35] text-[#1b1b1b]">
              We invite you to join us on this journey, as we honor a remarkable legacy and build a
              future where dental care is truly accessible to all.
            </p>
          </div>
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
