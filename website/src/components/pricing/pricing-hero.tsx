import { ChevronRight } from "lucide-react";
import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { CONTAINER } from "./tokens";

/**
 * Pricing hero, built to the structure of hims.com's top-of-page block (measured on the live
 * page): a 57px light headline with a clay highlight, two wide photo tiles (24px radius, 4px
 * gaps, white two-tone title top-left and a "label ›" bottom-left), then a row of four
 * cream pill tiles with a clay object on the right. Images are our own.
 */
const FEATURED = [
  {
    href: "#plans",
    lead: "Start your",
    accent: "membership today",
    label: "Compare our plans",
    image: "/images/home/pricing-tile-plans.webp",
  },
  {
    href: "#fees",
    lead: "Treatments",
    accent: "from £99",
    label: "See the fee schedule",
    image: "/images/home/pricing-tile-fees.webp",
  },
] as const;

const PILLS = [
  { href: "#plans", before: "Choose a", accent: "plan", image: "/images/home/price-plan.webp" },
  { href: "#fees", before: "Check a", accent: "fee", image: "/images/home/price-fee.webp" },
  {
    href: "#insurance",
    before: "Use your",
    accent: "insurance",
    image: "/images/home/price-insurance.webp",
  },
  {
    href: "#announcement",
    before: "Our price",
    accent: "match promise",
    image: "/images/home/price-match.webp",
  },
] as const;

export function PricingHero() {
  return (
    <section
      id="top"
      aria-label="Dental pricing and payment options"
      className="scroll-mt-20 bg-white pt-8 pb-12 md:pt-12 md:pb-20"
    >
      <div className={CONTAINER}>
        <h1 className="text-[clamp(38px,4vw,57px)] leading-none font-[410] tracking-[-0.01em] text-[rgba(0,0,0,0.88)]">
          You don&apos;t have to Pay <span className="text-[#8a4242]">for it all at once.</span>
        </h1>
        <p className="mt-5 max-w-[40rem] text-[clamp(17px,1.4vw,20px)] leading-[1.35] text-[#55565a]">
          With our 0% interest dental finance, treatments from £99 can be started today and paid
          over convenient monthly instalments.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" />
          <ButtonLink href="/services/finance" variant="ghost">
            Payment Options
          </ButtonLink>
        </div>

        <nav aria-label="On this page" className="mt-10">
          <div className="grid gap-1 md:grid-cols-2">
            {FEATURED.map((tile) => (
              <a
                key={tile.href}
                href={tile.href}
                className="group relative flex min-h-[199px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#e7ddd2] p-5 text-white"
              >
                <img
                  src={tile.image}
                  alt=""
                  aria-hidden
                  width={1800}
                  height={627}
                  className="absolute inset-0 size-full object-cover object-right transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent"
                />
                <h3 className="relative text-[20px] leading-[1.2] font-normal">
                  {tile.lead}
                  <br />
                  <span className="text-[#ffc671]">{tile.accent}</span>
                </h3>
                <span className="relative flex items-center gap-2 text-[16px]">
                  {tile.label}
                  <ChevronRight aria-hidden className="size-4" />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
            {PILLS.map((pill) => (
              <a
                key={pill.href + pill.accent}
                href={pill.href}
                className="group flex h-[100px] items-center justify-between rounded-[24px] bg-[#f4f0e8] py-0 pr-2 pl-4 t-colors hover:bg-[#ece6da]"
              >
                <span className="text-[19px] leading-[1.2] text-[#37556e]">
                  {pill.before} <span className="text-[#8a4242]">{pill.accent}</span>
                </span>
                <span className="flex items-center gap-1">
                  <img
                    src={pill.image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    width={160}
                    height={160}
                    className="size-20 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <ChevronRight aria-hidden className="size-4 text-[#1b1b1b]" />
                </span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
