import { ArrowRight } from "lucide-react";
import {
  BookButton,
  ButtonLink,
  DarkQuestion,
  FeatureBento,
  Section,
  StepsPanel,
} from "@/components/hims";

const H2 = "text-[clamp(34px,4vw,52px)] leading-[1.05] font-normal tracking-[-0.025em] text-[#2a2a2c]";
const ACCENT = "text-[#4a5c66]";

const IMG_HERO = "/images/generated/cosmetic-hero.jpg";
const IMG_ABOUT = "/images/generated/cosmetic-about.jpg";
const IMG_SHOWCASE = "/images/generated/cosmetic-showcase.jpg";
const IMG_WHITENING = "/images/generated/whitening-hero.jpg";

const TOOTH_CONTOURING = {
  title: "Tooth Contouring",
  desc: "This procedure involves reshaping the tooth by removing some of its enamel to alter its length, shape, or surface.",
};
const IMPLANTS = {
  title: "Dental Implants",
  desc: "Used to replace missing teeth, dental implants offer a long-lasting solution that looks and feels natural.",
};

export function CosmeticIntro() {
  return (
    <Section theme="white" aria-labelledby="cosmetic-about-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="cosmetic-about-heading" className={H2}>
          What is <span className="text-[#8a4242]">Cosmetic Dentistry?</span>
        </h2>
        <p className="mt-5 text-lead text-muted">
          Cosmetic Dentistry refers to dental work that improves the appearance of teeth, gums,
          and/or bite. It primarily focuses on improvement in dental aesthetics such as color,
          position, shape, size, and overall smile appearance.
        </p>
      </div>
    </Section>
  );
}

export function CosmeticProcedures() {
  return (
    <Section id="procedures" theme="white" aria-labelledby="cosmetic-procedures-heading">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="cosmetic-procedures-heading" className={H2}>
          Popular <span className="text-[#8a4242]">Cosmetic Dentistry</span> Procedures
        </h2>
      </div>
      <div className="mt-12">
        <FeatureBento
          feature={{
            title: "Porcelain Veneers",
            kicker:
              "These are thin shells of porcelain that are custom-fitted to cover the front surface of a tooth, often used to correct uneven teeth, worn enamel, or discoloration.",
            image: IMG_HERO,
            alt: "Cosmetic dentistry shade guide and porcelain dental mirror in warm natural studio light",
            href: "#contact",
          }}
          items={[
            {
              title: "Teeth Whitening",
              kicker:
                "One of the most common and cost-effective cosmetic dentistry treatments, teeth whitening can brighten your smile in just one session.",
              image: IMG_WHITENING,
              alt: "Bright whitening consultation room in warm sunlight",
              href: "/services/whitening",
            },
            {
              title: "Dental Bonding",
              kicker:
                "This involves applying a tooth-colored resin to a tooth and hardening it with a special light. It’s a cost-effective way to repair chipped or cracked teeth.",
              image: IMG_SHOWCASE,
              alt: "Cosmetic dental ceramic models and porcelain shade tabs in warm studio light",
              href: "#contact",
            },
          ]}
          help={{
            title: "Talk to our team",
            text: "Not sure which procedure suits you? Book an appointment and we will guide you.",
            cta: <BookButton variant="gold">Appointment</BookButton>,
          }}
        />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {[TOOTH_CONTOURING, IMPLANTS].map((p) => (
            <a
              key={p.title}
              href="#contact"
              className="group flex items-end justify-between gap-6 rounded-[24px] bg-[#f6efe4] p-7 t-colors hover:bg-[#f1e7d6]"
            >
              <div>
                <h3 className="text-[26px] leading-[1.1] font-normal text-[#1b1b1b]">{p.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-[1.5] text-[#55565a]">{p.desc}</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1b1b1b] text-white">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

const BENEFITS = [
  {
    title: "Enhanced Appearance",
    accent: "",
    text: "The most obvious benefit is a more attractive smile.",
    image: IMG_HERO,
    alt: "Cosmetic dentistry shade guide and porcelain dental mirror in warm natural studio light",
  },
  {
    title: "Boosted Confidence",
    accent: "",
    text: "A better smile often leads to increased self-esteem and confidence.",
    image: IMG_ABOUT,
    alt: "Bright minimalist dental consultation suite prepared for smile aesthetic planning",
  },
  {
    title: "Improved Oral Health",
    accent: "",
    text: "Some procedures can help improve your oral health by making cleaning easier.",
    image: IMG_SHOWCASE,
    alt: "Cosmetic dental ceramic models and porcelain shade tabs in warm studio light",
  },
  {
    title: "Long-Lasting Results",
    accent: "",
    text: "Many cosmetic dentistry procedures offer long-term or permanent solutions.",
    image: IMG_HERO,
    alt: "Cosmetic dentistry shade guide and porcelain dental mirror in warm natural studio light",
  },
  {
    title: "Wider Range of Options",
    accent: "",
    text: "There are treatments available for almost every aesthetic issue you might have with your teeth.",
    image: IMG_ABOUT,
    alt: "Bright minimalist dental consultation suite prepared for smile aesthetic planning",
  },
];

export function CosmeticBenefits() {
  return (
    <Section theme="white" space="sm" aria-labelledby="cosmetic-benefits-heading">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h2 id="cosmetic-benefits-heading" className={H2}>
          Benefits of <span className={ACCENT}>Cosmetic Dentistry</span>
        </h2>
      </div>
      <StepsPanel steps={BENEFITS} />
    </Section>
  );
}

const CHOOSING_FACTORS = [
  {
    title: "Experience and Qualifications:",
    desc: "Look for a dentist with specialized training and a portfolio of before-and-after cases.",
  },
  {
    title: "Technology:",
    desc: "Opt for a clinic that uses the latest technology for more precise and effective treatments.",
  },
  {
    title: "Reviews and Testimonials:",
    desc: "Customer reviews can provide valuable insights into patient satisfaction and quality of service.",
  },
  {
    title: "Consultation:",
    desc: "A thorough initial consultation is a good sign of a dentist’s professionalism and concern for your needs.",
  },
];

export function CosmeticCosts() {
  return (
    <Section id="financing" theme="white" aria-labelledby="cosmetic-financing-heading">
      <div className="mx-auto max-w-[900px]">
        <h2 id="cosmetic-financing-heading" className={H2}>
          Costs and <span className={ACCENT}>Financing</span>
        </h2>
        <p className="mt-4 max-w-2xl text-lead text-muted">
          The cost of cosmetic dentistry varies widely depending on the type of procedure, the
          expertise of the dentist, and geographic location. While many cosmetic procedures are not
          covered by dental insurance, financing options are often available.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <BookButton>Book Appointment</BookButton>
          <ButtonLink to="/pricing" variant="outline">
            View Pricing
          </ButtonLink>
        </div>

        <h3 className="mt-20 text-[clamp(28px,3vw,40px)] leading-[1.1] font-normal tracking-[-0.02em] text-[#2a2a2c]">
          How to Choose a <span className={ACCENT}>General Dentist</span>
        </h3>
        <ol className="mt-8 grid list-none gap-3 sm:grid-cols-2">
          {CHOOSING_FACTORS.map((f, i) => (
            <li key={f.title} className="rounded-[20px] bg-[#f6efe4] p-6">
              <span className="text-[13px] text-[#6b6b70] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-[15px] leading-[1.5] text-[#55565a]">
                <strong className="block text-[18px] font-medium text-[#1b1b1b]">{f.title}</strong>
                {f.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function CosmeticQuestion() {
  return (
    <Section theme="white" space="sm" aria-label="Is cosmetic dentistry right for you?">
      <DarkQuestion
        lead="Could cosmetic dentistry be"
        highlight="right for you?"
        text="If you are unhappy with the color, alignment, spacing, size, or shape of your teeth, talk to our team about your options."
        chips={["Color", "Alignment", "Spacing", "Size and shape"]}
        cta={
          <ButtonLink href="#contact" variant="gold">
            Get in touch
          </ButtonLink>
        }
      />
    </Section>
  );
}
