import { ButtonLink, CallButton } from "@/components/hims";
import { BOOKING_URL, PRACTICE_PHONE, PRACTICE_PHONE_HREF } from "@/lib/enquiry";

const NODES = [
  { left: "3%", top: "78%", size: 34 },
  { left: "20%", top: "62%", size: 46 },
  { left: "67%", top: "40%", size: 62 },
  { left: "89%", top: "26%", size: 90 },
] as const;

/** The Hims sky-gradient feature: centred headline, hero photo with a dotted growth line, two pills and two cards. */
export function CheckUpFeature() {
  return (
    <section
      id="check-up"
      className="overflow-hidden rounded-t-[32px] bg-gradient-to-b from-[#c7d8e5] via-[#dcdfc9] to-[#f5e5a0] pb-10 md:pb-14"
    >
      <div className="relative mx-auto max-w-[1728px] px-4 pt-14 md:pt-[4.5rem]">
        <svg
          aria-hidden
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-[34%] hidden h-[40%] w-full md:block"
        >
          <path
            d="M0 360 C 250 330, 450 250, 640 170 S 900 90, 1000 70"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.85"
            strokeWidth="3"
            strokeDasharray="1 11"
            strokeLinecap="round"
          />
        </svg>
        {NODES.map((n) => (
          <span
            key={n.left}
            aria-hidden
            className="pointer-events-none absolute hidden rounded-full bg-[#fbe78d]/55 md:block"
            style={{ left: n.left, top: n.top, width: n.size, height: n.size }}
          >
            <span className="absolute inset-[30%] rounded-full bg-[#f6d54f]" />
          </span>
        ))}

        <div className="relative mx-auto max-w-[760px] text-center">
          <p className="text-caption font-medium tracking-wide text-[#27434f]">ACCESSIBLE SMILES</p>
          <h2 className="mt-2 text-h2-md text-[#0f2b36]">Complete Dental Check-Up</h2>
          <p className="mt-2 text-h4 text-[#5f7d86]">
            £35 Only £7.60 more than the NHS fee (£27.40), with faster access and premium service
          </p>
        </div>

        <div className="relative mx-auto mt-8 w-[min(560px,86%)] md:mt-10">
          <img
            src="/images/home/sky-family.jpg"
            alt="Smiling father carrying his laughing young son on his shoulders outdoors in evening sunlight"
            width={1024}
            height={1536}
            fetchPriority="high"
            className="aspect-[4/5] w-full object-cover object-top [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,#000_68%,transparent),linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]"
          />
          <div className="absolute inset-x-0 bottom-6 flex flex-wrap items-center justify-center gap-2">
            <ButtonLink href={BOOKING_URL} variant="light" className="shadow-soft">
              Book - £35
            </ButtonLink>
            <ButtonLink
              to="/services/emergency-dental"
              variant="glass"
              className="bg-[#6b4f43]/70 backdrop-blur-md"
            >
              Emergency Dentist
            </ButtonLink>
          </div>
        </div>

        <div className="relative mx-auto -mt-2 grid max-w-[1396px] gap-2.5 md:grid-cols-2 lg:px-[3.2rem]">
          <article className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[28px] bg-[#fdf5d6]/90 p-6 md:min-h-[610px] md:p-10">
            <h3 className="text-h3-md text-[#0f2b36]">
              Emergency Dentist
              <span className="mt-1 block text-[#5f7d86]">
                Covering Bradford 24 Hours 7 days of the week including National and Bank Holidays
              </span>
            </h3>
            <p className="mt-3 text-body text-[#0f2b36]">
              £45 consultation
              <br />
              £90* out-of-hours consultation
            </p>
            <img
              src="/images/home/clinic-night.jpg"
              alt="Modern dental treatment room glowing with warm light at night"
              loading="lazy"
              width={1536}
              height={1024}
              className="mt-6 min-h-0 w-full flex-1 rounded-[20px] object-cover"
            />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <CallButton variant="default" className="bg-[#0f2b36]">
                Call us Now
              </CallButton>
              <a
                href={PRACTICE_PHONE_HREF}
                className="text-label text-[#0f2b36] underline underline-offset-4"
              >
                {PRACTICE_PHONE}
              </a>
              <ButtonLink href={BOOKING_URL} variant="outline" className="bg-transparent">
                Book Online
              </ButtonLink>
            </div>
          </article>

          <article className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[28px] bg-[#fdf5d6]/90 p-6 md:min-h-[610px] md:p-10">
            <h3 className="text-h3-md text-[#0f2b36]">
              Facial Aesthetics
              <span className="mt-1 block text-[#5f7d86]">
                Rediscover Your Youthful Radiance with Our Premier Aesthetic Treatments
              </span>
            </h3>
            <img
              src="/images/home/serum-hand.jpg"
              alt="Hand holding an amber glass dropper serum bottle against a soft cream backdrop"
              loading="lazy"
              width={1024}
              height={1024}
              className="mt-6 min-h-0 w-full flex-1 rounded-[20px] object-cover"
            />
            <div className="mt-5 flex">
              <ButtonLink to="/services/aesthetics" variant="default" className="bg-[#0f2b36]">
                Learn more
              </ButtonLink>
            </div>
          </article>
        </div>

        <p className="mx-auto mt-8 max-w-[760px] text-center text-caption text-[#6d6a52]">
          Open 24 hours, 7 days a week, including National and Bank Holidays · 786 Leeds Road,
          Bradford, BD3 9TY
        </p>
      </div>
    </section>
  );
}
