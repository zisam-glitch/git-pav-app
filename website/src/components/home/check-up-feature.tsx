import { ButtonLink, CallButton } from "@/components/hims";
import { BOOKING_URL, PRACTICE_PHONE } from "@/lib/enquiry";

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
      className="overflow-hidden rounded-t-[32px] bg-gradient-to-b from-[#c7d8e5] via-[#dcdfc9] to-[#f5e5a0] pb-[4.5rem] md:pb-[5.5rem]"
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
            alt="Smiling woman carrying her laughing young daughter on her shoulders against a pale evening sky"
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
            <div className="mt-6 flex min-h-[240px] flex-1 flex-col items-center justify-center">
              <img
                src="/images/home/tile-case.webp"
                alt="Soft 3D sky-blue matte tablet with an engraved tooth and a plus sign"
                loading="lazy"
                width={900}
                height={900}
                className="size-[190px] object-contain md:size-[230px]"
              />
              <span aria-hidden className="mt-2 block h-3 w-40 rounded-full bg-[#0f2b36]/20 blur-md" />
            </div>
            <div className="relative z-10 mt-5 flex justify-end">
              <CallButton variant="default" className="bg-[#0f2b36]">
                Call us Now · {PRACTICE_PHONE}
              </CallButton>
            </div>
          </article>

          <article className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[28px] bg-[#fdf5d6]/90 p-6 md:min-h-[610px] md:p-10">
            <h3 className="text-h3-md text-[#0f2b36]">
              Facial Aesthetics
              <span className="mt-1 block text-[#5f7d86]">
                Rediscover Your Youthful Radiance with Our Premier Aesthetic Treatments
              </span>
            </h3>
            <div className="relative mt-4 min-h-[320px] flex-1">
              <img
                src="/images/home/phone-aesthetics.webp"
                alt="Hand holding a smartphone showing a Pav Dental aesthetic treatments app screen"
                loading="lazy"
                width={773}
                height={1085}
                className="absolute bottom-[-3rem] left-1/2 h-[calc(100%+3rem)] w-auto max-w-none -translate-x-1/2"
              />
            </div>
            <div className="relative z-10 mt-5 flex justify-end">
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
