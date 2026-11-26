import { BookButton, Section, SectionHead, WhyCards } from "@/components/hims";

const VALUES = [
  {
    title: "Wholehearted Commitment",
    desc: "Our motivation stems from a genuine desire to provide the best care, rather than being driven by sales incentives.",
  },
  {
    title: "Expert Guidance",
    desc: "We take immense pride in delivering expert advice and guidance to our valued clients.",
  },
  {
    title: "Quality Assurance",
    desc: "Our unwavering commitment lies in using the utmost quality products, with no room for compromise.",
  },
] as const;

export function AestheticsValues() {
  return (
    <Section theme="white" aria-labelledby="aesthetics-values-heading">
      <SectionHead
        id="aesthetics-values-heading"
        title="Our Values"
        action={<BookButton>Book Now</BookButton>}
      />
      <div className="mt-10">
        <WhyCards
          items={VALUES.map((v) => {
            const [lead, ...rest] = v.title.split(" ");
            return { lead, rest: rest.join(" "), text: v.desc };
          })}
        />
      </div>
    </Section>
  );
}
