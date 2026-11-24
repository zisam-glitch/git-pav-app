import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { CLAY, LEAD, PURPLE } from "./tokens";

const PAGE_JUMPS = [
  { label: "Membership Plans", href: "#plans" },
  { label: "Treatment Fee Schedule", href: "#fees" },
  { label: "Insurance Providers", href: "#insurance" },
  { label: "Price Match Promise", href: "#announcement" },
] as const;

/** Hims "Through Hims…" statement, the banner, then the numbered "On this page" chips. */
export function PricingHero() {
  return (
    <section
      id="top"
      aria-label="Dental pricing and payment options"
      className="scroll-mt-20 bg-white pt-14 pb-14 text-center md:pt-24 md:pb-24"
    >
      <div className="wrap-bento max-w-[1396px]">
        <p className="text-caption font-medium tracking-[0.12em] text-[#5f6064] uppercase">
          Bradford Clinic · Transparent Fees
        </p>
        <h1 className="mx-auto mt-4 max-w-[16ch] text-[clamp(40px,5.8vw,88px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#1b1b1b]">
          You don&apos;t have to Pay <span className={CLAY}>for it all at once.</span>
        </h1>
        <p className={`mx-auto mt-7 max-w-[40rem] ${LEAD}`}>
          With our 0% interest dental finance, treatments from £99 can be started today and paid
          over convenient monthly instalments.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <BookButton>Book Now</BookButton>
          <CallButton variant="outline" />
          <ButtonLink href="/services/finance" variant="ghost">
            Payment Options
          </ButtonLink>
        </div>
        <img
          src="/images/home/pricing-banner.webp"
          alt="A hand holding a phone showing a monthly plan, with bronze, silver and gold membership tokens floating in a ring of dots"
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
  );
}
