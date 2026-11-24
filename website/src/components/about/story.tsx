import { Link } from "@tanstack/react-router";
import { BookButton, CallButton } from "@/components/hims";
import { cn } from "@/lib/utils";

/**
 * The About page in the Hims layout (Mobbin web sections: "About us" mission hero, the
 * numbered "On this page" list, the big statement paragraph and the rounded cards).
 * Every sentence is the live About copy, unchanged.
 */

const GOLD = "text-[#ffd48a]";
const PAGE_JUMPS = [
  { num: "1", label: "Our Story", href: "#our-story" },
  { num: "2", label: "The Dream & Team", href: "#dream-team" },
  { num: "3", label: "A Legacy Fulfilled", href: "#legacy-fulfilled" },
  { num: "4", label: "The Future of Dentistry", href: "#future-dentistry" },
] as const;

const DREAM_STEPS = [
  {
    title: "Dream",
    body: "Envisioning a patient-centered clinic where the best dental care meets the flexibility of mobile services.",
    tile: "/images/home/tile-smile.webp",
  },
  {
    title: "Creating a Partnership",
    body: "Building a foundation of shared passion and complementary expertise.",
    tile: "/images/home/tile-mirror.webp",
  },
  {
    title: "Reaching Shared Value between the Partnership",
    body: "Defining their commitment to patient well-being and professional excellence.",
    tile: "/images/home/tile-tooth.webp",
  },
  {
    title: "Creating a Very Detailed Roadmap",
    body: "Outlining every stage, from cutting-edge technology acquisition to community outreach.",
    tile: "/images/home/tile-van.webp",
  },
] as const;

const APP_FEATURES = [
  "Schedule routine checkups and cleanings at your home or office.",
  "Book emergency appointments for swift relief.",
  "Consult virtually with our dentists for immediate advice.",
] as const;

export function Story() {
  return (
    <>
      {/* 1 · Our Story: label, two-tone headline, then a wide rounded photo */}
      <section id="our-story" className="bg-white pt-10 pb-6 md:pt-16">
        <div className="wrap-bento max-w-[1396px]">
          <p className="text-caption font-medium tracking-[0.12em] text-[#5f7d86] uppercase">
            Bradford · Our Story
          </p>
          <h1 className="mt-3 max-w-[16ch] t-hims-section text-[#0f2b36] md:max-w-[20ch]">
            A Legacy of <span className="text-[#b5644a]">Care and Innovation</span>
          </h1>
          <div className="mt-8 grid items-end gap-6 md:grid-cols-[1.1fr_1fr] md:gap-10">
            <p className="t-hims-lead text-[#38535c]">
              Our dental clinic isn&apos;t just about delivering exceptional oral healthcare;
              it&apos;s a testament to the vision of the late Dr. Pavan Bhogal. Dr. Pav was a
              passionate believer that dentistry could – and should – extend beyond traditional
              practice, providing unparalleled convenience and accessibility.
            </p>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <BookButton>Book Now</BookButton>
              <CallButton variant="outline" />
            </div>
          </div>
          <img
            src="/images/generated/about-hero.jpg"
            alt="Warm sunlit Pav Dental treatment room in Bradford"
            width={1600}
            height={900}
            className="mt-10 aspect-[16/8] w-full rounded-[32px] object-cover"
          />
          {/* "On this page" numbered list, as on the Hims company page */}
          <nav
            aria-label="On this page"
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#0f2b36]/10 pt-6"
          >
            <span className="text-small text-[#5f7d86]">On this page</span>
            {PAGE_JUMPS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group inline-flex items-center gap-2.5 text-small font-medium text-[#0f2b36] underline decoration-[#0f2b36]/30 underline-offset-4 t-colors hover:decoration-[#0f2b36]"
              >
                <span className="inline-flex size-6 items-center justify-center rounded-pill bg-[#4f46b8] text-caption text-white">
                  {item.num}
                </span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* 2 · The Dream and The Team: a big centred statement, then four rounded step cards */}
      <section
        id="dream-team"
        className="relative rounded-t-[32px] bg-gradient-to-b from-[#6f9bbd] to-[#5a87ab] pt-16 pb-[4.5rem] text-white md:pt-24 md:pb-[5.5rem]"
      >
        <div className="wrap-bento max-w-[1396px]">
          <h2 className="mx-auto max-w-[22ch] text-center t-hims-section">
            The Dream and <span className="text-[#ffe1a8]">The Team</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[40rem] text-center t-hims-lead text-white/90">
            Dr. Pav&apos;s dream was shared, nurtured, and diligently planned alongside his close
            friend and colleague, Dr. Hassan. Together, they meticulously crafted a plan,
            encompassing these crucial steps:
          </p>
          <ol className="mt-12 grid gap-2.5 md:grid-cols-2 lg:grid-cols-4">
            {DREAM_STEPS.map((item, idx) => (
              <li
                key={item.title}
                className="relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#1d3f58]/25 p-6 md:p-7"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-pill bg-white text-caption font-medium text-[#1d3f58]">
                  {idx + 1}
                </span>
                <img
                  src={item.tile}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  width={160}
                  height={160}
                  className="absolute top-5 right-4 size-[96px] object-contain"
                />
                <p className="t-hims-body text-white/90">
                  <strong className="t-hims-card mb-2 block text-white">{`${item.title} : `}</strong>
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 · A Legacy Fulfilled: amber card with the portrait, the quote and the two closing paragraphs */}
      <section
        id="legacy-fulfilled"
        className="relative -mt-8 rounded-t-[32px] bg-[#ab742d] pt-16 pb-[4.5rem] text-white md:pt-24 md:pb-[5.5rem]"
      >
        <div className="wrap-bento max-w-[1396px]">
          <div className="rounded-[28px] bg-[#6b430f]/25 px-5 py-10 text-center md:px-10 md:py-14">
            <h2 className="t-hims-section">
              A Legacy <span className={GOLD}>Fulfilled</span>
            </h2>
            <img
              src="/images/home/hassan-wide.jpg"
              alt="Dr Hassan Bhojani, founder and principal dentist at Pav Dental"
              loading="lazy"
              width={1360}
              height={800}
              className="mx-auto mt-8 aspect-[17/10] w-full max-w-[720px] rounded-[32px] object-cover"
            />
            <p className="mx-auto mt-8 max-w-[40rem] t-hims-lead text-white/90">
              Tragically, Dr. Pav passed away before witnessing the clinic&apos;s realization.
              Their shared vision now rests with Dr. Hassan as a profound responsibility. Fueled by
              a deep respect for their collaboration, Dr Hassan vowed to complete the final step:
            </p>
            <div className="mx-auto mt-8 grid max-w-[900px] gap-2.5 text-left md:grid-cols-2">
              <p className="rounded-[24px] bg-[#6b430f]/45 p-6 t-hims-body text-white/90 md:p-7">
                <strong className={cn("t-hims-card mb-2 block", GOLD)}>{"Executing : "}</strong>
                Bringing this dental clinic to life, serving our community with the same care and
                innovation Dr. Pav championed.
              </p>
              <p className="rounded-[24px] bg-[#6b430f]/45 p-6 t-hims-body text-white/90 md:p-7">
                <strong className={cn("t-hims-card mb-2 block", GOLD)}>
                  {"Inspiration and Growth : "}
                </strong>
                &ldquo;We can achieve all our dreams if we are brave enough to pursue them.&rdquo;
                This philosophy, shared by Dr. Pav and Dr. Hassan, will forever guide our practice.
              </p>
            </div>
            <p className="mx-auto mt-8 max-w-[40rem] t-hims-body text-white/90">
              While we must forgive past failings and present obstacles, the future of this clinic
              demands unwavering standards. We will never compromise on the quality, compassion, or
              dedication to access that Dr. Pav envisioned.
            </p>
            <p className="mx-auto mt-4 max-w-[40rem] t-hims-body text-white/90">
              We invite you to join us on this journey, as we honor a remarkable legacy and build a
              future where dental care is truly accessible to all.
            </p>
          </div>
        </div>
      </section>

      {/* 4 · The Future of Dentistry: phone in hand beside the app copy */}
      <section
        id="future-dentistry"
        className="relative -mt-8 rounded-[32px] bg-[#5a87ab] pt-16 pb-14 text-white md:pt-24"
      >
        <div className="wrap-bento grid max-w-[1396px] items-center gap-2.5 lg:grid-cols-2">
          <div className="rounded-[28px] bg-[#1d3f58]/25 px-6 py-10 md:px-10 md:py-14">
            <h2 className="t-hims-feature">The Future of Dentistry</h2>
            <p className="mt-5 t-hims-lead text-white/90">
              We believe the Pav Dental App, alongside our Hub and Mobile clinic, represents the
              future of dentistry. It&apos;s a future shaped by Dr. Pav&apos;s belief in
              accessibility and patient empowerment.
            </p>
            <p className="mt-5 t-hims-body text-white/90">
              We&apos;re proud to announce the Pav Dental App – think of it as the Uber of
              dentistry! With just a few taps, you can:
            </p>
            <ul className="mt-6 space-y-2">
              {APP_FEATURES.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 rounded-[20px] bg-[#1d3f58]/30 px-4 py-3.5 t-hims-body"
                >
                  <span aria-hidden className={cn("t-hims-lead leading-none", GOLD)}>
                    +
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BookButton variant="glass" className="border-0">
                Book Now
              </BookButton>
              <Link to="/services" className={cn("text-small font-medium underline underline-offset-4", GOLD)}>
                View Services
              </Link>
            </div>
          </div>
          <div className="flex items-end justify-center overflow-hidden rounded-[28px] bg-[#1d3f58]/25 pt-10">
            <img
              src="/images/home/phone-emergency.webp"
              alt="Hand holding a smartphone showing the Pav Dental app"
              loading="lazy"
              width={773}
              height={1085}
              className="h-auto w-[min(340px,70%)] drop-shadow-[0_18px_28px_rgba(10,30,50,0.35)]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
