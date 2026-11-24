import {
  BookButton,
  ButtonLink,
  CallButton,
  CtaBand,
  DarkQuestion,
  FaqList,
  FloatingCta,
  Section,
  SectionHead,
  StepsPanel,
} from "@/components/hims";
import {
  AESTHETICS_TESTIMONIALS,
  TESTIMONIALS_HEADING,
  TESTIMONIALS_INTRO,
} from "@/content/testimonials";
import { AestheticsHero } from "./aesthetics-hero";
import { AestheticsSafety } from "./aesthetics-safety";

const IMG = {
  hero: "/images/generated/aesthetics-hero.jpg",
  premium: "/images/generated/aesthetics-premium.jpg",
  facial: "/images/generated/home-facial-aesthetics.jpg",
  botox: "/images/generated/blog-botox-vs-fillers.jpg",
} as const;

const TREATMENTS = [
  {
    title: "Botox",
    desc: "Botox is a non-surgical treatment that smooths out wrinkles and fine lines, giving you a more youthful appearance.",
    image: IMG.botox,
    price: "From £180",
  },
  {
    title: "Dermal fillers",
    desc: "Dermal fillers are used to add volume and fullness to areas of the face that have lost volume due to aging or other factors.",
    image: IMG.facial,
    price: "From £100",
  },
  {
    title: "Microneedling",
    desc: "We offer microneedling as a safe and effective treatment to help improve the overall health and appearance of your skin.",
  },
  {
    title: "Chemical peels",
    desc: "Chemical peels are an effective way to rejuvenate the skin by removing dead skin cells and promoting the growth of new, healthy skin.",
  },
  {
    title: "Lip enhancement",
    desc: "Our lip enhancement treatments are designed to add volume and definition to your lips, giving you a fuller and more youthful appearance.",
  },
  {
    title: "Skin Rejuvenation",
    desc: "Our skin rejuvenation treatments are designed to reduce the appearance of fine lines, wrinkles, and other signs of aging.",
  },
] as const;

const VALUES = [
  {
    title: "Wholehearted",
    accent: "Commitment",
    text: "Our motivation stems from a genuine desire to provide the best care, rather than being driven by sales incentives.",
    image: IMG.hero,
    alt: "Warm sunlit facial aesthetics consultation room at Pav Dental in Bradford",
  },
  {
    title: "Expert",
    accent: "Guidance",
    text: "We take immense pride in delivering expert advice and guidance to our valued clients.",
    image: IMG.facial,
    alt: "Facial aesthetics treatment at Pav Dental",
  },
  {
    title: "Quality",
    accent: "Assurance",
    text: "Our unwavering commitment lies in using the utmost quality products, with no room for compromise.",
    image: IMG.premium,
    alt: "Curated aesthetic skincare vials and clinical ceramic tray in warm studio light",
  },
];

const PRICES = [
  {
    title: "Dermal Fillers",
    rows: [
      ["0.5ML", "£100"],
      ["0.7ML", "£150"],
      ["1ML", "£250"],
      ["2ML", "£350"],
      ["3ML", "£400"],
      ["4ML", "£450"],
    ],
  },
  {
    title: "Botox",
    rows: [
      ["1 AREA", "£180"],
      ["2 AREAS", "£240"],
      ["3 AREAS", "£300"],
      ["4 AREAS", "£400"],
    ],
  },
  {
    title: "Others",
    rows: [
      ["PROFHILO FIRST DOSE", "£249"],
      ["SOSUM BOOSTER", "£160"],
    ],
  },
];

const SAFETY = [
  {
    q: "Age Limit",
    a: "For the well-being and safety of our patients, all individuals seeking treatment with us MUST be at least 18 years of age.",
  },
  {
    q: "Things to Know",
    a: "Before you embark on your journey, it's essential to be aware of some key details.",
  },
  {
    q: "How We are Keeping You Safe",
    a: "At Pav Dental, your safety is paramount. We prioritise your well-being and have implemented stringent measures to create a safe and healthy environment. As a regulated clinic under the Care Quality Commission (CQC), we adhere to rigorous guidelines for cleanliness, sterilisation, and staff training. Our team is equipped with the latest safety procedures and personal protective equipment. We maintain social distancing and limit patient numbers to ensure minimal risk of exposure. By choosing Pav Dental, you can trust that we meet the highest standards of quality and safety. Your health and peace of mind are our utmost priority.",
  },
];

const H2 = "text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]";

export function AestheticsPage() {
  return (
    <main className="bg-white">
      <AestheticsHero />

      <Section id="treatments" theme="white" aria-labelledby="aesthetics-treatments-heading">
        <SectionHead
          id="aesthetics-treatments-heading"
          label="Aesthetics Treatments"
          accent="Aesthetics"
          title="Treatments"
          action={<BookButton>Appointment</BookButton>}
        />
        <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {TREATMENTS.map((t) => {
            const dark = "image" in t;
            return (
              <article
                key={t.title}
                className={
                  dark
                    ? "relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#3a2c1b] p-7 text-white lg:row-span-1"
                    : "flex min-h-[260px] flex-col justify-between rounded-[24px] bg-[#f6f6f4] p-7 text-[#1b1b1b]"
                }
              >
                {dark ? (
                  <>
                    <img
                      src={t.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a1f12]/85 to-transparent" />
                  </>
                ) : null}
                <div className="relative z-10">
                  <h3 className="text-[26px] leading-[1.1] font-normal tracking-[-0.01em]">
                    {t.title}
                  </h3>
                  <p className={`mt-3 text-[16px] leading-[1.45] ${dark ? "text-white/85" : "text-[#55565a]"}`}>
                    {t.desc}
                  </p>
                  {"price" in t ? (
                    <p className="mt-4 text-[14px] text-white/75 tabular-nums">{t.price}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section theme="white" space="sm" aria-label="Our values">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className={H2}>
            <span className="text-[#4a5c66]">Our</span> Values
          </h2>
        </div>
        <StepsPanel steps={VALUES} />
      </Section>

      <Section theme="white" space="sm" aria-label="Premium-grade products">
        <DarkQuestion
          lead="We exclusively utilise premium-grade products"
          highlight="of exceptional quality"
          text={
            <>
              Experience excellence with our Aesthetics services, where we use only the finest
              products to ensure exceptional results each time.
              <span className="mt-4 block">
                Indulge in the finest aesthetic treatments you'll ever experience. Through
                meticulous research, we have curated a selection of top-notch products, ensuring
                utmost quality and satisfaction for our esteemed clients. Prepare to be impressed.
              </span>
            </>
          }
          chips={["Botox", "Dermal fillers", "Profhilo", "Sosum Booster"]}
          cta={
            <ButtonLink href="#pricing" variant="gold">
              Aesthetics Price List
            </ButtonLink>
          }
        />
      </Section>

      <Section id="pricing" theme="white" aria-labelledby="aesthetics-pricing-heading">
        <SectionHead
          id="aesthetics-pricing-heading"
          label="Price list"
          accent="Aesthetics"
          title="Price List"
        />
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {PRICES.map((c) => (
            <article key={c.title} className="rounded-[24px] bg-[#f6f6f4] p-7">
              <h3 className="flex items-baseline justify-between border-b border-black/10 pb-4 text-[24px] font-normal text-[#1b1b1b]">
                {c.title}
                <span className="text-[14px] text-[#6b6b70]">Price</span>
              </h3>
              <ul className="divide-y divide-black/10">
                {c.rows.map(([item, price]) => (
                  <li key={item} className="flex items-center justify-between gap-4 py-4">
                    <span className="text-[16px] text-[#2a2a2c]">{item}</span>
                    <span className="text-[20px] text-[#1b1b1b] tabular-nums">{price}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-3 flex flex-col items-start justify-between gap-5 rounded-[24px] bg-[#f6f6f4] p-7 md:flex-row md:items-center">
          <p className="max-w-2xl text-lead text-[#2a2a2c]">
            Offers and packages now availabe. Please enquire with our team today on{" "}
            <a
              href="tel:08000996375"
              className="underline underline-offset-4 t-colors hover:text-terracotta"
            >
              0800 099 6375
            </a>{" "}
            to find out more
          </p>
          <div className="flex flex-wrap gap-3">
            <BookButton>Book Now</BookButton>
            <CallButton variant="outline" href="tel:08000996375">
              Call 0800 099 6375
            </CallButton>
          </div>
        </div>
      </Section>

      <Section theme="white" space="sm" aria-labelledby="aesthetics-reviews-heading">
        <SectionHead id="aesthetics-reviews-heading" title={TESTIMONIALS_HEADING}>
          {TESTIMONIALS_INTRO}
        </SectionHead>
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {AESTHETICS_TESTIMONIALS.map((item) => (
            <article key={item.title} className="rounded-[24px] bg-[#f6f6f4] p-7">
              <h3 className="text-[20px] font-normal text-[#4a5c66]">{item.title}</h3>
              <p className="mt-4 text-[16px] leading-[1.5] text-[#2a2a2c]">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="safety" theme="white" aria-labelledby="aesthetics-safety-heading">
        <div className="mx-auto max-w-[900px]">
          <h2 id="aesthetics-safety-heading" className={H2}>
            How We are <span className="text-[#4a5c66]">Keeping You Safe</span>
          </h2>
          <FaqList items={SAFETY} defaultOpen={2} large className="mt-10" />
        </div>
      </Section>

      <AestheticsSafety />

      <CtaBand
        theme="brown"
        title="Book"
        accent="Appointment"
        tone="gold"
        actions={
          <>
            <BookButton variant="gold">Book Now</BookButton>
            <CallButton variant="glass" />
          </>
        }
      >
        Leading cosmetic and dental care includes teeth whitening, veneers, implants, routine
        check-ups, and advanced technologies like digital imaging and laser dentistry.
      </CtaBand>

      <FloatingCta>
        <BookButton>Book Now</BookButton>
      </FloatingCta>
    </main>
  );
}
