import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { BookButton, ButtonLink, CallButton } from "@/components/hims";
import { api, HAS_API_BASE } from "@/lib/api";
import { BOOKING_URL } from "@/lib/enquiry";
import { CLAY, LEAD, SOFT_CARD, TITLE } from "./tokens";

const REASONS = [
  {
    title: "Affordable Excellence",
    description: "We ensure that superior dental care is accessible to everyone.",
  },
  {
    title: "Comprehensive Care",
    description:
      "From routine check-ups to advanced treatments, we offer a wide range of dental services.",
  },
  {
    title: "Trusted Expertise",
    description:
      "Our team of skilled dental professionals is dedicated to your oral health. Visit us at Pav Dental for your dental needs, and experience first-hand our commitment to affordability and quality care.",
  },
] as const;

export function SpecialAnnouncement() {
  const { data: announcements } = useQuery({
    queryKey: ["active-announcements"],
    queryFn: () => api.announcements.list(),
    enabled: HAS_API_BASE,
    retry: false,
  });

  const active = announcements?.find((a) => a.is_active);

  return (
    <section
      id="announcement"
      aria-labelledby="announcement-heading"
      className="scroll-mt-20 bg-white py-14 md:py-24"
    >
      <div className="wrap-bento max-w-[1396px]">
        {active && (
          <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-[22px] bg-[#f4f1ea] p-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#5b3fc4]">
                <Megaphone aria-hidden="true" className="size-5" />
              </span>
              <div>
                {active.title && <h3 className="text-label text-[#1b1b1b]">{active.title}</h3>}
                <p className="mt-1 text-body text-[#55565a]">{active.body}</p>
              </div>
            </div>
            {active.cta_text && (
              <ButtonLink size="sm" href={active.cta_url || BOOKING_URL}>
                {active.cta_text}
              </ButtonLink>
            )}
          </div>
        )}

        {/* Hims centred statement */}
        <div className="text-center">
          <p className="text-small text-[#55565a]">Bradford Price Guarantee</p>
          <h2
            id="announcement-heading"
            className="mx-auto mt-3 max-w-[18ch] text-[clamp(38px,5vw,76px)] leading-[1.02] font-normal tracking-[-0.03em] text-[#1b1b1b]"
          >
            Special Announcement from <span className={CLAY}>Pav Dental</span>
          </h2>
          <p className={`mx-auto mt-7 max-w-[42rem] ${LEAD}`}>
            At Pav Dental, we take immense pride in being recognized as the market leader in dental
            pricing. Our dedication to offering top-notch dental services at the most competitive
            rates is unwavering.
          </p>
        </div>

        {/* Dark spotlight card, as the Sana "Enterprise" pricing card */}
        <div className="mt-12 rounded-[28px] bg-[#1b1b1b] p-7 text-white md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_auto]">
            <div>
              <h3 className="text-[clamp(26px,2.8vw,40px)] leading-[1.1] font-normal tracking-[-0.02em]">
                Our Price Match Promise
              </h3>
              <p className="mt-4 max-w-[40rem] text-[17px] leading-[1.45] text-white/80">
                We&apos;re committed to providing not only the best dental care but also the best
                value. Therefore, we guarantee to beat the price of any dental treatment offered by
                our competitors. Just present us with a written quote from another provider, and we
                will offer you a better price.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <BookButton variant="gold">Book Now</BookButton>
              <CallButton variant="glass" />
            </div>
          </div>
        </div>

        <h3 className="mt-14 text-[clamp(24px,2.4vw,34px)] font-normal tracking-[-0.02em] text-[#1b1b1b]">
          Choose Pav Dental for:
        </h3>
        <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
          {REASONS.map((reason, idx) => (
            <div key={reason.title} className={`${SOFT_CARD} flex flex-col p-7 md:p-8`}>
              <span
                className="inline-flex size-8 items-center justify-center rounded-full text-caption text-white"
                style={{ backgroundColor: "#5b3fc4" }}
              >
                {idx + 1}
              </span>
              <h4 className="mt-5 text-[clamp(22px,1.9vw,28px)] leading-[1.12] font-normal tracking-[-0.015em] text-[#1b1b1b]">
                {reason.title}
              </h4>
              <p className="mt-3 text-[16px] leading-[1.45] text-[#55565a]">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
