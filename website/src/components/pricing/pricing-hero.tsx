import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { CLAY, LEAD, PURPLE, SOFT_CARD } from "./tokens";

const PAGE_JUMPS = [
  { label: "Membership Plans", href: "#plans" },
  { label: "Treatment Fee Schedule", href: "#fees" },
  { label: "Insurance Providers", href: "#insurance" },
  { label: "Price Match Promise", href: "#announcement" },
] as const;

/**
 * Split hero, after the Hims "mission" page and the Superpower "membership starts here" card:
 * headline, copy and buttons on the left; the banner and two fact cards stacked on the right.
 */
export function PricingHero() {
  return (
    <section
      id="top"
      aria-label="Dental pricing and payment options"
      className="scroll-mt-20 bg-white pt-10 pb-14 md:pt-16 md:pb-24"
    >
      <div className="wrap-bento grid max-w-[1396px] items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="text-caption font-medium tracking-[0.12em] text-[#5f6064] uppercase">
            Bradford Clinic · Transparent Fees
          </p>
          <h1 className="mt-4 text-[clamp(40px,5.4vw,80px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#1b1b1b]">
            You don&apos;t have to Pay <span className={CLAY}>for it all at once.</span>
          </h1>
          <p className={`mt-6 max-w-[34rem] ${LEAD}`}>
            With our 0% interest dental finance, treatments from £99 can be started today and paid
            over convenient monthly instalments.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" />
            <ButtonLink href="/services/finance" variant="ghost">
              Payment Options
            </ButtonLink>
          </div>

          <nav aria-label="On this page" className="mt-12">
            <p className="text-small text-[#55565a]">On this page:</p>
            <ol className="mt-4 space-y-3">
              {PAGE_JUMPS.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-3.5 text-[18px] text-[#1b1b1b] underline decoration-[#1b1b1b]/35 underline-offset-4 t-colors hover:decoration-[#1b1b1b]"
                  >
                    <span
                      className="inline-flex size-7 items-center justify-center rounded-full text-[14px] text-white no-underline"
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

        <div className="grid gap-3 md:gap-4">
          <img
            src="/images/home/pricing-banner.webp"
            alt="A hand holding a phone showing a monthly plan, with bronze, silver and gold membership tokens floating in a ring of dots"
            width={2200}
            height={767}
            fetchPriority="high"
            className="aspect-[2200/767] w-full rounded-[28px] object-cover"
          />
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className={`${SOFT_CARD} p-6`}>
              <p className="text-[clamp(34px,3.4vw,52px)] leading-none tracking-[-0.03em] text-[#1b1b1b]">
                £99
              </p>
              <p className="mt-3 text-[15px] leading-snug text-[#55565a]">
                treatments from, started today
              </p>
            </div>
            <div className={`${SOFT_CARD} p-6`}>
              <p className="text-[clamp(34px,3.4vw,52px)] leading-none tracking-[-0.03em] text-[#1b1b1b]">
                0%
              </p>
              <p className="mt-3 text-[15px] leading-snug text-[#55565a]">
                interest dental finance, paid monthly
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
